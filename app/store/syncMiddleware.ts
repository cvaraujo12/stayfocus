import { supabase } from '../../supabase/client';
import type { StateCreator, StoreMutatorIdentifier } from 'zustand';

// Intervalo de tempo para tentar novamente, com backoff exponencial
const RETRY_INTERVALS = [1000, 2000, 5000, 10000, 30000]; // em milissegundos

// Verificação se está no ambiente do cliente
const isClient = typeof window !== 'undefined';

// Definição do middleware
type SyncMiddleware = <
  T extends object,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  f: StateCreator<T, Mps, Mcs>,
  tableMapping: Record<string, keyof T>
) => StateCreator<T, Mps, Mcs>;

// Interface para operações pendentes
interface PendingOperation {
  tableName: string;
  stateKey: string | number | symbol;
  operation: 'insert' | 'update' | 'delete';
  data: any;
  retries: number;
  id: string;
}

// Implementação do middleware de sincronização
export const syncMiddleware: SyncMiddleware = (f, tableMapping) => (set, get, api) => {
  // Retorna diretamente o estado original se não estiver no cliente
  if (!isClient) {
    return f(set, get, api);
  }

  // Inicialização do estado
  const state = f(set, get, api);
  
  // Fila de operações pendentes para sincronização quando offline
  let syncQueue: PendingOperation[] = [];
  let processingQueue = false;
  
  // Função para verificar se está online
  const isOnline = async (): Promise<boolean> => {
    // Verifica primeiro o navegador
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      if (!navigator.onLine) return false;
    }

    // Depois tenta uma operação leve no Supabase
    try {
      const { error } = await supabase.from('tarefas').select('count', { count: 'exact', head: true });
      return !error;
    } catch (e) {
      return false;
    }
  };
  
  // Função para processar a fila de sincronização
  const processSyncQueue = async () => {
    if (processingQueue) return;
    processingQueue = true;
    
    try {
      const online = await isOnline();
      if (!online || syncQueue.length === 0) {
        processingQueue = false;
        return;
      }
      
      // Atualiza status para sincronizando
      set((state: any) => ({ ...state, connectionStatus: 'syncing' }));
      
      // Processa cada operação na fila
      const initialQueueLength = syncQueue.length;
      for (let i = 0; i < initialQueueLength; i++) {
        const op = syncQueue.shift();
        if (!op) continue;
        
        try {
          const user = await supabase.auth.getUser();
          if (!user.data.user) {
            // Coloca de volta na fila se não estiver autenticado
            syncQueue.push(op);
            continue;
          }
          
          switch (op.operation) {
            case 'insert':
            case 'update':
              await upsertData(op.tableName, op.data);
              break;
            case 'delete':
              await deleteData(op.tableName, op.id);
              break;
          }
        } catch (error) {
          // Se falhar, incrementa tentativas e adiciona de volta à fila com backoff
          op.retries++;
          
          if (op.retries < RETRY_INTERVALS.length) {
            setTimeout(() => {
              syncQueue.push(op);
              if (!processingQueue) processSyncQueue();
            }, RETRY_INTERVALS[op.retries]);
          } else {
            console.error(`Erro após máximo de tentativas para operação ${op.operation}:`, error);
            // Aqui poderia implementar uma lógica para notificar o usuário
          }
        }
      }
      
      // Atualiza status e último sync
      if (syncQueue.length === 0) {
        set((state: any) => ({
          ...state,
          connectionStatus: 'online',
          lastSyncedAt: new Date().toISOString(),
          pendingChanges: {}
        }));
      } else {
        set((state: any) => ({
          ...state,
          connectionStatus: 'online',
          pendingChanges: { count: syncQueue.length }
        }));
      }
    } catch (error) {
      console.error('Erro ao processar fila de sincronização:', error);
      set((state: any) => ({ ...state, connectionStatus: 'offline' }));
    } finally {
      processingQueue = false;
      
      // Se ainda houver itens na fila, agenda nova tentativa
      if (syncQueue.length > 0) {
        setTimeout(processSyncQueue, 5000);
      }
    }
  };
  
  // Função para inserir ou atualizar dados no Supabase (upsert)
  const upsertData = async (tableName: string, data: any) => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('Usuário não autenticado');
    
    // Adiciona ou atualiza campos de controle
    const dataWithMetadata = Array.isArray(data) 
      ? data.map(item => ({
          ...item,
          user_id: userId,
          updated_at: new Date().toISOString()
        }))
      : {
          ...data,
          user_id: userId,
          updated_at: new Date().toISOString()
        };
    
    const { error } = await supabase
      .from(tableName)
      .upsert(dataWithMetadata, { 
        onConflict: 'id',
        ignoreDuplicates: false
      });
    
    if (error) throw error;
  };
  
  // Função para excluir dados no Supabase
  const deleteData = async (tableName: string, id: string) => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('Usuário não autenticado');
    
    const { error } = await supabase
      .from(tableName)
      .delete()
      .match({ id, user_id: userId });
    
    if (error) throw error;
  };

  // Função para sincronizar com o Supabase (versão otimizada)
  const syncWithSupabase = async (state: any, tableName: string, stateKey: string | number | symbol) => {
    const online = await isOnline();
    const data = state[stateKey];
    
    if (!Array.isArray(data)) return;
    
    // Se estiver offline, armazena as mudanças para sincronizar depois
    if (!online) {
      // Adiciona à fila de operações pendentes
      syncQueue.push({
        tableName,
        stateKey,
        operation: 'update',
        data,
        retries: 0,
        id: typeof crypto !== 'undefined' && 'randomUUID' in crypto 
            ? crypto.randomUUID() 
            : String(new Date().getTime())
      });
      
      set((state: any) => ({
        ...state,
        connectionStatus: 'offline',
        pendingChanges: { count: syncQueue.length }
      }));
      
      return;
    }
    
    try {
      await upsertData(tableName, data);
      
      set((state: any) => ({
        ...state,
        connectionStatus: 'online',
        lastSyncedAt: new Date().toISOString()
      }));
      
      // Processa qualquer operação pendente
      if (syncQueue.length > 0) {
        processSyncQueue();
      }
    } catch (error) {
      console.error(`Erro ao sincronizar ${tableName}:`, error);
      
      // Se falhar, adiciona à fila para tentar mais tarde
      syncQueue.push({
        tableName,
        stateKey,
        operation: 'update',
        data,
        retries: 0,
        id: typeof crypto !== 'undefined' && 'randomUUID' in crypto 
            ? crypto.randomUUID() 
            : String(new Date().getTime())
      });
      
      set((state: any) => ({
        ...state,
        connectionStatus: 'offline',
        pendingChanges: { count: syncQueue.length }
      }));
    }
  };

  // Inicializa função de verificação de conexão apenas no cliente
  if (isClient) {
    // Verifica inicialmente
    isOnline().then(online => {
      set((state: any) => ({ ...state, connectionStatus: online ? 'online' : 'offline' }));
    });
    
    // Adiciona listeners para eventos de conexão
    window.addEventListener('online', () => {
      set((state: any) => ({ ...state, connectionStatus: 'checking' }));
      isOnline().then(online => {
        set((state: any) => ({ ...state, connectionStatus: online ? 'online' : 'offline' }));
        if (online && syncQueue.length > 0) {
          processSyncQueue();
        }
      });
    });
    
    window.addEventListener('offline', () => {
      set((state: any) => ({ ...state, connectionStatus: 'offline' }));
    });
  }

  // Monkey patch da função setState do store para sincronizar
  // após qualquer alteração de estado, apenas no cliente
  if (isClient) {
    const originalSetState = api.setState;
    api.setState = (partial: any, replace?: boolean) => {
      // Chamar a setState original
      originalSetState(partial, replace);
      
      // Depois de atualizar o estado, sincronize com o Supabase
      const newState = get();
      Object.entries(tableMapping).forEach(([tableName, stateKey]) => {
        if (newState[stateKey]) {
          syncWithSupabase(newState, tableName, stateKey);
        }
      });
    };
  }

  // Retorna o estado inicial sem alterar os parâmetros de f
  return state;
}; 