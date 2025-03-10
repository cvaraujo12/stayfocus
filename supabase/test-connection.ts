import { supabase, testSupabaseConnection } from './client.js';
import { checkConnection } from './utils.js';

type TestResult = {
  name: string;
  success: boolean;
  message: string;
  error?: string;
};

function logTestResult(result: TestResult) {
  const status = result.success ? '✅' : '❌';
  console.log(`\n${status} ${result.name}`);
  console.log(`Resultado: ${result.message}`);
  if (result.error) {
    console.log(`Erro: ${result.error}`);
  }
}

// Função para testar a conexão com o Supabase
async function runConnectionTest() {
  console.log('Iniciando testes de conexão e sincronização...');
  const results: TestResult[] = [];
  
  try {
    // 1. Teste básico de conexão
    const result = await testSupabaseConnection();
    results.push({
      name: 'Teste de Conexão Básica',
      success: true,
      message: result.message
    });

    // 2. Teste de verificação de status online/offline
    const connectionStatus = await checkConnection();
    results.push({
      name: 'Verificação de Status Online/Offline',
      success: true,
      message: `Status de conexão: ${connectionStatus.online ? 'Online' : 'Offline'}`
    });
    
    // 3. Teste de acesso à tabela de usuários
    try {
      const { data: users, error } = await supabase.from('users').select('*').limit(1);
      results.push({
        name: 'Acesso à Tabela de Usuários',
        success: !error,
        message: error ? 'Falha ao acessar tabela de usuários' : 'Acesso à tabela bem-sucedido',
        error: error?.message
      });
    } catch (err) {
      results.push({
        name: 'Acesso à Tabela de Usuários',
        success: false,
        message: 'Erro ao tentar acessar tabela de usuários',
        error: err instanceof Error ? err.message : 'Erro desconhecido'
      });
    }
    
    // 4. Teste de autenticação
    try {
      const { data: authData, error: authError } = await supabase.auth.getSession();
      results.push({
        name: 'Verificação de Autenticação',
        success: !authError,
        message: authError ? 'Falha ao verificar autenticação' : `Sessão ${authData.session ? 'ativa' : 'inativa'}`,
        error: authError?.message
      });
    } catch (err) {
      results.push({
        name: 'Verificação de Autenticação',
        success: false,
        message: 'Erro ao verificar autenticação',
        error: err instanceof Error ? err.message : 'Erro desconhecido'
      });
    }

    // 5. Teste de armazenamento local (skip em ambiente Node.js)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('test-connection', 'test');
        localStorage.removeItem('test-connection');
        results.push({
          name: 'Teste de Armazenamento Local',
          success: true,
          message: 'Armazenamento local funcionando corretamente'
        });
      } catch (err) {
        results.push({
          name: 'Teste de Armazenamento Local',
          success: false,
          message: 'Falha no acesso ao armazenamento local',
          error: err instanceof Error ? err.message : 'Erro desconhecido'
        });
      }
    } else {
      results.push({
        name: 'Teste de Armazenamento Local',
        success: true,
        message: 'Teste ignorado em ambiente Node.js'
      });
    }
    
  } catch (error) {
    results.push({
      name: 'Teste Geral',
      success: false,
      message: 'Erro durante a execução dos testes',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }

  // Exibir resultados
  console.log('\nResultados dos Testes:');
  results.forEach(result => logTestResult(result));

  // Resumo final
  const totalTests = results.length;
  const successfulTests = results.filter(r => r.success).length;
  console.log(`\nResumo: ${successfulTests}/${totalTests} testes bem-sucedidos`);
}

// Executar o teste se este arquivo for executado diretamente
if (import.meta.url === new URL(import.meta.url).href) {
  runConnectionTest().finally(() => {
    console.log('\nTestes de conexão finalizados.');
  });
}

export { runConnectionTest }; 