const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
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

// Lista de arquivos SQL para instalar
const sqlFiles = [
  {
    name: 'exec_sql',
    path: path.join(__dirname, 'create_exec_sql_function.sql')
  },
  {
    name: 'check_policy_exists',
    path: path.join(__dirname, 'create_check_policy_function.sql')
  }
];

// Função para executar SQL no Supabase diretamente via API REST
async function executeSqlViaRest(sql) {
  try {
    console.log('Executando SQL via API REST...');
    
    // URL para o endpoint SQL do Supabase
    const url = `${supabaseUrl}/rest/v1/rpc/exec_sql`;
    
    // Executa o SQL via API REST
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        sql
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro ao executar SQL via API REST:', errorText);
      return false;
    }
    
    console.log('SQL executado com sucesso via API REST');
    return true;
  } catch (error) {
    console.error('Erro ao executar SQL via API REST:', error);
    return false;
  }
}

// Instala as funções SQL
async function installSqlFunctions() {
  console.log('Instalando funções SQL...');
  
  // Primeiro, tenta criar a função exec_sql diretamente
  const execSqlContent = fs.readFileSync(sqlFiles[0].path, 'utf8');
  
  try {
    // Executa a criação da função exec_sql diretamente
    console.log('Criando função exec_sql...');
    
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: execSqlContent 
    });
    
    if (error) {
      console.error('Erro ao criar função exec_sql:', error);
      console.log('A função exec_sql pode já existir ou precisar ser criada manualmente.');
      console.log('Acesse o Painel Admin do Supabase > SQL Editor e execute o conteúdo de create_exec_sql_function.sql');
    } else {
      console.log('Função exec_sql criada com sucesso');
    }
  } catch (error) {
    console.error('Erro ao tentar criar exec_sql:', error);
    console.log('A função exec_sql precisa ser criada manualmente.');
    console.log('Acesse o Painel Admin do Supabase > SQL Editor e execute o conteúdo de create_exec_sql_function.sql');
  }
  
  // Agora, tenta criar a função check_policy_exists
  const checkPolicyContent = fs.readFileSync(sqlFiles[1].path, 'utf8');
  
  try {
    // Tenta executar usando a função exec_sql (assumindo que já existe)
    console.log('Criando função check_policy_exists...');
    
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: checkPolicyContent 
    });
    
    if (error) {
      console.error('Erro ao criar função check_policy_exists:', error);
      console.log('Tente criar a função manualmente no Painel Admin do Supabase > SQL Editor');
    } else {
      console.log('Função check_policy_exists criada com sucesso');
    }
  } catch (error) {
    console.error('Erro ao criar função check_policy_exists:', error);
    console.log('Tente criar a função manualmente no Painel Admin do Supabase > SQL Editor');
  }
  
  console.log('\nProcesso de instalação de funções SQL concluído.');
  console.log('Se houver erros, as funções precisarão ser instaladas manualmente.');
  console.log('Acesse o Painel Admin do Supabase > SQL Editor e execute o conteúdo dos arquivos:');
  console.log(' - create_exec_sql_function.sql');
  console.log(' - create_check_policy_function.sql');
}

// Executar o script
async function main() {
  try {
    await installSqlFunctions();
  } catch (error) {
    console.error('Erro durante a instalação das funções SQL:', error);
    process.exit(1);
  }
}

// Se este arquivo for executado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  installSqlFunctions
}; 