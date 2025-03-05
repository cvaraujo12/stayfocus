import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type PreferenciasVisuais = {
  altoContraste: boolean
  reducaoEstimulos: boolean
  textoGrande: boolean
}

export type MetasDiarias = {
  horasSono: number         // Horas ideais de sono
  tarefasPrioritarias: number // Número de tarefas prioritárias
  coposAgua: number         // Copos de água por dia
  pausasProgramadas: number // Número de pausas programadas
}

export type PerfilState = {
  nome: string
  preferenciasVisuais: PreferenciasVisuais
  metasDiarias: MetasDiarias
  notificacoesAtivas: boolean
  pausasAtivas: boolean
  // Ações
  atualizarNome: (nome: string) => void
  atualizarPreferenciasVisuais: (preferencias: Partial<PreferenciasVisuais>) => void
  atualizarMetasDiarias: (metas: Partial<MetasDiarias>) => void
  alternarNotificacoes: () => void
  alternarPausas: () => void
  resetarPerfil: () => void
}

const defaultState = {
  nome: 'Usuário',
  preferenciasVisuais: {
    altoContraste: false,
    reducaoEstimulos: false,
    textoGrande: false
  },
  metasDiarias: {
    horasSono: 8,
    tarefasPrioritarias: 3,
    coposAgua: 8,
    pausasProgramadas: 4
  },
  notificacoesAtivas: true,
  pausasAtivas: true
}

export const usePerfilStore = create<PerfilState>()(
  persist(
    (set) => ({
      ...defaultState,
      
      atualizarNome: (nome) => set({
        nome
      }),
      
      atualizarPreferenciasVisuais: (preferencias) => set((state) => ({
        preferenciasVisuais: {
          ...state.preferenciasVisuais,
          ...preferencias
        }
      })),
      
      atualizarMetasDiarias: (metas) => set((state) => ({
        metasDiarias: {
          ...state.metasDiarias,
          ...metas
        }
      })),
      
      alternarNotificacoes: () => set((state) => ({
        notificacoesAtivas: !state.notificacoesAtivas
      })),
      
      alternarPausas: () => set((state) => ({
        pausasAtivas: !state.pausasAtivas
      })),
      
      resetarPerfil: () => set(defaultState)
    }),
    {
      name: 'perfil-storage',
    }
  )
)
