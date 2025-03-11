const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Verificação de variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Erro: Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessárias');
  process.exit(1);
}

// Criar cliente Supabase com chave de serviço para acesso admin
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Função para executar SQL diretamente via API REST
async function executeSqlWithRest(sql) {
  try {
    console.log('Executando SQL via API REST...');
    
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'X-Client-Info': 'supabase-js/2.0.0',
        'apikey': supabaseServiceKey,
      },
      body: JSON.stringify({
        query: sql,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erro ao executar SQL: ${error}`);
    }
    
    console.log('SQL executado com sucesso via API REST!');
    return true;
  } catch (error) {
    console.error('Erro ao executar SQL via REST:', error);
    return false;
  }
}

// Função para verificar se as tabelas foram criadas
async function verifyTables() {
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (error) {
      console.error('Erro ao verificar tabelas:', error.message);
      return null;
    }
    
    const tables = data.map(t => t.table_name);
    
    // Mapear as tabelas que esperamos ter criado
    const expectedTables = [
      'self_knowledge_notes',
      'study_sessions',
      'sleep_records',
      'medication_logs'
    ];
    
    const result = {};
    
    for (const table of expectedTables) {
      result[table] = tables.includes(table);
    }
    
    return result;
  } catch (error) {
    console.error('Erro ao verificar tabelas:', error);
    return null;
  }
}

// Função principal
async function main() {
  try {
    console.log('Criando tabelas faltantes no Supabase...');
    
    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, 'create_missing_tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Executar o SQL
    const success = await executeSqlWithRest(sql);
    
    if (success) {
      console.log('Script de criação de tabelas executado com sucesso!');
      
      // Verificar tabelas criadas
      console.log('\nVerificando tabelas criadas:');
      const tablesStatus = await verifyTables();
      
      if (tablesStatus) {
        console.log('Resultado da verificação:');
        console.log(tablesStatus);
        
        const allTablesCreated = Object.values(tablesStatus).every(status => status === true);
        
        if (allTablesCreated) {
          console.log('\nTodas as tabelas foram criadas com sucesso!');
        } else {
          console.log('\nAlgumas tabelas não foram criadas:');
          Object.entries(tablesStatus).forEach(([table, exists]) => {
            if (!exists) {
              console.log(`- ${table}: Não criada`);
            }
          });
        }
      }
      
      console.log('Processo concluído com sucesso!');
    } else {
      console.error('Falha ao executar o script de criação de tabelas.');
    }
  } catch (error) {
    console.error('Erro durante a execução:', error);
  }
}

// Executar o script
main(); 