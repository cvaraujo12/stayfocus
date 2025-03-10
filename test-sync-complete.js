const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Importa a função para criar usuário de teste
const { createTestUser } = require('./supabase/create-test-user');
const { installSqlFunctions } = require('./supabase/install-functions');

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

// Simula o localStorage do navegador
const mockLocalStorage = {
  store: {},
  getItem(key) {
    return this.store[key];
  },
  setItem(key, value) {
    this.store[key] = value;
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  }
};

// Mock do manager de sincronização
class SyncManager {
  constructor(userId, storage = mockLocalStorage) {
    this.userId = userId;
    this.storage = storage;
    this.queueKey = 'offline_queue';
    this.online = true;
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  // Simula adicionar uma operação à fila offline
  addToOfflineQueue(operation) {
    const queue = this.getOfflineQueue();
    queue.push({
      ...operation,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    });
    this.saveOfflineQueue(queue);
    console.log(`Operação adicionada à fila offline: ${operation.operation} em ${operation.table}`);
  }

  // Obter a fila offline
  getOfflineQueue() {
    const queue = this.storage.getItem(this.queueKey);
    return queue ? JSON.parse(queue) : [];
  }

  // Salvar a fila offline
  saveOfflineQueue(queue) {
    this.storage.setItem(this.queueKey, JSON.stringify(queue));
  }

  // Simula processar a fila offline
  async processSyncQueue() {
    try {
      const queue = this.getOfflineQueue();
      if (queue.length === 0) {
        console.log('Fila de sincronização vazia');
        return { success: true };
      }

      console.log(`Processando ${queue.length} operações da fila...`);
      
      const processedOps = [];
      const failedOps = [];
      
      for (const op of queue) {
        try {
          console.log(`Processando ${op.operation} em ${op.table}...`);
          
          let result;
          switch (op.operation) {
            case 'insert':
              result = await this.supabase.from(op.table).insert(op.payload);
              break;
            case 'update':
              result = await this.supabase.from(op.table).update(op.payload).eq('id', op.payload.id);
              break;
            case 'delete':
              result = await this.supabase.from(op.table).delete().eq('id', op.payload.id);
              break;
          }
          
          if (result.error) {
            console.error(`Erro na operação ${op.operation}:`, result.error);
            failedOps.push({...op, error: result.error});
          } else {
            console.log(`Operação ${op.operation} concluída com sucesso`);
            processedOps.push(op);
          }
        } catch (error) {
          console.error(`Erro ao processar operação ${op.operation}:`, error);
          failedOps.push({...op, error});
        }
      }

      // Remove apenas as operações processadas com sucesso
      const newQueue = queue.filter(op => 
        !processedOps.some(processedOp => processedOp.id === op.id)
      );
      
      this.saveOfflineQueue(newQueue);
      
      console.log('Fila processada.');
      console.log(`Operações bem-sucedidas: ${processedOps.length}`);
      console.log(`Operações com falha: ${failedOps.length}`);
      console.log(`Operações restantes na fila: ${newQueue.length}`);
      
      return { 
        success: true, 
        processed: processedOps.length,
        failed: failedOps.length,
        remaining: newQueue.length,
        failedOps
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao processar fila:', message);
      return { success: false, error: message };
    }
  }

  // Simula o modo offline
  setOffline() {
    this.online = false;
    console.log('Status alterado para: OFFLINE');
  }

  // Simula o modo online
  setOnline() {
    this.online = true;
    console.log('Status alterado para: ONLINE');
  }

  // Verifica o status de conexão
  getConnectionStatus() {
    return { online: this.online };
  }
}

// Função para testar o mecanismo de sincronização
async function testSyncMechanism(userId) {
  console.log('Iniciando teste do mecanismo de sincronização...');
  
  // Cria uma instância do gerenciador de sincronização
  const syncManager = new SyncManager(userId);
  
  // Testa adição de item quando online
  console.log('\n1. Testando adição de item quando ONLINE');
  
  const taskId = crypto.randomUUID();
  
  try {
    console.log('Inserindo tarefa diretamente no Supabase...');
    
    const { data, error } = await supabase.from('tarefas').insert({
      id: taskId,
      titulo: 'Tarefa de teste online',
      descricao: 'Tarefa criada em modo online',
      status: 'pendente',
      user_id: userId,
      created_at: new Date().toISOString()
    }).select();
    
    if (error) {
      console.error('Erro ao inserir tarefa online:', error);
    } else {
      console.log('Tarefa inserida com sucesso:', data);
    }
  } catch (error) {
    console.error('Erro ao inserir tarefa online:', error);
  }
  
  // Testa adição de item quando offline
  console.log('\n2. Testando adição de item quando OFFLINE');
  
  // Simula o modo offline
  syncManager.setOffline();
  
  // Cria uma nova tarefa em modo offline
  const offlineTaskId = crypto.randomUUID();
  
  // Adiciona à fila offline
  syncManager.addToOfflineQueue({
    table: 'tarefas',
    operation: 'insert',
    payload: {
      id: offlineTaskId,
      titulo: 'Tarefa de teste offline',
      descricao: 'Tarefa criada em modo offline',
      status: 'pendente',
      user_id: userId,
      created_at: new Date().toISOString()
    }
  });
  
  // Verifica a fila offline
  console.log('\nFila offline após adição:');
  console.log(syncManager.getOfflineQueue());
  
  // Simula voltando para online e sincronizando
  console.log('\n3. Simulando retorno à conexão e sincronização');
  syncManager.setOnline();
  
  // Processa a fila de sincronização
  console.log('Processando fila de sincronização...');
  const syncResult = await syncManager.processSyncQueue();
  console.log('Resultado da sincronização:', syncResult);
  
  // Verifica se os dados foram sincronizados corretamente
  console.log('\n4. Verificando se os dados foram sincronizados');
  
  try {
    const { data, error } = await supabase
      .from('tarefas')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Erro ao verificar dados sincronizados:', error);
    } else {
      console.log('Dados sincronizados:', data);
      console.log(`Total de itens: ${data.length} (esperado: 2)`);
      
      // Verifica se ambas as tarefas (online e offline) foram salvas
      const onlineTask = data.find(item => item.id === taskId);
      const offlineTask = data.find(item => item.id === offlineTaskId);
      
      console.log('Tarefa online encontrada:', !!onlineTask);
      console.log('Tarefa offline encontrada:', !!offlineTask);
    }
  } catch (error) {
    console.error('Erro ao verificar dados sincronizados:', error);
  }
  
  console.log('\nTeste do mecanismo de sincronização concluído!');
}

// Função principal para executar todos os testes
async function runCompleteTest() {
  try {
    console.log('=== INICIANDO TESTE COMPLETO DE SINCRONIZAÇÃO ===\n');
    
    // 1. Instalar funções SQL (se necessário)
    console.log('\n[ETAPA 1] Instalando funções SQL...');
    await installSqlFunctions();
    
    // 2. Criar usuário de teste
    console.log('\n[ETAPA 2] Criando usuário de teste...');
    const testUser = await createTestUser();
    
    if (!testUser) {
      console.error('Falha ao criar usuário de teste. Encerrando testes.');
      process.exit(1);
    }
    
    console.log(`Usuário de teste criado: ${testUser.email} (ID: ${testUser.userId})`);
    
    // 3. Testar mecanismo de sincronização
    console.log('\n[ETAPA 3] Testando mecanismo de sincronização...');
    await testSyncMechanism(testUser.userId);
    
    console.log('\n=== TESTE COMPLETO FINALIZADO COM SUCESSO ===');
  } catch (error) {
    console.error('Erro durante a execução dos testes completos:', error);
    process.exit(1);
  }
}

// Execute o teste completo
runCompleteTest(); 