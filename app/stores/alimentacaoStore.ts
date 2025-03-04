import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Tipos
export type Refeicao = {
  id: string
  horario: string
  descricao: string
}

export type RegistroRefeicao = {
  id: string
  data: string
  horario: string
  descricao: string
  tipoIcone: string | null
  foto: string | null
}

type AlimentacaoState = {
  // Planejador de Refeições
  refeicoes: Refeicao[]
  adicionarRefeicao: (horario: string, descricao: string) => void
  atualizarRefeicao: (id: string, horario: string, descricao: string) => void
  removerRefeicao: (id: string) => void
  
  // Registro de Refeições
  registros: RegistroRefeicao[]
  adicionarRegistro: (horario: string, descricao: string, tipoIcone: string | null, foto: string | null) => void
  removerRegistro: (id: string) => void
  
  // Hidratação
  coposBebidos: number
  metaDiaria: number
  ultimoRegistro: string | null
  adicionarCopo: () => void
  removerCopo: () => void
  ajustarMeta: (valor: number) => void
}

export const useAlimentacaoStore = create<AlimentacaoState>()(
  persist(
    (set) => ({
      // Planejador de Refeições - Estado Inicial
      refeicoes: [
        { id: '1', horario: '07:30', descricao: 'Café da manhã' },
        { id: '2', horario: '12:00', descricao: 'Almoço' },
        { id: '3', horario: '16:00', descricao: 'Lanche da tarde' },
        { id: '4', horario: '19:30', descricao: 'Jantar' },
      ],
      
      adicionarRefeicao: (horario, descricao) => 
        set((state) => ({
          refeicoes: [
            ...state.refeicoes,
            {
              id: Date.now().toString(),
              horario,
              descricao,
            },
          ],
        })),
      
      atualizarRefeicao: (id, horario, descricao) =>
        set((state) => ({
          refeicoes: state.refeicoes.map((refeicao) =>
            refeicao.id === id ? { ...refeicao, horario, descricao } : refeicao
          ),
        })),
      
      removerRefeicao: (id) =>
        set((state) => ({
          refeicoes: state.refeicoes.filter((refeicao) => refeicao.id !== id),
        })),
      
      // Registro de Refeições - Estado Inicial
      registros: [
        {
          id: '1',
          data: '2025-03-03',
          horario: '08:30',
          descricao: 'Café da manhã',
          tipoIcone: 'cafe',
          foto: null,
        },
      ],
      
      adicionarRegistro: (horario, descricao, tipoIcone, foto) =>
        set((state) => {
          const hoje = new Date().toISOString().split('T')[0]
          return {
            registros: [
              ...state.registros,
              {
                id: Date.now().toString(),
                data: hoje,
                horario,
                descricao,
                tipoIcone,
                foto,
              },
            ],
          }
        }),
      
      removerRegistro: (id) =>
        set((state) => ({
          registros: state.registros.filter((registro) => registro.id !== id),
        })),
      
      // Hidratação - Estado Inicial
      coposBebidos: 0,
      metaDiaria: 8,
      ultimoRegistro: null,
      
      adicionarCopo: () =>
        set((state) => {
          if (state.coposBebidos < state.metaDiaria) {
            return {
              coposBebidos: state.coposBebidos + 1,
              ultimoRegistro: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          }
          return state
        }),
      
      removerCopo: () =>
        set((state) => ({
          coposBebidos: Math.max(0, state.coposBebidos - 1),
        })),
      
      ajustarMeta: (valor) =>
        set((state) => {
          const novaMeta = state.metaDiaria + valor
          if (novaMeta >= 1 && novaMeta <= 15) {
            return { metaDiaria: novaMeta }
          }
          return state
        }),
    }),
    {
      name: 'alimentacao-storage', // nome para o localStorage
    }
  )
)
