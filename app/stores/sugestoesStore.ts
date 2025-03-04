import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SugestoesState {
  sugestoesFavoritas: string[]
  adicionarFavorita: (sugestao: string) => void
  removerFavorita: (sugestao: string) => void
}

export const useSugestoesStore = create<SugestoesState>()(
  persist(
    (set) => ({
      sugestoesFavoritas: [],
      
      adicionarFavorita: (sugestao) => set((state) => {
        // Evitar duplicatas
        if (state.sugestoesFavoritas.includes(sugestao)) {
          return state
        }
        return {
          sugestoesFavoritas: [...state.sugestoesFavoritas, sugestao]
        }
      }),
      
      removerFavorita: (sugestao) => set((state) => ({
        sugestoesFavoritas: state.sugestoesFavoritas.filter(s => s !== sugestao)
      })),
    }),
    {
      name: 'sugestoes-favoritas',
      getStorage: () => localStorage
    }
  )
)
