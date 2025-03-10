import { insertData, updateData, deleteData, fetchFilteredData, checkConnection } from './utils.js';

// Configurar ambiente para testes
const setupTestEnvironment = () => {
  // Verificar se estamos em ambiente Node.js
  if (typeof window === 'undefined') {
    console.log('\nExecutando em ambiente Node.js');
  } else {
    console.log('\nExecutando em ambiente Browser');
  }
};

type TestResult = {
  name: string;
  success: boolean;
  message: string;
  error?: string;
  data?: any;
};

function logTestResult(result: TestResult) {
  const status = result.success ? '✅' : '❌';
  const separator = '─'.repeat(50);
  
  console.log(`\n${separator}`);
  console.log(`${status} ${result.name}`);
  console.log(`Resultado: ${result.message}`);
  
  if (result.error) {
    console.log('\nErro:');
    console.log(`  ${result.error}`);
  }
  
  if (result.data) {
    console.log('\nDados:');
    console.log(JSON.stringify(result.data, null, 2));
  }
  
  console.log(separator);
}

/**
 * Função para testar as operações CRUD básicas
 * 
 * Este teste verifica:
 * 1. Conexão com o Supabase
 * 2. Operações CRUD básicas (Create, Read, Update, Delete)
 * 3. Tratamento de erros
 */
async function testCrudOperations() {
  const results: TestResult[] = [];
  console.log('Iniciando testes de operações CRUD...\n');

  try {
    // Verificar conexão
    const { online } = await checkConnection();
    results.push({
      name: 'Verificação de Conexão',
      success: online,
      message: `Status de conexão: ${online ? 'Online' : 'Offline'}`
    });

    if (!online) {
      throw new Error('Não foi possível conectar ao Supabase');
    }

    // Criar nova prioridade
    const newPriority = {
      title: 'Teste de CRUD',
      description: 'Prioridade criada para testar as operações CRUD',
      status: 'pendente',
      user_id: '00000000-0000-0000-0000-000000000000'
    };

    const insertResult = await insertData('priorities', newPriority);
    if (!insertResult.success) {
      throw new Error(`Falha na inserção: ${insertResult.error}`);
    }

    results.push({
      name: 'Inserção de Dados',
      success: true,
      message: 'Prioridade criada com sucesso',
      data: insertResult.data
    });

    const newId = insertResult.data.id;

    // Buscar dados filtrados
    const filteredResult = await fetchFilteredData('priorities', 'id', newId);
    if (!filteredResult.success) {
      throw new Error(`Falha na busca: ${filteredResult.error}`);
    }

    results.push({
      name: 'Busca Filtrada',
      success: true,
      message: 'Prioridade encontrada com sucesso',
      data: filteredResult.data
    });

    // Atualizar prioridade
    const updateResult = await updateData('priorities', newId, {
      title: 'Teste de CRUD - Atualizado',
      status: 'concluído'
    });

    if (!updateResult.success) {
      throw new Error(`Falha na atualização: ${updateResult.error}`);
    }

    results.push({
      name: 'Atualização de Dados',
      success: true,
      message: 'Prioridade atualizada com sucesso',
      data: updateResult.data
    });

    // Remover dados
    const deleteResult = await deleteData('priorities', newId);
    if (!deleteResult.success) {
      throw new Error(`Falha na remoção: ${deleteResult.error}`);
    }

    results.push({
      name: 'Remoção de Dados',
      success: true,
      message: 'Prioridade removida com sucesso'
    });

  } catch (error) {
    console.error('\nErro durante os testes:', error);
    results.push({
      name: 'Erro nos Testes',
      success: false,
      message: 'Falha durante a execução dos testes',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }

  // Exibir resultados
  const totalTests = results.length;
  const successfulTests = results.filter(r => r.success).length;
  const failedTests = totalTests - successfulTests;
  
  console.log('\n═════════════════════════════════════════════════════');
  console.log('              RESULTADOS DOS TESTES              ');
  console.log('═════════════════════════════════════════════════');
  
  results.forEach(result => logTestResult(result));
  
  // Resumo final
  console.log('\n═════════════════════════════════════════════════════');
  console.log('                    RESUMO                      ');
  console.log('═════════════════════════════════════════════════');
  console.log(`Total de Testes: ${totalTests}`);
  console.log(`Testes Bem-sucedidos: ${successfulTests}`);
  console.log(`Testes Falhos: ${failedTests}`);
  
  if (failedTests > 0) {
    console.log('\nℹ️  Revise os erros acima para mais detalhes.');
  }
}

// Função principal para executar os testes
const runTests = async () => {
  setupTestEnvironment();
  await testCrudOperations();
};

// Executa os testes se este arquivo for executado diretamente
if (import.meta.url === import.meta.resolve('./test-crud.ts')) {
  runTests().catch(error => {
    console.error('\nErro fatal durante a execução dos testes:', error);
    process.exit(1);
  });
}

export { testCrudOperations, runTests };