import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createLocalStorage } from './storage'
import {
  fetchSessoesEstudo,
  addSessaoEstudo as addSessaoApi,
  updateSessaoEstudo as updateSessaoApi,
  deleteSessaoEstudo as deleteSessaoApi,
  sincronizarSessoesEstudo
} from '@/app/services/estudosSyncService'

export type SessaoEstudo = {
  id: string
  titulo: string
  categoria?: string
  duracaoMinutos: number
  dataSessao: string // formato ISO: YYYY-MM-DD
  horaInicio?: string // formato: HH:MM
  observacoes?: string
  concluida: boolean
}

interface RegistroEstudosState {
  sessoes: SessaoEstudo[]
  isSyncing: boolean
  lastSyncedAt: number | null
  
  // Ações básicas
  adicionarSessao: (sessao: Omit<SessaoEstudo, 'id' | 'concluida'>) => void
  removerSessao: (id: string) => void
  marcarConcluida: (id: string, concluida: boolean) => void
  editarSessao: (id: string, dados: Partial<Omit<SessaoEstudo, 'id'>>) => void
  
  // Sincronização
  carregarSessoes: (userId: string) => Promise<void>
  sincronizar: (userId: string) => Promise<void>
  setSessoes: (sessoes: SessaoEstudo[]) => void
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

export const useRegistroEstudosStore = create<RegistroEstudosState>()(
  persist(
    (set, get) => ({
      sessoes: [],
      isSyncing: false,
      lastSyncedAt: null,
      
      adicionarSessao: (sessao) => {
        const novaSessao: SessaoEstudo = {
          ...sessao,
          id: crypto.randomUUID(),
          concluida: false
        }
        
        // Atualizar state primeiro (UI responsiva)
        set((state) => ({
          sessoes: [...state.sessoes, novaSessao]
        }))
        
        // Sincronizar com backend
        const userId = getUserId()
        if (userId) {
          addSessaoApi(novaSessao, userId).catch(error => {
            console.error('Erro ao adicionar sessão de estudo no servidor:', error)
          })
        }
      },
      
      removerSessao: (id) => {
        // Remover localmente primeiro
        set((state) => ({
          sessoes: state.sessoes.filter((sessao) => sessao.id !== id)
        }))
        
        // Sincronizar com backend
        deleteSessaoApi(id).catch(error => {
          console.error('Erro ao remover sessão de estudo do servidor:', error)
        })
      },
      
      marcarConcluida: (id, concluida) => {
        // Atualizar state primeiro
        set((state) => ({
          sessoes: state.sessoes.map((sessao) =>
            sessao.id === id ? { ...sessao, concluida } : sessao
          )
        }))
        
        // Sincronizar com backend
        const userId = getUserId()
        if (userId) {
          const sessaoAtualizada = get().sessoes.find(s => s.id === id)
          if (sessaoAtualizada) {
            updateSessaoApi(sessaoAtualizada, userId).catch(error => {
              console.error('Erro ao atualizar status da sessão no servidor:', error)
            })
          }
        }
      },
      
      editarSessao: (id, dados) => {
        // Atualizar state primeiro
        set((state) => ({
          sessoes: state.sessoes.map((sessao) =>
            sessao.id === id ? { ...sessao, ...dados } : sessao
          )
        }))
        
        // Sincronizar com backend
        const userId = getUserId()
        if (userId) {
          const sessaoAtualizada = get().sessoes.find(s => s.id === id)
          if (sessaoAtualizada) {
            updateSessaoApi(sessaoAtualizada, userId).catch(error => {
              console.error('Erro ao atualizar sessão no servidor:', error)
            })
          }
        }
      },
      
      carregarSessoes: async (userId) => {
        try {
          set({ isSyncing: true })
          
          // Carregar sessões do servidor
          const sessoesServidor = await fetchSessoesEstudo(userId)
          
          if (sessoesServidor.length > 0) {
            // Se temos dados do servidor, usamos eles
            set({ 
              sessoes: sessoesServidor,
              lastSyncedAt: Date.now(),
              isSyncing: false
            })
          } else {
            // Se não temos dados do servidor, tentamos sincronizar os dados locais
            get().sincronizar(userId)
          }
        } catch (error) {
          console.error('Erro ao carregar sessões de estudo:', error)
          set({ isSyncing: false })
        }
      },
      
      sincronizar: async (userId) => {
        try {
          set({ isSyncing: true })
          
          // Pegar sessões locais atuais
          const sessoesLocais = get().sessoes
          
          // Executar sincronização bidirecional
          const sessoesSincronizadas = await sincronizarSessoesEstudo(sessoesLocais, userId)
          
          // Atualizar store com dados sincronizados
          set({ 
            sessoes: sessoesSincronizadas,
            lastSyncedAt: Date.now(),
            isSyncing: false
          })
        } catch (error) {
          console.error('Erro ao sincronizar sessões de estudo:', error)
          set({ isSyncing: false })
        }
      },
      
      setSessoes: (sessoes) => {
        set({ sessoes })
      }
    }),
    {
      name: 'registro-estudos-storage',
      storage: createLocalStorage()
    }
  )
)
