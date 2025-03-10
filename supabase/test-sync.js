const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const crypto = require('crypto');

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

// Função para testar a conexão com o Supabase
async function testConnection() {
  try {
    const { data, error } = await supabase.from('users').select('count').single();
    
    if (error) {
      console.error('Erro ao conectar com o Supabase:', error.message);
      return false;
    }
    
    console.log('Conexão com o Supabase estabelecida com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao testar conexão com o Supabase:', error);
    return false;
  }
}

// Função para verificar se as tabelas necessárias existem
async function checkTables() {
  const tables = [
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
  
  console.log('Verificando tabelas...');
  
  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(1);
    
    if (error && error.code === '42P01') {
      console.error(`Tabela '${table}' não existe!`);
    } else if (error) {
      console.error(`Erro ao verificar tabela '${table}':`, error.message);
    } else {
      console.log(`Tabela '${table}' existe.`);
    }
  }
}

// Função para testar a inserção de dados
async function testInsert() {
  console.log('Testando inserção de dados...');
  
  // Cria um usuário de teste com UUID válido
  const userId = crypto.randomUUID();
  
  // Insere um usuário de teste
  const { error: userError } = await supabase
    .from('users')
    .insert({
      id: userId,
      name: 'Usuário de Teste',
      email: `test-${Date.now()}@example.com`
    });
  
  if (userError) {
    console.error('Erro ao inserir usuário de teste:', userError.message);
    return false;
  }
  
  // Insere uma tarefa de teste
  const { error: taskError } = await supabase
    .from('priorities')
    .insert({
      title: 'Tarefa de teste',
      description: 'Esta é uma tarefa de teste para verificar a sincronização',
      status: 'pendente',
      user_id: userId
    });
  
  if (taskError) {
    console.error('Erro ao inserir tarefa de teste:', taskError.message);
    return false;
  }
  
  console.log('Dados inseridos com sucesso!');
  return true;
}

// Função para testar a recuperação de dados
async function testFetch() {
  console.log('Testando recuperação de dados...');
  
  const { data, error } = await supabase
    .from('priorities')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (error) {
    console.error('Erro ao recuperar dados:', error.message);
    return false;
  }
  
  console.log('Últimas 5 tarefas:');
  console.table(data);
  
  return true;
}

// Função principal para executar os testes
async function runTests() {
  console.log('Iniciando testes de sincronização...');
  
  // Testa a conexão
  const connected = await testConnection();
  if (!connected) {
    console.error('Falha ao conectar com o Supabase. Abortando testes.');
    process.exit(1);
  }
  
  // Verifica as tabelas
  await checkTables();
  
  // Testa a inserção de dados
  const inserted = await testInsert();
  if (!inserted) {
    console.error('Falha ao inserir dados. Abortando testes.');
    process.exit(1);
  }
  
  // Testa a recuperação de dados
  const fetched = await testFetch();
  if (!fetched) {
    console.error('Falha ao recuperar dados. Abortando testes.');
    process.exit(1);
  }
  
  console.log('Todos os testes concluídos com sucesso!');
}

// Executa os testes
runTests().catch(error => {
  console.error('Erro durante a execução dos testes:', error);
  process.exit(1); 
}); 