const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const crypto = require('crypto');

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

// Simula o cliente de navegador para teste
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
      
      for (const op of queue) {
        try {
          console.log(`Processando ${op.operation} em ${op.table}...`);
          
          switch (op.operation) {
            case 'insert':
              await supabase.from(op.table).insert(op.payload);
              break;
            case 'update':
              await supabase.from(op.table).update(op.payload).eq('id', op.payload.id);
              break;
            case 'delete':
              await supabase.from(op.table).delete().eq('id', op.payload.id);
              break;
          }
          
          console.log(`Operação ${op.operation} concluída com sucesso`);
        } catch (error) {
          console.error(`Erro ao processar operação ${op.operation}:`, error);
        }
      }

      // Limpa a fila após processamento
      this.saveOfflineQueue([]);
      console.log('Fila processada e limpa');
      return { success: true };
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
async function testSyncMechanism() {
  console.log('Iniciando teste do mecanismo de sincronização...');
  
  // Cria um ID de usuário para teste
  const userId = crypto.randomUUID();
  console.log(`ID de usuário para teste: ${userId}`);
  
  // Cria uma instância do gerenciador de sincronização
  const syncManager = new SyncManager(userId);
  
  // Testa adição de item quando online
  console.log('\n1. Testando adição de item quando ONLINE');
  
  const taskId = crypto.randomUUID();
  
  try {
    console.log('Inserindo tarefa diretamente no Supabase...');
    
    const { data, error } = await supabase.from('priorities').insert({
      id: taskId,
      title: 'Tarefa de teste online',
      description: 'Tarefa criada em modo online',
      status: 'pendente',
      user_id: userId
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
    table: 'priorities',
    operation: 'insert',
    payload: {
      id: offlineTaskId,
      title: 'Tarefa de teste offline',
      description: 'Tarefa criada em modo offline',
      status: 'pendente',
      user_id: userId
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
      .from('priorities')
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

// Executa o teste
testSyncMechanism().catch(error => {
  console.error('Erro durante os testes:', error);
  process.exit(1);
}); 