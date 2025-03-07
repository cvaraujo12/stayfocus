import { StateCreator, StoreMutatorIdentifier } from 'zustand';
import { supabase } from '../../supabase/client';

// Tipo para verificar o status da conexão
type ConnectionStatus = 'online' | 'offline' | 'checking';

// Função para verificar se o dispositivo está online
const isOnline = async (): Promise<boolean> => {
  // Verifica primeiro o status do navegador
  if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
    if (!navigator.onLine) return false;
  }

  // Tenta fazer uma requisição para o Supabase para confirmar a conexão
  try {
    const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    return !error;
  } catch (e) {
    return false;
  }
};

// Interface para o estado de sincronização
interface SyncState {
  connectionStatus: ConnectionStatus;
  lastSyncedAt: string | null;
  pendingChanges: Record<string, any[]>;
  checkConnection: () => Promise<boolean>;
}

// Tipo para o middleware de sincronização
type SyncMiddleware = <
  T extends SyncState,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  f: StateCreator<T, Mps, Mcs>,
  tables: Record<string, keyof T>
) => StateCreator<T, Mps, Mcs>;

// Middleware de sincronização
export const syncWithSupabase: SyncMiddleware = (f, tables) => (set, get, store) => {
  // Inicializa o estado com o middleware
  const initialState = f(
    (state) => {
      // Quando o estado é atualizado, tenta sincronizar com o Supabase
      const currentState = get();
      const newState = typeof state === 'function' ? state(currentState) : state;
      
      // Tenta sincronizar apenas se estiver online
      if (currentState.connectionStatus === 'online') {
        syncStateToSupabase(newState, tables);
      } else {
        // Se estiver offline, armazena as mudanças para sincronizar depois
        storePendingChanges(newState, currentState, tables);
      }
      
      set(newState);
    },
    get,
    store
  );

  // Função para sincronizar o estado com o Supabase
  const syncStateToSupabase = async (state: any, tables: Record<string, keyof any>) => {
    for (const [tableName, stateKey] of Object.entries(tables)) {
      const data = state[stateKey];
      if (Array.isArray(data) && data.length > 0) {
        try {
          // Atualiza os dados no Supabase
          const { error } = await supabase.from(tableName).upsert(
            data.map(item => ({ ...item, user_id: supabase.auth.getUser()?.data?.user?.id || 'anonymous' })),
            { onConflict: 'id' }
          );
          
          if (error) {
            console.error(`Erro ao sincronizar ${tableName}:`, error);
          }
        } catch (e) {
          console.error(`Erro ao sincronizar ${tableName}:`, e);
        }
      }
    }
    
    // Atualiza o timestamp da última sincronização
    set((state: any) => ({ ...state, lastSyncedAt: new Date().toISOString() }));
  };

  // Função para armazenar mudanças pendentes
  const storePendingChanges = (newState: any, currentState: any, tables: Record<string, keyof any>) => {
    const pendingChanges = { ...currentState.pendingChanges };
    
    for (const [tableName, stateKey] of Object.entries(tables)) {
      const currentData = currentState[stateKey];
      const newData = newState[stateKey];
      
      if (Array.isArray(newData) && JSON.stringify(currentData) !== JSON.stringify(newData)) {
        pendingChanges[tableName] = newData;
      }
    }
    
    set((state: any) => ({ ...state, pendingChanges }));
  };

  // Função para carregar dados do Supabase
  const loadDataFromSupabase = async (tables: Record<string, keyof any>) => {
    const newState: Record<string, any> = {};
    let hasError = false;
    
    for (const [tableName, stateKey] of Object.entries(tables)) {
      try {
        // Busca os dados do Supabase
        const userId = supabase.auth.getUser()?.data?.user?.id || 'anonymous';
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('user_id', userId);
        
        if (error) {
          console.error(`Erro ao carregar dados de ${tableName}:`, error);
          hasError = true;
        } else if (data) {
          newState[stateKey as string] = data;
        }
      } catch (e) {
        console.error(`Erro ao carregar dados de ${tableName}:`, e);
        hasError = true;
      }
    }
    
    // Atualiza o estado com os dados carregados
    if (Object.keys(newState).length > 0) {
      set((state: any) => ({
        ...state,
        ...newState,
        connectionStatus: hasError ? 'offline' : 'online',
        lastSyncedAt: hasError ? null : new Date().toISOString()
      }));
    } else {
      set((state: any) => ({
        ...state,
        connectionStatus: hasError ? 'offline' : 'online'
      }));
    }
  };

  // Função para sincronizar mudanças pendentes
  const syncPendingChanges = async () => {
    const state = get();
    const { pendingChanges } = state;
    
    if (Object.keys(pendingChanges).length === 0) return;
    
    for (const [tableName, data] of Object.entries(pendingChanges)) {
      try {
        // Atualiza os dados no Supabase
        const { error } = await supabase.from(tableName).upsert(
          data.map((item: any) => ({ ...item, user_id: supabase.auth.getUser()?.data?.user?.id || 'anonymous' })),
          { onConflict: 'id' }
        );
        
        if (error) {
          console.error(`Erro ao sincronizar mudanças pendentes de ${tableName}:`, error);
        }
      } catch (e) {
        console.error(`Erro ao sincronizar mudanças pendentes de ${tableName}:`, e);
      }
    }
    
    // Limpa as mudanças pendentes e atualiza o timestamp
    set((state: any) => ({
      ...state,
      pendingChanges: {},
      lastSyncedAt: new Date().toISOString()
    }));
  };

  // Função para verificar a conexão
  const checkConnection = async () => {
    set((state: any) => ({ ...state, connectionStatus: 'checking' }));
    
    const online = await isOnline();
    
    set((state: any) => ({ ...state, connectionStatus: online ? 'online' : 'offline' }));
    
    // Se estiver online e houver mudanças pendentes, sincroniza
    if (online) {
      const state = get();
      if (Object.keys(state.pendingChanges).length > 0) {
        await syncPendingChanges();
      }
      
      // Carrega dados atualizados do Supabase
      await loadDataFromSupabase(tables);
    }
    
    return online;
  };

  // Adiciona o estado inicial de sincronização
  const stateWithSync = {
    ...initialState,
    connectionStatus: 'checking',
    lastSyncedAt: null,
    pendingChanges: {},
    checkConnection
  };

  // Verifica a conexão e carrega dados iniciais
  setTimeout(async () => {
    await checkConnection();
  }, 0);

  // Configura um intervalo para verificar a conexão periodicamente
  if (typeof window !== 'undefined') {
    // Verifica a conexão a cada 5 minutos
    setInterval(checkConnection, 5 * 60 * 1000);
    
    // Adiciona listeners para eventos de online/offline
    window.addEventListener('online', () => {
      checkConnection();
    });
    
    window.addEventListener('offline', () => {
      set((state: any) => ({ ...state, connectionStatus: 'offline' }));
    });
  }

  return stateWithSync;
}; 