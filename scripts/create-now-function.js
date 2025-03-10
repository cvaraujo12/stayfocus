// Script para criar a função RPC "now" no Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuração das credenciais do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Credenciais do Supabase não encontradas em variáveis de ambiente');
  console.log('Por favor, defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no arquivo .env');
  process.exit(1);
}

// Inicializar cliente Supabase com chave de serviço para acesso administrativo
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Criar função RPC "now" para verificar conexão
const createNowFunction = async () => {
  console.log('🔧 Criando função RPC "now" para verificação de conexão...');

  // SQL para criar a função RPC
  const { error } = await supabase.rpc('exec_sql', {
    query: `
      -- Função simples que retorna o timestamp atual
      -- Útil para verificar se a conexão com o Supabase está funcionando
      CREATE OR REPLACE FUNCTION now()
      RETURNS TIMESTAMPTZ
      LANGUAGE SQL
      SECURITY DEFINER
      AS $$
        SELECT NOW();
      $$;
      
      -- Garante que a função é acessível para todos os usuários
      GRANT EXECUTE ON FUNCTION now() TO PUBLIC;
    `
  });

  if (error) {
    console.error('❌ Erro ao criar função RPC "now":', error.message);
    return;
  }

  console.log('✅ Função RPC "now" criada com sucesso!');
  console.log('🔗 Agora é possível verificar a conexão com o Supabase.');
};

// Executar a criação da função
createNowFunction()
  .catch(err => {
    console.error('❌ Erro não tratado:', err);
    process.exit(1);
  }); 