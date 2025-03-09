import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createLocalStorage } from './storage'
import {
  fetchRegistrosSono,
  addRegistroSono as addRegistroApi,
  updateRegistroSono as updateRegistroApi,
  deleteRegistroSono as deleteRegistroApi,
  sincronizarRegistrosSono
} from '@/app/services/sonoSyncService'

export type RegistroSono = {
  id: string
  inicio: string // Formato ISO
  fim?: string // Formato ISO
  qualidade?: number // 1-5, onde 5 é a melhor qualidade
  notas?: string
}

export type ConfiguracaoLembrete = {
  id: string
  tipo: 'dormir' | 'acordar'
  horario: string // Formato HH:MM
  diasSemana: number[] // 0-6, onde 0 é domingo
  ativo: boolean
}

export type SonoState = {
  registros: RegistroSono[]
  lembretes: ConfiguracaoLembrete[]
  isSyncing: boolean
  lastSyncedAt: number | null
  
  // Ações de registros
  adicionarRegistroSono: (registro: Omit<RegistroSono, 'id'>) => void
  atualizarRegistroSono: (id: string, dados: Partial<Omit<RegistroSono, 'id'>>) => void
  removerRegistroSono: (id: string) => void
  
  // Ações de lembretes
  adicionarLembrete: (tipo: 'dormir' | 'acordar', horario: string, diasSemana: number[]) => void
  atualizarLembrete: (id: string, dados: Partial<Omit<ConfiguracaoLembrete, 'id'>>) => void
  removerLembrete: (id: string) => void
  alternarAtivoLembrete: (id: string) => void
  
  // Sincronização
  carregarRegistros: (userId: string) => Promise<void>
  sincronizar: (userId: string) => Promise<void>
  setRegistros: (registros: RegistroSono[]) => void
}

// Helper para obter ID do usuário do localStorage
const getUserId = (): string | null => {
  try {
    const userData = localStorage.getItem('auth-user')
    if (userData) {
      const user = JSON.parse(userData)
      return user?.id || null
    }
    return null
  } catch (error) {
    console.error('Erro ao obter userId do localStorage:', error)
    return null
  }
}

export const useSonoStore = create<SonoState>()(
  persist(
    (set, get) => ({
      registros: [],
      lembretes: [],
      isSyncing: false,
      lastSyncedAt: null,
      
      adicionarRegistroSono: (registro) => {
        const novoRegistro: RegistroSono = {
          ...registro,
          id: crypto.randomUUID()
        }
        
        // Atualizar state primeiro (UI responsiva)
        set((state) => ({
          registros: [...state.registros, novoRegistro]
        }))
        
        // Sincronizar com backend
        const userId = getUserId()
        if (userId) {
          addRegistroApi(novoRegistro, userId).catch(error => {
            console.error('Erro ao adicionar registro de sono no servidor:', error)
          })
        }
      },
      
      atualizarRegistroSono: (id, dados) => {
        // Atualizar state primeiro
        set((state) => ({
          registros: state.registros.map((registro) => 
            registro.id === id 
              ? { ...registro, ...dados } 
              : registro
          )
        }))
        
        // Sincronizar com backend
        const userId = getUserId()
        if (userId) {
          const registroAtualizado = get().registros.find(r => r.id === id)
          if (registroAtualizado) {
            updateRegistroApi(registroAtualizado, userId).catch(error => {
              console.error('Erro ao atualizar registro de sono no servidor:', error)
            })
          }
        }
      },
      
      removerRegistroSono: (id) => {
        // Remover localmente primeiro
        set((state) => ({
          registros: state.registros.filter((registro) => registro.id !== id)
        }))
        
        // Sincronizar com backend
        deleteRegistroApi(id).catch(error => {
          console.error('Erro ao remover registro de sono do servidor:', error)
        })
      },
      
      adicionarLembrete: (tipo, horario, diasSemana) => set((state) => ({
        lembretes: [
          ...state.lembretes,
          {
            id: crypto.randomUUID(),
            tipo,
            horario,
            diasSemana,
            ativo: true
          }
        ]
      })),
      
      atualizarLembrete: (id, dados) => set((state) => ({
        lembretes: state.lembretes.map((lembrete) => 
          lembrete.id === id 
            ? { ...lembrete, ...dados } 
            : lembrete
        )
      })),
      
      removerLembrete: (id) => set((state) => ({
        lembretes: state.lembretes.filter((lembrete) => lembrete.id !== id)
      })),
      
      alternarAtivoLembrete: (id) => set((state) => ({
        lembretes: state.lembretes.map((lembrete) =>
          lembrete.id === id
            ? { ...lembrete, ativo: !lembrete.ativo }
            : lembrete
        )
      })),
      
      carregarRegistros: async (userId) => {
        try {
          set({ isSyncing: true })
          
          // Carregar registros do servidor
          const registrosServidor = await fetchRegistrosSono(userId)
          
          if (registrosServidor.length > 0) {
            // Se temos dados do servidor, usamos eles
            set({ 
              registros: registrosServidor,
              lastSyncedAt: Date.now(),
              isSyncing: false
            })
          } else {
            // Se não temos dados do servidor, tentamos sincronizar os dados locais
            get().sincronizar(userId)
          }
        } catch (error) {
          console.error('Erro ao carregar registros de sono:', error)
          set({ isSyncing: false })
        }
      },
      
      sincronizar: async (userId) => {
        try {
          set({ isSyncing: true })
          
          // Pegar registros locais atuais
          const registrosLocais = get().registros
          
          // Executar sincronização bidirecional
          const registrosSincronizados = await sincronizarRegistrosSono(registrosLocais, userId)
          
          // Atualizar store com dados sincronizados
          set({ 
            registros: registrosSincronizados,
            lastSyncedAt: Date.now(),
            isSyncing: false
          })
        } catch (error) {
          console.error('Erro ao sincronizar registros de sono:', error)
          set({ isSyncing: false })
        }
      },
      
      setRegistros: (registros) => {
        set({ registros })
      }
    }),
    {
      name: 'sono-storage',
      storage: createLocalStorage()
    }
  )
)
