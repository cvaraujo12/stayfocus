import { supabase, testSupabaseConnection } from './client';

// Função para testar a conexão com o Supabase
async function runConnectionTest() {
  console.log('Iniciando teste de conexão com o Supabase...');
  
  try {
    // Teste básico de conexão
    const result = await testSupabaseConnection();
    console.log(result.message);
    
    // Teste adicional para verificar se podemos acessar a tabela de usuários
    const { data: users, error } = await supabase.from('users').select('*').limit(1);
    
    if (error) {
      console.error('Erro ao buscar usuários:', error.message);
    } else {
      console.log('Dados de usuários recuperados com sucesso!');
      console.log('Número de usuários encontrados:', users.length);
    }
    
    // Verificar se podemos acessar a autenticação
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('Erro ao acessar a autenticação:', authError.message);
    } else {
      console.log('Acesso à autenticação bem-sucedido!');
      console.log('Sessão atual:', authData.session ? 'Ativa' : 'Inativa');
    }
    
  } catch (error) {
    console.error('Erro durante o teste de conexão:', error);
  }
}

// Executar o teste se este arquivo for executado diretamente
if (typeof window !== 'undefined') {
  console.log('Este script deve ser executado no ambiente Node.js, não no navegador.');
} else {
  runConnectionTest();
}

export { runConnectionTest }; 