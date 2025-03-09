import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createLocalStorage } from './storage'
import {
  Medicamento,
  RegistroMedicamento,
  fetchMedicamentos,
  fetchRegistrosMedicamento,
  addMedicamento as addMedicamentoApi,
  updateMedicamento as updateMedicamentoApi,
  deleteMedicamento as deleteMedicamentoApi,
  addRegistroMedicamento as addRegistroApi,
  updateRegistroMedicamento as updateRegistroApi,
  deleteRegistroMedicamento as deleteRegistroApi,
  sincronizarMedicamentos,
  sincronizarRegistrosMedicamento
} from '@/app/services/medicamentoSyncService'

interface MedicamentosState {
  medicamentos: Medicamento[]
  registros: RegistroMedicamento[]
  isSyncingMedicamentos: boolean
  isSyncingRegistros: boolean
  lastSyncedMedicamentosAt: number | null
  lastSyncedRegistrosAt: number | null
  
  // Ações para medicamentos
  adicionarMedicamento: (
    nome: string, 
    dosagem?: string, 
    horarios?: string[], 
    diasSemana?: string[], 
    observacoes?: string
  ) => string
  atualizarMedicamento: (id: string, dados: Partial<Omit<Medicamento, 'id'>>) => void
  removerMedicamento: (id: string) => void
  
  // Ações para registros
  registrarTomada: (
    medicamentoId: string, 
    tomado: boolean, 
    humorAntes?: number, 
    humorDepois?: number, 
    observacoes?: string
  ) => string
  atualizarRegistro: (id: string, dados: Partial<Omit<RegistroMedicamento, 'id' | 'medicamentoId'>>) => void
  removerRegistro: (id: string) => void
  
  // Consultas
  getRegistrosPorData: (data: string) => RegistroMedicamento[]
  getRegistrosPorMedicamento: (medicamentoId: string) => RegistroMedicamento[]
  getMedicamentosParaHoje: () => Medicamento[]
  
  // Sincronização
  carregarMedicamentos: (userId: string) => Promise<void>
  carregarRegistros: (userId: string) => Promise<void>
  sincronizarTudo: (userId: string) => Promise<void>
  setMedicamentos: (medicamentos: Medicamento[]) => void
  setRegistros: (registros: RegistroMedicamento[]) => void
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

// Helper para verificar se um medicamento deve ser tomado hoje
const ehDiaDeTomar = (diasSemana: string[]): boolean => {
  const hoje = new Date()
  const diaSemana = hoje.getDay()
  const diasSemanaMap: Record<number, string> = {
    0: 'dom',
    1: 'seg',
    2: 'ter',
    3: 'qua',
    4: 'qui',
    5: 'sex',
    6: 'sab',
  }
  
  return diasSemana.includes(diasSemanaMap[diaSemana])
}

// Criação do store
export const useMedicamentosStore = create<MedicamentosState>()(
  persist(
    (set, get) => ({
      medicamentos: [],
      registros: [],
      isSyncingMedicamentos: false,
      isSyncingRegistros: false,
      lastSyncedMedicamentosAt: null,
      lastSyncedRegistrosAt: null,
      
      // Ações para medicamentos
      adicionarMedicamento: (nome, dosagem, horarios = [], diasSemana = [], observacoes) => {
        const id = crypto.randomUUID()
        
        const novoMedicamento: Medicamento = {
          id,
          nome,
          dosagem,
          horarios,
          diasSemana,
          observacoes
        }
        
        // Atualizar state primeiro (UI responsiva)
        set((state) => ({
          medicamentos: [...state.medicamentos, novoMedicamento]
        }))
        
        // Sincronizar com backend
        const userId = getUserId()
        if (userId) {
          addMedicamentoApi(novoMedicamento, userId).catch(error => {
            console.error('Erro ao adicionar medicamento no servidor:', error)
          })
        }
        
        return id
      },
      
      atualizarMedicamento: (id, dados) => {
        // Atualizar state primeiro
        set((state) => ({
          medicamentos: state.medicamentos.map((med) => 
            med.id === id 
              ? { ...med, ...dados } 
              : med
          )
        }))
        
        // Sincronizar com backend
        const userId = getUserId()
        if (userId) {
          const medicamentoAtualizado = get().medicamentos.find(m => m.id === id)
          if (medicamentoAtualizado) {
            updateMedicamentoApi(medicamentoAtualizado, userId).catch(error => {
              console.error('Erro ao atualizar medicamento no servidor:', error)
            })
          }
        }
      },
      
      removerMedicamento: (id) => {
        // Remover localmente primeiro
        set((state) => ({
          medicamentos: state.medicamentos.filter((med) => med.id !== id)
        }))
        
        // Sincronizar com backend
        deleteMedicamentoApi(id).catch(error => {
          console.error('Erro ao remover medicamento do servidor:', error)
        })
      },
      
      // Ações para registros
      registrarTomada: (medicamentoId, tomado, humorAntes, humorDepois, observacoes) => {
        const id = crypto.randomUUID()
        const agora = new Date()
        const dataRegistro = agora.toISOString().split('T')[0]
        const horaRegistro = `${agora.getHours().toString().padStart(2, '0')}:${agora.getMinutes().toString().padStart(2, '0')}`
        
        const novoRegistro: RegistroMedicamento = {
          id,
          medicamentoId,
          dataRegistro,
          horaRegistro,
          tomado,
          humorAntes,
          humorDepois,
          observacoes
        }
        
        // Atualizar state primeiro (UI responsiva)
        set((state) => ({
          registros: [...state.registros, novoRegistro]
        }))
        
        // Sincronizar com backend
        const userId = getUserId()
        if (userId) {
          addRegistroApi(novoRegistro, userId).catch(error => {
            console.error('Erro ao adicionar registro de medicamento no servidor:', error)
          })
        }
        
        return id
      },
      
      atualizarRegistro: (id, dados) => {
        // Atualizar state primeiro
        set((state) => ({
          registros: state.registros.map((reg) => 
            reg.id === id 
              ? { ...reg, ...dados } 
              : reg
          )
        }))
        
        // Sincronizar com backend
        const userId = getUserId()
        if (userId) {
          const registroAtualizado = get().registros.find(r => r.id === id)
          if (registroAtualizado) {
            updateRegistroApi(registroAtualizado, userId).catch(error => {
              console.error('Erro ao atualizar registro de medicamento no servidor:', error)
            })
          }
        }
      },
      
      removerRegistro: (id) => {
        // Remover localmente primeiro
        set((state) => ({
          registros: state.registros.filter((reg) => reg.id !== id)
        }))
        
        // Sincronizar com backend
        deleteRegistroApi(id).catch(error => {
          console.error('Erro ao remover registro de medicamento do servidor:', error)
        })
      },
      
      // Consultas
      getRegistrosPorData: (data) => {
        return get().registros.filter(reg => reg.dataRegistro === data)
      },
      
      getRegistrosPorMedicamento: (medicamentoId) => {
        return get().registros.filter(reg => reg.medicamentoId === medicamentoId)
      },
      
      getMedicamentosParaHoje: () => {
        const medicamentos = get().medicamentos
        return medicamentos.filter(med => ehDiaDeTomar(med.diasSemana))
      },
      
      // Sincronização
      carregarMedicamentos: async (userId) => {
        try {
          set({ isSyncingMedicamentos: true })
          
          // Carregar medicamentos do servidor
          const medicamentosServidor = await fetchMedicamentos(userId)
          
          if (medicamentosServidor.length > 0) {
            // Se temos dados do servidor, usamos eles
            set({ 
              medicamentos: medicamentosServidor,
              lastSyncedMedicamentosAt: Date.now(),
              isSyncingMedicamentos: false
            })
          } else {
            // Se não temos dados do servidor, tentamos sincronizar os dados locais
            const medicamentosLocais = get().medicamentos
            const medicamentosSincronizados = await sincronizarMedicamentos(medicamentosLocais, userId)
            
            set({ 
              medicamentos: medicamentosSincronizados,
              lastSyncedMedicamentosAt: Date.now(),
              isSyncingMedicamentos: false
            })
          }
        } catch (error) {
          console.error('Erro ao carregar medicamentos:', error)
          set({ isSyncingMedicamentos: false })
        }
      },
      
      carregarRegistros: async (userId) => {
        try {
          set({ isSyncingRegistros: true })
          
          // Carregar registros do servidor
          const registrosServidor = await fetchRegistrosMedicamento(userId)
          
          if (registrosServidor.length > 0) {
            // Se temos dados do servidor, usamos eles
            set({ 
              registros: registrosServidor,
              lastSyncedRegistrosAt: Date.now(),
              isSyncingRegistros: false
            })
          } else {
            // Se não temos dados do servidor, tentamos sincronizar os dados locais
            const registrosLocais = get().registros
            const registrosSincronizados = await sincronizarRegistrosMedicamento(registrosLocais, userId)
            
            set({ 
              registros: registrosSincronizados,
              lastSyncedRegistrosAt: Date.now(),
              isSyncingRegistros: false
            })
          }
        } catch (error) {
          console.error('Erro ao carregar registros de medicamentos:', error)
          set({ isSyncingRegistros: false })
        }
      },
      
      sincronizarTudo: async (userId) => {
        try {
          set({ 
            isSyncingMedicamentos: true,
            isSyncingRegistros: true
          })
          
          // Sincronizar medicamentos
          const medicamentosLocais = get().medicamentos
          const medicamentosSincronizados = await sincronizarMedicamentos(medicamentosLocais, userId)
          
          // Sincronizar registros
          const registrosLocais = get().registros
          const registrosSincronizados = await sincronizarRegistrosMedicamento(registrosLocais, userId)
          
          // Atualizar store com dados sincronizados
          set({ 
            medicamentos: medicamentosSincronizados,
            registros: registrosSincronizados,
            lastSyncedMedicamentosAt: Date.now(),
            lastSyncedRegistrosAt: Date.now(),
            isSyncingMedicamentos: false,
            isSyncingRegistros: false
          })
        } catch (error) {
          console.error('Erro ao sincronizar dados de medicamentos:', error)
          set({ 
            isSyncingMedicamentos: false,
            isSyncingRegistros: false
          })
        }
      },
      
      setMedicamentos: (medicamentos) => {
        set({ medicamentos })
      },
      
      setRegistros: (registros) => {
        set({ registros })
      }
    }),
    {
      name: 'medicamentos-storage',
      storage: createLocalStorage()
    }
  )
) 