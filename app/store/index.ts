import { create } from 'zustand'
import { persist, PersistOptions } from 'zustand/middleware'
import { supabase } from '../../supabase/client'
import { syncMiddleware } from './syncMiddleware'

// Função utilitária para lidar com datas de forma segura
const getValidDate = (date: string | undefined): Date => {
  if (!date) return new Date(0); // Data padrão para itens sem data
  const parsedDate = new Date(date);
  return isNaN(parsedDate.getTime()) ? new Date(0) : parsedDate;
}

// Interface para entidades com controle de versão
interface BaseEntity {
  id: string;
  updated_at?: string;
  version?: number;
  deleted?: boolean;
}

// Tipo para verificar o status da conexão
export type ConnectionStatus = 'online' | 'offline' | 'checking' | 'syncing';

// Tipos para o estado global
export type Tarefa = BaseEntity & {
  texto: string
  concluida: boolean
  categoria: 'inicio' | 'alimentacao' | 'estudos' | 'saude' | 'lazer'
  data: string // formato YYYY-MM-DD
}

export type BlocoTempo = BaseEntity & {
  hora: string
  atividade: string
  categoria: 'inicio' | 'alimentacao' | 'estudos' | 'saude' | 'lazer' | 'nenhuma'
  data: string // formato YYYY-MM-DD
}

export type Refeicao = BaseEntity & {
  hora: string
  descricao: string
  foto?: string
  data: string // formato YYYY-MM-DD
}

export type Medicacao = BaseEntity & {
  nome: string
  horarios: string[]
  tomada: Record<string, boolean> // chave: data-horario, valor: tomada ou não
}

// Novo tipo para medicamentos refatorado
export type Medicamento = BaseEntity & {
  nome: string
  dosagem: string
  frequencia: string
  horarios: string[]
  observacoes: string
  dataInicio: string
  ultimaTomada: string | null
  intervalo?: number // tempo em minutos entre doses
}

// Novo tipo para registros de humor
export type RegistroHumor = BaseEntity & {
  data: string
  nivel: number
  fatores: string[]
  notas: string
}

export type ConfiguracaoUsuario = {
  tempoFoco: number // em minutos
  tempoPausa: number // em minutos
  temaEscuro: boolean
  reducaoEstimulos: boolean
}

// Interface para o estado sincronizável
interface SyncState {
  connectionStatus: ConnectionStatus
  lastSyncedAt: string | null
  pendingChanges: { count?: number }
  checkConnection: () => Promise<boolean>
}

// Interface do estado global
interface AppState extends SyncState {
  tarefas: Tarefa[]
  blocosTempo: BlocoTempo[]
  refeicoes: Refeicao[]
  medicacoes: Medicacao[]
  configuracao: ConfiguracaoUsuario
  
  // Novos estados para medicamentos e humor refatorados
  medicamentos: Medicamento[]
  registrosHumor: RegistroHumor[]
  
  // Função para resetar o estado
  resetState: () => void
  
  // Ações para tarefas
  adicionarTarefa: (tarefa: Omit<Tarefa, 'id' | 'updated_at' | 'version' | 'deleted'>) => void
  removerTarefa: (id: string) => void
  toggleTarefaConcluida: (id: string) => void
  
  // Ações para blocos de tempo
  adicionarBlocoTempo: (bloco: Omit<BlocoTempo, 'id' | 'updated_at' | 'version' | 'deleted'>) => void
  atualizarBlocoTempo: (id: string, bloco: Partial<Omit<BlocoTempo, 'id' | 'updated_at' | 'version' | 'deleted'>>) => void
  removerBlocoTempo: (id: string) => void
  
  // Ações para refeições
  adicionarRefeicao: (refeicao: Omit<Refeicao, 'id' | 'updated_at' | 'version' | 'deleted'>) => void
  removerRefeicao: (id: string) => void
  
  // Ações para medicações
  adicionarMedicacao: (medicacao: Omit<Medicacao, 'id' | 'updated_at' | 'version' | 'deleted'>) => void
  marcarMedicacaoTomada: (id: string, data: string, horario: string, tomada: boolean) => void
  
  // Novas ações para medicamentos refatorados
  adicionarMedicamento: (medicamento: Omit<Medicamento, 'id' | 'updated_at' | 'version' | 'deleted'>) => void
  atualizarMedicamento: (id: string, medicamento: Partial<Omit<Medicamento, 'id' | 'updated_at' | 'version' | 'deleted'>>) => void
  removerMedicamento: (id: string) => void
  registrarTomadaMedicamento: (id: string, dataHora: string) => void
  
  // Novas ações para registros de humor
  adicionarRegistroHumor: (registro: Omit<RegistroHumor, 'id' | 'updated_at' | 'version' | 'deleted'>) => void
  atualizarRegistroHumor: (id: string, registro: Partial<Omit<RegistroHumor, 'id' | 'updated_at' | 'version' | 'deleted'>>) => void
  removerRegistroHumor: (id: string) => void
  
  // Ações para configurações
  atualizarConfiguracao: (config: Partial<ConfiguracaoUsuario>) => void
}

// Definimos o estado a ser persistido
type PersistedState = Pick<AppState, 
  'tarefas' | 
  'blocosTempo' | 
  'refeicoes' | 
  'medicacoes' | 
  'medicamentos' | 
  'registrosHumor' | 
  'configuracao'
>;

type StoreState = Omit<AppState, keyof SyncState> & {
  connectionStatus: ConnectionStatus;
  lastSyncedAt: string | null;
  pendingChanges: { count?: number };
  checkConnection: () => Promise<boolean>;
  resetState: () => void;
};

type StoreMethods = Pick<AppState, keyof SyncState>;

type Store = StoreState & StoreMethods;

// Mapeamento entre tabelas do Supabase e chaves do estado
const tableMapping: Record<string, keyof PersistedState> = {
  'tarefas': 'tarefas',
  'blocos_tempo': 'blocosTempo',
  'refeicoes': 'refeicoes',
  'medicacoes': 'medicacoes',
  'medicamentos': 'medicamentos',
  'registros_humor': 'registrosHumor'
};

// Configuração de persistência
const persistConfig: PersistOptions<Partial<Store>, Partial<Store>> = {
  name: `stayfocus-storage-${supabase.auth.getUser()?.then(res => res.data.user?.id) || 'anonymous'}`,
  partialize: (state: Partial<Store>) => {
    return {
      tarefas: state.tarefas || [],
      blocosTempo: state.blocosTempo || [],
      refeicoes: state.refeicoes || [],
      medicacoes: state.medicacoes || [],
      medicamentos: state.medicamentos || [],
      registrosHumor: state.registrosHumor || [],
      configuracao: state.configuracao || {
        tempoFoco: 25,
        tempoPausa: 5,
        temaEscuro: false,
        reducaoEstimulos: false
      },
    };
  },
  version: 1,
};

// Função para verificar se o dispositivo está online
const isOnline = async (): Promise<boolean> => {
  if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
    if (!navigator.onLine) return false;
  }

  try {
    const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    return !error;
  } catch (e) {
    return false;
  }
};

// Função utilitária para atualização de metadados
const updateMetadata = <T extends BaseEntity>(entity: T): T => {
  return {
    ...entity,
    updated_at: new Date().toISOString(),
    version: (entity.version || 0) + 1
  };
};

// Criação do store com integração direta do Supabase
const createStore = (set: (partial: Partial<Store> | ((state: Partial<Store>) => Partial<Store>), replace?: boolean) => void, get: () => Partial<Store>, api: any): Partial<Store> => {
  return {
    tarefas: [],
    blocosTempo: [],
    refeicoes: [],
    medicacoes: [],
    medicamentos: [],
    registrosHumor: [],
    configuracao: {
      tempoFoco: 25,
      tempoPausa: 5,
      temaEscuro: false,
      reducaoEstimulos: false
    },
    connectionStatus: 'checking' as ConnectionStatus,
    lastSyncedAt: null,
    pendingChanges: {},
    checkConnection: async (): Promise<boolean> => {
      const online = await isOnline();
      set({ connectionStatus: online ? 'online' : 'offline' });
      return online;
    },
    resetState: (): void => {
      set(createStore(set, get, api));
    },
    adicionarTarefa: (tarefa: Omit<Tarefa, 'id' | 'updated_at' | 'version' | 'deleted'>): void => set((state: Partial<Store>) => ({
      tarefas: [...(state.tarefas || []), { 
        ...tarefa, 
        id: crypto.randomUUID(),
        updated_at: new Date().toISOString(),
        version: 1
      }]
    })),
    removerTarefa: (id: string): void => set((state: Partial<Store>) => ({
      tarefas: (state.tarefas || []).map((t: Tarefa) => 
        t.id === id 
          ? { ...t, deleted: true, updated_at: new Date().toISOString(), version: (t.version || 0) + 1 } 
          : t
      )
    })),
    toggleTarefaConcluida: (id: string): void => set((state: Partial<Store>) => ({
      tarefas: (state.tarefas || []).map((t: Tarefa) => 
        t.id === id 
          ? updateMetadata({ ...t, concluida: !t.concluida }) 
          : t
      )
    })),
    adicionarBlocoTempo: (bloco: Omit<BlocoTempo, 'id' | 'updated_at' | 'version' | 'deleted'>): void => set((state: Partial<Store>) => ({
      blocosTempo: [...(state.blocosTempo || []), { 
        ...bloco, 
        id: crypto.randomUUID(),
        updated_at: new Date().toISOString(),
        version: 1
      }]
    })),
    atualizarBlocoTempo: (id: string, bloco: Partial<BlocoTempo>): void => set((state: Partial<Store>) => ({
      blocosTempo: (state.blocosTempo || []).map((b: BlocoTempo) => 
        b.id === id 
          ? updateMetadata({ ...b, ...bloco }) 
          : b
      )
    })),
    removerBlocoTempo: (id: string): void => set((state: Partial<Store>) => ({
      blocosTempo: (state.blocosTempo || []).map((b: BlocoTempo) => 
        b.id === id 
          ? { ...b, deleted: true, updated_at: new Date().toISOString(), version: (b.version || 0) + 1 } 
          : b
      )
    })),
    adicionarRefeicao: (refeicao: Omit<Refeicao, 'id' | 'updated_at' | 'version' | 'deleted'>): void => set((state: Partial<Store>) => ({
      refeicoes: [...(state.refeicoes || []), { 
        ...refeicao, 
        id: crypto.randomUUID(),
        updated_at: new Date().toISOString(),
        version: 1
      }]
    })),
    removerRefeicao: (id: string): void => set((state: Partial<Store>) => ({
      refeicoes: (state.refeicoes || []).map((r: Refeicao) => 
        r.id === id 
          ? { ...r, deleted: true, updated_at: new Date().toISOString(), version: (r.version || 0) + 1 } 
          : r
      )
    })),
    adicionarMedicacao: (medicacao: Omit<Medicacao, 'id' | 'updated_at' | 'version' | 'deleted'>): void => set((state: Partial<Store>) => ({
      medicacoes: [...(state.medicacoes || []), { 
        ...medicacao, 
        id: crypto.randomUUID(),
        updated_at: new Date().toISOString(),
        version: 1
      }]
    })),
    marcarMedicacaoTomada: (id: string, data: string, horario: string, tomada: boolean): void => set((state: Partial<Store>) => ({
      medicacoes: (state.medicacoes || []).map((m: Medicacao) => 
        m.id === id 
          ? { ...m, tomada: { ...m.tomada, [`${data}-${horario}`]: tomada }, updated_at: new Date().toISOString(), version: (m.version || 0) + 1 } 
          : m
      )
    })),
    adicionarMedicamento: (medicamento: Omit<Medicamento, 'id' | 'updated_at' | 'version' | 'deleted'>): void => set((state: Partial<Store>) => ({
      medicamentos: [...(state.medicamentos || []), { 
        ...medicamento, 
        id: crypto.randomUUID(),
        updated_at: new Date().toISOString(),
        version: 1
      }]
    })),
    atualizarMedicamento: (id: string, medicamento: Partial<Omit<Medicamento, 'id' | 'updated_at' | 'version' | 'deleted'>>): void => set((state: Partial<Store>) => ({
      medicamentos: (state.medicamentos || []).map((m: Medicamento) => 
        m.id === id 
          ? updateMetadata({ ...m, ...medicamento }) 
          : m
      )
    })),
    removerMedicamento: (id: string): void => set((state: Partial<Store>) => ({
      medicamentos: (state.medicamentos || []).map((m: Medicamento) => 
        m.id === id 
          ? { ...m, deleted: true, updated_at: new Date().toISOString(), version: (m.version || 0) + 1 } 
          : m
      )
    })),
    registrarTomadaMedicamento: (id: string, dataHora: string): void => set((state: Partial<Store>) => ({
      medicamentos: (state.medicamentos || []).map((m: Medicamento) => 
        m.id === id 
          ? { ...m, ultimaTomada: dataHora, updated_at: new Date().toISOString(), version: (m.version || 0) + 1 } 
          : m
      )
    })),
    adicionarRegistroHumor: (registro: Omit<RegistroHumor, 'id' | 'updated_at' | 'version' | 'deleted'>): void => set((state: Partial<Store>) => ({
      registrosHumor: [...(state.registrosHumor || []), { 
        ...registro, 
        id: crypto.randomUUID(),
        updated_at: new Date().toISOString(),
        version: 1
      }]
    })),
    atualizarRegistroHumor: (id: string, registro: Partial<Omit<RegistroHumor, 'id' | 'updated_at' | 'version' | 'deleted'>>): void => set((state: Partial<Store>) => ({
      registrosHumor: (state.registrosHumor || []).map((r: RegistroHumor) => 
        r.id === id 
          ? updateMetadata({ ...r, ...registro }) 
          : r
      )
    })),
    removerRegistroHumor: (id: string): void => set((state: Partial<Store>) => ({
      registrosHumor: (state.registrosHumor || []).map((r: RegistroHumor) => 
        r.id === id 
          ? { ...r, deleted: true, updated_at: new Date().toISOString(), version: (r.version || 0) + 1 } 
          : r
      )
    })),
    atualizarConfiguracao: (config: Partial<ConfiguracaoUsuario>): void => set((state: Partial<Store>) => ({
      configuracao: { ...(state.configuracao || {
        tempoFoco: 25,
        tempoPausa: 5,
        temaEscuro: false,
        reducaoEstimulos: false
      }), ...config },
      updated_at: new Date().toISOString(),
    }))
  };
};

// Verificação para ambiente cliente/servidor
const isClient = typeof window !== 'undefined';

// Use createStore in zustand with sync middleware
export const useAppStore = create<Partial<Store>>()(
  persist(
    syncMiddleware(createStore, tableMapping),
    {
      ...persistConfig,
      name: 'stayfocus-storage', // Nome fixo para evitar problemas com promessas
      onRehydrateStorage: () => (state) => {
        // Verifica conexão ao recarregar o estado
        if (state?.checkConnection && isClient) {
          state.checkConnection();
        }
      }
    }
  )
);

// Wrapper para uso seguro com SSR
export function useStore<T>(selector: (state: Partial<Store>) => T): T {
  // Em SSR, retorne valores padrão que são serializáveis
  if (!isClient) {
    return selector({
      tarefas: [],
      blocosTempo: [],
      refeicoes: [],
      medicacoes: [],
      medicamentos: [],
      registrosHumor: [],
      configuracao: {
        tempoFoco: 25,
        tempoPausa: 5,
        temaEscuro: false,
        reducaoEstimulos: false
      },
      connectionStatus: 'checking',
      lastSyncedAt: null,
      pendingChanges: {}
    } as Partial<Store>);
  }
  
  // No cliente, use normalmente
  return useAppStore(selector);
}
