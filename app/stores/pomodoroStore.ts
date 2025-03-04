import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type CicloPomodoro = 'foco' | 'pausa' | 'longapausa'

interface ConfiguracaoPomodoro {
  tempoFoco: number        // em minutos
  tempoPausa: number       // em minutos
  tempoLongapausa: number  // em minutos
  ciclosAntesLongapausa: number
}

interface PomodoroState {
  // Configuração do pomodoro
  configuracao: ConfiguracaoPomodoro
  atualizarConfiguracao: (config: Partial<ConfiguracaoPomodoro>) => void
  
  // Estatísticas
  ciclosCompletos: number
  incrementarCiclosCompletos: () => void
  resetarCiclosCompletos: () => void
}

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set) => ({
      // Configuração padrão
      configuracao: {
        tempoFoco: 25,
        tempoPausa: 5,
        tempoLongapausa: 15,
        ciclosAntesLongapausa: 4,
      },
      
      // Atualizar configuração
      atualizarConfiguracao: (config) => set((state) => ({
        configuracao: {
          ...state.configuracao,
          ...config,
        }
      })),
      
      // Estatísticas
      ciclosCompletos: 0,
      
      incrementarCiclosCompletos: () => set((state) => ({
        ciclosCompletos: state.ciclosCompletos + 1
      })),
      
      resetarCiclosCompletos: () => set({
        ciclosCompletos: 0
      }),
    }),
    {
      name: 'pomodoro-storage',
      getStorage: () => localStorage
    }
  )
)
