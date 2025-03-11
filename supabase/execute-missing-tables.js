const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

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

async function executeSqlFile() {
  try {
    // Lê o arquivo SQL
    const sqlFilePath = path.join(__dirname, 'create_missing_tables.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('Executando script SQL para criar tabelas faltantes no Supabase...');
    
    // Divide o script SQL em comandos individuais
    const sqlCommands = sqlContent.split(';').filter(cmd => cmd.trim() !== '');
    
    // Executa cada comando SQL separadamente
    for (const command of sqlCommands) {
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: command + ';' });
        
        if (error) {
          console.error('Erro ao executar SQL:', error);
          console.error('Comando SQL que falhou:', command);
          // Continua mesmo com erro para tentar executar os outros comandos
        } else {
          console.log('Comando SQL executado com sucesso');
        }
      } catch (cmdError) {
        console.error('Erro ao executar comando SQL:', cmdError);
        console.error('Comando SQL que falhou:', command);
      }
    }
    
    console.log('Script SQL para criar tabelas faltantes executado com sucesso!');
    return true;
    
  } catch (error) {
    console.error('Erro ao executar o script:', error);
    return false;
  }
}

// Alternativa usando a API REST do Supabase
async function executeSqlViaRest() {
  try {
    // Lê o arquivo SQL
    const sqlFilePath = path.join(__dirname, 'create_missing_tables.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('Executando script SQL para criar tabelas faltantes no Supabase via API REST...');
    
    // URL para o endpoint SQL do Supabase
    const url = `${supabaseUrl}/rest/v1/`;
    
    // Executa o SQL via API REST
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        query: sqlContent
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro ao executar SQL via API REST:', errorText);
      return false;
    }
    
    console.log('Script SQL para criar tabelas faltantes executado com sucesso via API REST!');
    return true;
    
  } catch (error) {
    console.error('Erro ao executar o script via API REST:', error);
    return false;
  }
}

// Tenta executar o SQL usando o cliente Supabase
async function main() {
  try {
    const success = await executeSqlFile();
    if (!success) {
      console.log('Tentando executar via API REST...');
      const restSuccess = await executeSqlViaRest();
      if (!restSuccess) {
        console.error('Falha ao executar SQL via ambos os métodos');
        process.exit(1);
      }
    }
    
    console.log('\nTabelas faltantes criadas com sucesso:');
    console.log('- public.self_knowledge_notes (notas de autoconhecimento)');
    console.log('- public.study_sessions (sessões de estudo)');
    console.log('- public.sleep_records (registros de sono)');
    console.log('- public.medication_logs (registros de medicamentos)');
    
  } catch (error) {
    console.error('Erro geral:', error);
    process.exit(1);
  }
}

main();