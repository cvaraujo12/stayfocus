import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

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
    const sqlFilePath = path.join(__dirname, 'migrations', 'create_tables.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('Executando script SQL no Supabase...');
    
    // Divide o script SQL em comandos individuais
    const sqlCommands = sqlContent.split(';').filter(cmd => cmd.trim() !== '');
    
    // Executa cada comando SQL separadamente
    for (const command of sqlCommands) {
      const { data, error } = await supabase.rpc('exec_sql', { sql: command + ';' });
      
      if (error) {
        console.error('Erro ao executar SQL:', error);
        console.error('Comando SQL que falhou:', command);
        // Continua mesmo com erro para tentar executar os outros comandos
      } else {
        console.log('Comando SQL executado com sucesso');
      }
    }
    
    console.log('Script SQL executado com sucesso!');
    
  } catch (error) {
    console.error('Erro ao executar o script:', error);
    process.exit(1);
  }
}

// Alternativa usando a API REST do Supabase
async function executeSqlViaRest() {
  try {
    // Lê o arquivo SQL
    const sqlFilePath = path.join(__dirname, 'migrations', 'create_tables.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('Executando script SQL no Supabase via API REST...');
    
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
      process.exit(1);
    }
    
    console.log('Script SQL executado com sucesso via API REST!');
    
  } catch (error) {
    console.error('Erro ao executar o script via API REST:', error);
    process.exit(1);
  }
}

// Tenta executar o SQL usando o cliente Supabase
executeSqlFile().catch(error => {
  console.error('Falha ao executar SQL via cliente Supabase:', error);
  console.log('Tentando executar via API REST...');
  
  // Se falhar, tenta executar via API REST
  executeSqlViaRest().catch(error => {
    console.error('Falha ao executar SQL via API REST:', error);
    process.exit(1);
  });
}); 