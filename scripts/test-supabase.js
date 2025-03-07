// Importar o dotenv para carregar as variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

// Importar o cliente Supabase
const { createClient } = require('@supabase/supabase-js');

// Configuração das credenciais do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verificar se as credenciais estão definidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Erro: Credenciais do Supabase não encontradas no arquivo .env.local');
  console.error('Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY estão definidos');
  process.exit(1);
}

// Criar o cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função para testar a conexão com o Supabase
async function testConnection() {
  console.log('Iniciando teste de conexão com o Supabase...');
  console.log(`URL: ${supabaseUrl}`);
  
  try {
    // Teste básico de conexão
    const { data, error, status } = await supabase.from('users').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Erro ao conectar com o Supabase:', error.message);
      console.error('Código de status:', status);
      process.exit(1);
    }
    
    console.log('✅ Conexão com o Supabase estabelecida com sucesso!');
    
    // Verificar se podemos acessar a autenticação
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('Erro ao acessar a autenticação:', authError.message);
    } else {
      console.log('✅ Acesso à autenticação bem-sucedido!');
      console.log('Sessão atual:', authData.session ? 'Ativa' : 'Inativa');
    }
    
    console.log('\nTeste concluído com sucesso! O cliente Supabase está configurado corretamente.');
    
  } catch (error) {
    console.error('Erro durante o teste de conexão:', error);
    process.exit(1);
  }
}

// Executar o teste
testConnection(); 