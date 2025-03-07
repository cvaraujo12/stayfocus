const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Carrega as variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Erro: Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessárias');
  process.exit(1);
}

// Cria o cliente Supabase com a chave de serviço para ter permissões administrativas
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Lista de tabelas que devem existir
const expectedTables = [
  'users',
  'priorities',
  'notes',
  'sessions',
  'medications',
  'moods',
  'expenses',
  'projects',
  'sleep_logs'
];

// Função para verificar se uma tabela existe
async function checkTableExists(tableName) {
  try {
    const { data, error } = await supabase.from(tableName).select('*').limit(1);
    
    if (error && error.code === '42P01') {
      return { exists: false, message: `A tabela '${tableName}' não existe.` };
    } else if (error) {
      return { exists: false, message: `Erro ao verificar a tabela '${tableName}': ${error.message}` };
    }
    
    return { exists: true, message: `A tabela '${tableName}' existe.` };
  } catch (error) {
    return { exists: false, message: `Erro ao verificar a tabela '${tableName}': ${error.message}` };
  }
}

// Função para verificar se uma política existe
async function checkPolicyExists(tableName, policyName) {
  try {
    // Consulta para verificar se a política existe
    const { data, error } = await supabase.rpc('check_policy_exists', {
      table_name: tableName,
      policy_name: policyName
    });
    
    if (error) {
      return { exists: false, message: `Erro ao verificar a política '${policyName}' na tabela '${tableName}': ${error.message}` };
    }
    
    return { 
      exists: data, 
      message: data 
        ? `A política '${policyName}' na tabela '${tableName}' existe.` 
        : `A política '${policyName}' na tabela '${tableName}' não existe.` 
    };
  } catch (error) {
    return { exists: false, message: `Erro ao verificar a política '${policyName}' na tabela '${tableName}': ${error.message}` };
  }
}

// Função para verificar todas as tabelas
async function verifyAllTables() {
  console.log('Verificando tabelas no Supabase...\n');
  
  let allTablesExist = true;
  
  for (const tableName of expectedTables) {
    const result = await checkTableExists(tableName);
    console.log(result.message);
    
    if (!result.exists) {
      allTablesExist = false;
    }
  }
  
  console.log('\nVerificando políticas de segurança...\n');
  
  // Verifica se a função check_policy_exists existe
  try {
    const { data, error } = await supabase.rpc('check_policy_exists', {
      table_name: 'users',
      policy_name: 'Usuários podem ver apenas seus próprios dados'
    });
    
    if (error && error.code === '42883') {
      console.log('A função check_policy_exists não existe. Pulando verificação de políticas.');
    } else {
      // Verifica algumas políticas importantes
      const policies = [
        { table: 'users', policy: 'Usuários podem ver apenas seus próprios dados' },
        { table: 'priorities', policy: 'Usuários podem ver apenas suas próprias prioridades' },
        { table: 'notes', policy: 'Usuários podem ver apenas suas próprias notas' }
      ];
      
      for (const { table, policy } of policies) {
        const result = await checkPolicyExists(table, policy);
        console.log(result.message);
      }
    }
  } catch (error) {
    console.log('Erro ao verificar políticas:', error.message);
  }
  
  console.log('\nResumo da verificação:');
  if (allTablesExist) {
    console.log('✅ Todas as tabelas necessárias existem no Supabase.');
  } else {
    console.log('❌ Algumas tabelas estão faltando. Execute o script SQL para criar todas as tabelas.');
  }
  
  return allTablesExist;
}

// Executa a verificação
verifyAllTables()
  .then(success => {
    if (success) {
      console.log('\nVerificação concluída com sucesso!');
      process.exit(0);
    } else {
      console.error('\nVerificação concluída com erros.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Erro fatal:', error);
    process.exit(1);
  }); 