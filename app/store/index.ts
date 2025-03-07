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
const persistConfig: PersistOptions<AppState, PersistedState> = {
  name: 'stayfocus-storage',
  partialize: (state) => ({
    tarefas: state.tarefas,
    blocosTempo: state.blocosTempo,
    refeicoes: state.refeicoes,
    medicacoes: state.medicacoes,
    medicamentos: state.medicamentos,
    registrosHumor: state.registrosHumor,
    configuracao: state.configuracao,
  }),
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
export const useAppStore = create<AppState>()(
  persist(
    (set, get, api) => {
      // Função para sincronizar o estado com o Supabase
      const syncStateToSupabase = async (state: AppState): Promise<void> => {
        try {
          const userResponse = await supabase.auth.getUser();
          const userId = userResponse.data?.user?.id || 'anonymous';
          
          for (const [tableName, stateKey] of Object.entries(tableMapping)) {
            const data = state[stateKey];
            if (Array.isArray(data) && data.length > 0) {
              try {
                const { error } = await supabase.from(tableName).upsert(
                  data.map(item => ({ ...item, user_id: userId })),
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
        } catch (e) {
          console.error('Erro ao obter usuário atual:', e);
        }
      };

      // Função para carregar dados do Supabase
      const loadDataFromSupabase = async (): Promise<void> => {
        try {
          const newState: Partial<PersistedState> = {};
          let hasError = false;
          
          const userResponse = await supabase.auth.getUser();
          const userId = userResponse.data?.user?.id || 'anonymous';
          
          for (const [tableName, stateKey] of Object.entries(tableMapping)) {
            try {
              const { data, error } = await supabase
                .from(tableName)
                .select('*')
                .eq('user_id', userId);
              
              if (error) {
                console.error(`Erro ao carregar dados de ${tableName}:`, error);
                hasError = true;
              } else if (data) {
                newState[stateKey] = data as any;
              }
            } catch (e) {
              console.error(`Erro ao carregar dados de ${tableName}:`, e);
              hasError = true;
            }
          }
          
          set({ 
            ...newState as Partial<AppState>,
            connectionStatus: hasError ? 'offline' : 'online',
            lastSyncedAt: hasError ? null : new Date().toISOString()
          });
        } catch (e) {
          console.error('Erro ao obter usuário atual:', e);
          set({ connectionStatus: 'offline' });
        }
      };

      // Função para verificar a conexão
      const checkConnection = async (): Promise<boolean> => {
        set({ connectionStatus: 'checking' });
        
        const online = await isOnline();
        
        set({ connectionStatus: online ? 'online' : 'offline' });
        
        if (online) {
          await loadDataFromSupabase();
        }
        
        return online;
      };

      // Wrapper para sincronizar alterações
      const syncedSet = (state: Partial<AppState> | ((state: AppState) => Partial<AppState>)) => {
        const result = set(state);
        const currentState = get();
        
        if (currentState.connectionStatus === 'online') {
          setTimeout(() => {
            syncStateToSupabase(currentState).catch(console.error);
          }, 0);
        }
        
        return result;
      };

      // Configuração inicial de eventos para detecção de conectividade
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          checkConnection().catch(console.error);
          
          window.addEventListener('online', () => {
            checkConnection().catch(console.error);
          });
          
          window.addEventListener('offline', () => {
            set({ connectionStatus: 'offline' });
          });
          
          setInterval(() => {
            checkConnection().catch(console.error);
          }, 5 * 60 * 1000);
        }, 0);
      }

      // Retorna o estado inicial com funções
      return {
        // Estado inicial
        tarefas: [],
        blocosTempo: [],
        refeicoes: [],
        medicacoes: [],
        configuracao: {
          tempoFoco: 25,
          tempoPausa: 5,
          temaEscuro: false,
          reducaoEstimulos: false,
        },
        
        // Novos estados iniciais para medicamentos e humor
        medicamentos: [],
        registrosHumor: [],
        
        // Estado inicial de sincronização
        connectionStatus: 'checking' as ConnectionStatus,
        lastSyncedAt: null,
        pendingChanges: {},
        checkConnection,
        
        // Implementações das ações para tarefas
        adicionarTarefa: (tarefa: Omit<Tarefa, 'id'>) =>
          syncedSet((state) => ({
            tarefas: [...state.tarefas, { ...tarefa, id: Date.now().toString() }],
          })),
        
        removerTarefa: (id: string) =>
          syncedSet((state) => ({
            tarefas: state.tarefas.filter((t) => t.id !== id),
          })),
        
        toggleTarefaConcluida: (id: string) =>
          syncedSet((state) => ({
            tarefas: state.tarefas.map((t) =>
              t.id === id ? { ...t, concluida: !t.concluida } : t
            ),
          })),
        
        // Implementações das ações para blocos de tempo
        adicionarBlocoTempo: (bloco: Omit<BlocoTempo, 'id'>) =>
          syncedSet((state) => ({
            blocosTempo: [...state.blocosTempo, { ...bloco, id: Date.now().toString() }],
          })),
        
        atualizarBlocoTempo: (id: string, bloco: Partial<BlocoTempo>) =>
          syncedSet((state) => ({
            blocosTempo: state.blocosTempo.map((b) =>
              b.id === id ? { ...b, ...bloco } : b
            ),
          })),
        
        removerBlocoTempo: (id: string) =>
          syncedSet((state) => ({
            blocosTempo: state.blocosTempo.filter((b) => b.id !== id),
          })),
        
        // Implementações das ações para refeições
        adicionarRefeicao: (refeicao: Omit<Refeicao, 'id'>) =>
          syncedSet((state) => ({
            refeicoes: [...state.refeicoes, { ...refeicao, id: Date.now().toString() }],
          })),
        
        removerRefeicao: (id: string) =>
          syncedSet((state) => ({
            refeicoes: state.refeicoes.filter((r) => r.id !== id),
          })),
        
        // Implementações das ações para medicações
        adicionarMedicacao: (medicacao: Omit<Medicacao, 'id'>) =>
          syncedSet((state) => ({
            medicacoes: [
              ...state.medicacoes,
              { ...medicacao, id: Date.now().toString() },
            ],
          })),
        
        marcarMedicacaoTomada: (id: string, data: string, horario: string, tomada: boolean) =>
          syncedSet((state) => ({
            medicacoes: state.medicacoes.map((med) => {
              if (med.id === id) {
                return {
                  ...med,
                  tomada: {
                    ...med.tomada,
                    [`${data}-${horario}`]: tomada,
                  },
                };
              }
              return med;
            }),
          })),
        
        // Implementações das novas ações para medicamentos
        adicionarMedicamento: (medicamento: Omit<Medicamento, 'id'>) =>
          syncedSet((state) => ({
            medicamentos: [
              ...state.medicamentos,
              {
                ...medicamento,
                id: Date.now().toString(),
              },
            ],
          })),
        
        atualizarMedicamento: (id: string, medicamento: Partial<Omit<Medicamento, 'id'>>) =>
          syncedSet((state) => ({
            medicamentos: state.medicamentos.map((med) =>
              med.id === id ? { ...med, ...medicamento } : med
            ),
          })),
        
        removerMedicamento: (id: string) =>
          syncedSet((state) => ({
            medicamentos: state.medicamentos.filter((med) => med.id !== id),
          })),
        
        registrarTomadaMedicamento: (id: string, dataHora: string) =>
          syncedSet((state) => ({
            medicamentos: state.medicamentos.map((med) =>
              med.id === id ? { ...med, ultimaTomada: dataHora } : med
            ),
          })),
        
        // Implementações das novas ações para registros de humor
        adicionarRegistroHumor: (registro: Omit<RegistroHumor, 'id'>) =>
          syncedSet((state) => ({
            registrosHumor: [
              ...state.registrosHumor,
              { ...registro, id: Date.now().toString() },
            ],
          })),
        
        atualizarRegistroHumor: (id: string, registro: Partial<Omit<RegistroHumor, 'id'>>) =>
          syncedSet((state) => ({
            registrosHumor: state.registrosHumor.map((reg) =>
              reg.id === id ? { ...reg, ...registro } : reg
            ),
          })),
        
        removerRegistroHumor: (id: string) =>
          syncedSet((state) => ({
            registrosHumor: state.registrosHumor.filter((reg) => reg.id !== id),
          })),
        
        // Implementações das ações para configurações
        atualizarConfiguracao: (config: Partial<ConfiguracaoUsuario>) =>
          syncedSet((state) => ({
            configuracao: {
              ...state.configuracao,
              ...config,
            },
          })),
      };
    },
    persistConfig
  )
);
