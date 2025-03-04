import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Atividade = {
  id: string
  nome: string
  categoria: string
  duracao: number // em minutos
  observacoes: string
  data: string
  concluida: boolean
}

interface AtividadesState {
  atividades: Atividade[]
  adicionarAtividade: (atividade: Atividade) => void
  removerAtividade: (id: string) => void
  marcarConcluida: (id: string) => void
}

export const useAtividadesStore = create<AtividadesState>()(
  persist(
    (set) => ({
      atividades: [],
      
      adicionarAtividade: (atividade) => set((state) => ({
        atividades: [...state.atividades, atividade]
      })),
      
      removerAtividade: (id) => set((state) => ({
        atividades: state.atividades.filter(a => a.id !== id)
      })),
      
      marcarConcluida: (id) => set((state) => ({
        atividades: state.atividades.map(a => 
          a.id === id ? { ...a, concluida: true } : a
        )
      })),
    }),
    {
      name: 'atividades-lazer',
      getStorage: () => localStorage
    }
  )
)
