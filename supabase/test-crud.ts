import { fetchData, insertData, updateData, deleteData, fetchFilteredData, CrudResponse } from './utils';

/**
 * Função para testar as operações CRUD
 */
async function testCrudOperations() {
  console.log('Iniciando testes de operações CRUD...\n');

  // Teste de fetchData
  console.log('1. Testando fetchData (buscar todos os registros):');
  const fetchResult = await fetchData('priorities');
  logResult(fetchResult);

  // Teste de insertData
  console.log('\n2. Testando insertData (inserir novo registro):');
  const newPriority = {
    title: 'Teste de CRUD',
    description: 'Prioridade criada para testar as operações CRUD',
    status: 'pendente',
    user_id: '00000000-0000-0000-0000-000000000000' // Substitua por um ID de usuário válido
  };
  const insertResult = await insertData('priorities', newPriority);
  logResult(insertResult);

  // Se a inserção foi bem-sucedida, continua com os testes
  if (insertResult.success && insertResult.data) {
    const newId = insertResult.data.id;

    // Teste de updateData
    console.log('\n3. Testando updateData (atualizar registro):');
    const updateResult = await updateData('priorities', newId, {
      title: 'Teste de CRUD - Atualizado',
      status: 'concluído'
    });
    logResult(updateResult);

    // Teste de fetchFilteredData
    console.log('\n4. Testando fetchFilteredData (buscar registros filtrados):');
    const filteredResult = await fetchFilteredData('priorities', 'id', newId);
    logResult(filteredResult);

    // Teste de deleteData
    console.log('\n5. Testando deleteData (remover registro):');
    const deleteResult = await deleteData('priorities', newId);
    logResult(deleteResult);
  }

  // Teste com tabela inexistente
  console.log('\n6. Testando fetchData com tabela inexistente:');
  const invalidTableResult = await fetchData('tabela_inexistente');
  logResult(invalidTableResult);

  // Teste com ID inexistente
  console.log('\n7. Testando updateData com ID inexistente:');
  const invalidIdResult = await updateData('priorities', '00000000-0000-0000-0000-000000000000', {
    title: 'Teste com ID inexistente'
  });
  logResult(invalidIdResult);

  console.log('\nTestes de operações CRUD concluídos!');
}

/**
 * Função auxiliar para exibir os resultados de forma organizada
 */
function logResult<T>(result: CrudResponse<T>) {
  console.log(`Sucesso: ${result.success}`);
  
  if (result.message) {
    console.log(`Mensagem: ${result.message}`);
  }
  
  if (result.error) {
    console.log(`Erro: ${result.error}`);
    if (result.status) {
      console.log(`Status: ${result.status}`);
    }
  }
  
  if (result.data) {
    console.log('Dados:');
    console.log(JSON.stringify(result.data, null, 2));
  }
}

// Executa os testes
testCrudOperations().catch(error => {
  console.error('Erro ao executar testes:', error);
}); 