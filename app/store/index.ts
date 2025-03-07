import { create } from 'zustand'
import { persist, PersistOptions } from 'zustand/middleware'
import { supabase } from '../../supabase/client'

// Tipo para verificar o status da conexão
export type ConnectionStatus = 'online' | 'offline' | 'checking'

// Tipos para o estado global
export type Tarefa = {
  id: string
  texto: string
  concluida: boolean
  categoria: 'inicio' | 'alimentacao' | 'estudos' | 'saude' | 'lazer'
  data: string // formato YYYY-MM-DD
}

export type BlocoTempo = {
  id: string
  hora: string
  atividade: string
  categoria: 'inicio' | 'alimentacao' | 'estudos' | 'saude' | 'lazer' | 'nenhuma'
  data: string // formato YYYY-MM-DD
}

export type Refeicao = {
  id: string
  hora: string
  descricao: string
  foto?: string
  data: string // formato YYYY-MM-DD
}

export type Medicacao = {
  id: string
  nome: string
  horarios: string[]
  tomada: Record<string, boolean> // chave: data-horario, valor: tomada ou não
}

// Novo tipo para medicamentos refatorado
export type Medicamento = {
  id: string
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
export type RegistroHumor = {
  id: string
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
  pendingChanges: Record<string, any[]>
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
  adicionarTarefa: (tarefa: Omit<Tarefa, 'id'>) => void
  removerTarefa: (id: string) => void
  toggleTarefaConcluida: (id: string) => void
  
  // Ações para blocos de tempo
  adicionarBlocoTempo: (bloco: Omit<BlocoTempo, 'id'>) => void
  atualizarBlocoTempo: (id: string, bloco: Partial<BlocoTempo>) => void
  removerBlocoTempo: (id: string) => void
  
  // Ações para refeições
  adicionarRefeicao: (refeicao: Omit<Refeicao, 'id'>) => void
  removerRefeicao: (id: string) => void
  
  // Ações para medicações
  adicionarMedicacao: (medicacao: Omit<Medicacao, 'id'>) => void
  marcarMedicacaoTomada: (id: string, data: string, horario: string, tomada: boolean) => void
  
  // Novas ações para medicamentos refatorados
  adicionarMedicamento: (medicamento: Omit<Medicamento, 'id'>) => void
  atualizarMedicamento: (id: string, medicamento: Partial<Omit<Medicamento, 'id'>>) => void
  removerMedicamento: (id: string) => void
  registrarTomadaMedicamento: (id: string, dataHora: string) => void
  
  // Novas ações para registros de humor
  adicionarRegistroHumor: (registro: Omit<RegistroHumor, 'id'>) => void
  atualizarRegistroHumor: (id: string, registro: Partial<Omit<RegistroHumor, 'id'>>) => void
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
  pendingChanges: Record<string, any[]>;
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
    adicionarTarefa: (tarefa: Omit<Tarefa, 'id'>): void => set((state: Partial<Store>) => ({
      tarefas: [...(state.tarefas || []), { ...tarefa, id: crypto.randomUUID() }]
    })),
    removerTarefa: (id: string): void => set((state: Partial<Store>) => ({
      tarefas: (state.tarefas || []).filter((t: Tarefa) => t.id !== id)
    })),
    toggleTarefaConcluida: (id: string): void => set((state: Partial<Store>) => ({
      tarefas: (state.tarefas || []).map((t: Tarefa) => t.id === id ? { ...t, concluida: !t.concluida } : t)
    })),
    adicionarBlocoTempo: (bloco: Omit<BlocoTempo, 'id'>): void => set((state: Partial<Store>) => ({
      blocosTempo: [...(state.blocosTempo || []), { ...bloco, id: crypto.randomUUID() }]
    })),
    atualizarBlocoTempo: (id: string, bloco: Partial<BlocoTempo>): void => set((state: Partial<Store>) => ({
      blocosTempo: (state.blocosTempo || []).map((b: BlocoTempo) => b.id === id ? { ...b, ...bloco } : b)
    })),
    removerBlocoTempo: (id: string): void => set((state: Partial<Store>) => ({
      blocosTempo: (state.blocosTempo || []).filter((b: BlocoTempo) => b.id !== id)
    })),
    adicionarRefeicao: (refeicao: Omit<Refeicao, 'id'>): void => set((state: Partial<Store>) => ({
      refeicoes: [...(state.refeicoes || []), { ...refeicao, id: crypto.randomUUID() }]
    })),
    removerRefeicao: (id: string): void => set((state: Partial<Store>) => ({
      refeicoes: (state.refeicoes || []).filter((r: Refeicao) => r.id !== id)
    })),
    adicionarMedicacao: (medicacao: Omit<Medicacao, 'id'>): void => set((state: Partial<Store>) => ({
      medicacoes: [...(state.medicacoes || []), { ...medicacao, id: crypto.randomUUID() }]
    })),
    marcarMedicacaoTomada: (id: string, data: string, horario: string, tomada: boolean): void => set((state: Partial<Store>) => ({
      medicacoes: (state.medicacoes || []).map((m: Medicacao) => 
        m.id === id ? { ...m, tomada: { ...m.tomada, [`${data}-${horario}`]: tomada } } : m
      )
    })),
    adicionarMedicamento: (medicamento: Omit<Medicamento, 'id'>): void => set((state: Partial<Store>) => ({
      medicamentos: [...(state.medicamentos || []), { ...medicamento, id: crypto.randomUUID() }]
    })),
    atualizarMedicamento: (id: string, medicamento: Partial<Omit<Medicamento, 'id'>>): void => set((state: Partial<Store>) => ({
      medicamentos: (state.medicamentos || []).map((m: Medicamento) => m.id === id ? { ...m, ...medicamento } : m)
    })),
    removerMedicamento: (id: string): void => set((state: Partial<Store>) => ({
      medicamentos: (state.medicamentos || []).filter((m: Medicamento) => m.id !== id)
    })),
    registrarTomadaMedicamento: (id: string, dataHora: string): void => set((state: Partial<Store>) => ({
      medicamentos: (state.medicamentos || []).map((m: Medicamento) => 
        m.id === id ? { ...m, ultimaTomada: dataHora } : m
      )
    })),
    adicionarRegistroHumor: (registro: Omit<RegistroHumor, 'id'>): void => set((state: Partial<Store>) => ({
      registrosHumor: [...(state.registrosHumor || []), { ...registro, id: crypto.randomUUID() }]
    })),
    atualizarRegistroHumor: (id: string, registro: Partial<Omit<RegistroHumor, 'id'>>) => set((state: Partial<Store>) => ({
      registrosHumor: (state.registrosHumor || []).map((r: RegistroHumor) => r.id === id ? { ...r, ...registro } : r)
    })),
    removerRegistroHumor: (id: string): void => set((state: Partial<Store>) => ({
      registrosHumor: (state.registrosHumor || []).filter((r: RegistroHumor) => r.id !== id)
    })),
    atualizarConfiguracao: (config: Partial<ConfiguracaoUsuario>): void => set((state: Partial<Store>) => ({
      configuracao: { ...(state.configuracao || {
        tempoFoco: 25,
        tempoPausa: 5,
        temaEscuro: false,
        reducaoEstimulos: false
      }), ...config }
    }))
  };
};

// Use createStore in zustand
export const useAppStore = create<Partial<Store>>()(persist(createStore, persistConfig));
