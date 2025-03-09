import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createLocalStorage } from './storage'
import { 
  fetchPrioridades, 
  addPrioridade as addPrioridadeApi, 
  updatePrioridade as updatePrioridadeApi, 
  deletePrioridade as deletePrioridadeApi,
  sincronizarPrioridades
} from '@/app/services/prioridadesSyncService'

export type Prioridade = {
  id: string
  texto: string
  concluida: boolean
  data: string // formato ISO: YYYY-MM-DD
}

interface PrioridadesState {
  prioridades: Prioridade[]
  isSyncing: boolean
  lastSyncedAt: number | null
  
  // Ações básicas
  adicionarPrioridade: (prioridade: Omit<Prioridade, 'id' | 'data'>) => void
  editarPrioridade: (id: string, texto: string) => void
  removerPrioridade: (id: string) => void
  toggleConcluida: (id: string) => void
  
  // Consultas
  getHistoricoPorData: (data?: string) => Prioridade[]
  getDatasPrioridades: () => string[]
  
  // Sincronização
  carregarPrioridades: (userId: string) => Promise<void>
  sincronizar: (userId: string) => Promise<void>
  setPrioridades: (prioridades: Prioridade[]) => void
}

export const usePrioridadesStore = create<PrioridadesState>()(
  persist(
    (set, get) => ({
      prioridades: [],
      isSyncing: false,
      lastSyncedAt: null,
      
      adicionarPrioridade: (prioridade) => {
        // Obter a data atual em formato ISO (YYYY-MM-DD)
        const dataAtual = new Date().toISOString().split('T')[0]
        
        // Criar nova prioridade com ID e data
        const novaPrioridade: Prioridade = {
          ...prioridade,
          id: crypto.randomUUID(),
          data: dataAtual
        }
        
        // Atualizar state primeiro (para UI responsiva)
        set((state) => ({
          prioridades: [...state.prioridades, novaPrioridade]
        }))
        
        // Sincronizar com o backend se houver um usuário ativo
        const userData = localStorage.getItem('auth-user')
        if (userData) {
          try {
            const user = JSON.parse(userData)
            if (user?.id) {
              // Não esperamos pela Promise para manter a UI responsiva
              addPrioridadeApi(novaPrioridade, user.id)
            }
          } catch (error) {
            console.error('Erro ao sincronizar nova prioridade:', error)
          }
        }
      },
      
      editarPrioridade: (id, texto) => {
        // Atualizar state primeiro
        set((state) => ({
          prioridades: state.prioridades.map(p => 
            p.id === id ? { ...p, texto } : p
          )
        }))
        
        // Sincronizar alteração
        const userData = localStorage.getItem('auth-user')
        if (userData) {
          try {
            const user = JSON.parse(userData)
            if (user?.id) {
              const prioridadeAtualizada = get().prioridades.find(p => p.id === id)
              if (prioridadeAtualizada) {
                updatePrioridadeApi(prioridadeAtualizada, user.id)
              }
            }
          } catch (error) {
            console.error('Erro ao sincronizar edição de prioridade:', error)
          }
        }
      },
      
      removerPrioridade: (id) => {
        // Remover localmente primeiro
        set((state) => ({
          prioridades: state.prioridades.filter(p => p.id !== id)
        }))
        
        // Sincronizar remoção
        deletePrioridadeApi(id).catch(error => {
          console.error('Erro ao remover prioridade do servidor:', error)
        })
      },
      
      toggleConcluida: (id) => {
        // Atualizar state primeiro
        set((state) => {
          const prioridades = state.prioridades.map(p => 
            p.id === id ? { ...p, concluida: !p.concluida } : p
          )
          return { prioridades }
        })
        
        // Sincronizar alteração
        const userData = localStorage.getItem('auth-user')
        if (userData) {
          try {
            const user = JSON.parse(userData)
            if (user?.id) {
              const prioridadeAtualizada = get().prioridades.find(p => p.id === id)
              if (prioridadeAtualizada) {
                updatePrioridadeApi(prioridadeAtualizada, user.id)
              }
            }
          } catch (error) {
            console.error('Erro ao sincronizar status de prioridade:', error)
          }
        }
      },
      
      getHistoricoPorData: (data) => {
        const dataFiltro = data || new Date().toISOString().split('T')[0]
        return get().prioridades.filter(p => p.data === dataFiltro)
      },
      
      getDatasPrioridades: () => {
        // Retorna array de datas únicas (sem repetições)
        const datas = get().prioridades.map(p => p.data)
        return Array.from(new Set(datas)).sort().reverse() // Mais recentes primeiro
      },
      
      carregarPrioridades: async (userId) => {
        try {
          set({ isSyncing: true })
          
          // Carregar prioridades do servidor
          const prioridadesServidor = await fetchPrioridades(userId)
          
          if (prioridadesServidor.length > 0) {
            // Se temos dados do servidor, usamos eles
            set({ 
              prioridades: prioridadesServidor,
              lastSyncedAt: Date.now(),
              isSyncing: false
            })
          } else {
            // Se não temos dados do servidor, tentamos sincronizar os dados locais
            get().sincronizar(userId)
          }
        } catch (error) {
          console.error('Erro ao carregar prioridades:', error)
          set({ isSyncing: false })
        }
      },
      
      sincronizar: async (userId) => {
        try {
          set({ isSyncing: true })
          
          // Pegar prioridades locais atuais
          const prioridadesLocais = get().prioridades
          
          // Executar sincronização bidirecional
          const prioridadesSincronizadas = await sincronizarPrioridades(prioridadesLocais, userId)
          
          // Atualizar store com dados sincronizados
          set({ 
            prioridades: prioridadesSincronizadas,
            lastSyncedAt: Date.now(),
            isSyncing: false
          })
        } catch (error) {
          console.error('Erro ao sincronizar prioridades:', error)
          set({ isSyncing: false })
        }
      },
      
      setPrioridades: (prioridades) => {
        set({ prioridades })
      }
    }),
    {
      name: 'prioridades-diarias',
      storage: createLocalStorage()
    }
  )
)
