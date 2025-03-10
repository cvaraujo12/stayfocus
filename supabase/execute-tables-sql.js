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

// Função para executar SQL via API REST do Supabase SQL
async function executeSqlViaRest(sqlQuery) {
  try {
    console.log('Executando SQL via API REST...');
    
    // URL para o endpoint SQL do Supabase
    const url = `${supabaseUrl}/rest/v1/`;
    
    // Prepara os headers da requisição
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'apikey': supabaseServiceKey,
      'Prefer': 'resolution=merge-duplicates'
    };
    
    // Faz a requisição para o endpoint SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        sql: sqlQuery
      })
    });
    
    if (!response.ok) {
      // Se não conseguiu executar exec_sql, tenta instalar a função
      if (response.status === 404) {
        console.log('Função exec_sql não encontrada. Tentando criar...');
        return await createExecSqlFunction();
      }
      
      const errorText = await response.text();
      console.error('Erro ao executar SQL via API REST:', errorText);
      return false;
    }
    
    console.log('SQL executado com sucesso via API REST!');
    return true;
    
  } catch (error) {
    console.error('Erro ao executar o script via API REST:', error);
    return false;
  }
}

// Função para criar a função exec_sql no banco de dados
async function createExecSqlFunction() {
  try {
    console.log('Criando função exec_sql...');
    
    // SQL para criar a função exec_sql
    const createFunctionSql = `
    CREATE OR REPLACE FUNCTION exec_sql(sql text)
    RETURNS jsonb
    LANGUAGE plpgsql
    SECURITY DEFINER -- Executa com os privilégios do criador da função
    AS $$
    DECLARE
      result jsonb;
    BEGIN
      -- Executa o comando SQL
      EXECUTE sql;
      
      -- Retorna um objeto JSON vazio como resultado
      result := '{}'::jsonb;
      
      RETURN result;
    EXCEPTION
      WHEN OTHERS THEN
        -- Captura qualquer erro e o retorna como JSON
        result := jsonb_build_object(
          'error', SQLERRM,
          'state', SQLSTATE,
          'context', 'Erro ao executar SQL: ' || sql
        );
        
        RETURN result;
    END;
    $$;

    -- Comentário para documentação
    COMMENT ON FUNCTION exec_sql(text) IS 'Execute SQL commands with elevated privileges. USE WITH CAUTION.';

    -- Garante que apenas os administradores podem executar esta função
    REVOKE ALL ON FUNCTION exec_sql(text) FROM PUBLIC;
    GRANT EXECUTE ON FUNCTION exec_sql(text) TO postgres;
    `;
    
    // Tenta criar a função usando a API SQL direta do Supabase
    const url = `${supabaseUrl}/rest/v1/sql`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({
        query: createFunctionSql
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro ao criar função exec_sql:', errorText);
      console.log('\nVocê precisa criar a função exec_sql manualmente no Painel do Supabase:');
      console.log('1. Acesse o SQL Editor');
      console.log('2. Cole o seguinte SQL:');
      console.log(createFunctionSql);
      console.log('3. Execute o SQL');
      return false;
    }
    
    console.log('Função exec_sql criada com sucesso!');
    return true;
    
  } catch (error) {
    console.error('Erro ao criar função exec_sql:', error);
    return false;
  }
}

// Função para executar o script SQL de criação de tabelas
async function executeTableCreationScript() {
  try {
    // Lê o arquivo SQL
    const sqlFilePath = path.join(__dirname, 'create_tarefas_table.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('Criando tabelas no Supabase...');
    
    // Tenta primeiro checar se a função exec_sql existe
    let execSqlExists = false;
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql: 'SELECT 1;' });
      execSqlExists = !error;
    } catch (e) {
      execSqlExists = false;
    }
    
    // Se a função não existe, tenta criá-la
    if (!execSqlExists) {
      const functionCreated = await createExecSqlFunction();
      if (!functionCreated) {
        console.error('Não foi possível criar a função exec_sql. Por favor, siga as instruções acima para criá-la manualmente.');
        return false;
      }
    }
    
    // Agora tenta executar o script SQL usando exec_sql
    const result = await executeSqlViaRest(sqlContent);
    
    if (result) {
      console.log('Script de criação de tabelas executado com sucesso!');
      
      // Verifica se as tabelas foram criadas
      console.log('\nVerificando tabelas criadas:');
      
      try {
        const { data, error } = await supabase.rpc('check_tables_exist');
        
        if (error) {
          console.error('Erro ao verificar tabelas:', error);
        } else {
          console.log('Resultado da verificação:');
          console.log(data);
          
          // Verifica se todas as tabelas foram criadas
          const allTablesCreated = Object.values(data).every(exists => exists === true);
          
          if (allTablesCreated) {
            console.log('\nTodas as tabelas foram criadas com sucesso!');
          } else {
            console.log('\nAlgumas tabelas não foram criadas. Verifique o resultado acima.');
          }
        }
      } catch (verifyError) {
        console.error('Erro ao verificar tabelas:', verifyError);
      }
      
      return true;
    } else {
      console.error('Falha ao executar script de criação de tabelas.');
      return false;
    }
    
  } catch (error) {
    console.error('Erro ao executar o script de criação de tabelas:', error);
    return false;
  }
}

// Executa o script
executeTableCreationScript()
  .then(success => {
    if (success) {
      console.log('Processo concluído com sucesso!');
    } else {
      console.error('Processo concluído com erros. Verifique as mensagens acima.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Erro fatal:', error);
    process.exit(1);
  }); 