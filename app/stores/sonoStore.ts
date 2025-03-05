import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type RegistroSono = {
  id: string
  inicio: string // ISO date string
  fim: string | null // ISO date string ou null se ainda não acordou
  qualidade: number | null // 1-5, onde 5 é a melhor qualidade
  notas: string
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
  // Ações
  adicionarRegistroSono: (inicio: string, fim?: string | null, qualidade?: number | null, notas?: string) => void
  atualizarRegistroSono: (id: string, dados: Partial<Omit<RegistroSono, 'id'>>) => void
  removerRegistroSono: (id: string) => void
  adicionarLembrete: (tipo: 'dormir' | 'acordar', horario: string, diasSemana: number[]) => void
  atualizarLembrete: (id: string, dados: Partial<Omit<ConfiguracaoLembrete, 'id'>>) => void
  removerLembrete: (id: string) => void
  alternarAtivoLembrete: (id: string) => void
}

export const useSonoStore = create<SonoState>()(
  persist(
    (set) => ({
      registros: [],
      lembretes: [],
      
      adicionarRegistroSono: (inicio, fim = null, qualidade = null, notas = '') => set((state) => ({
        registros: [
          ...state.registros,
          {
            id: Date.now().toString(),
            inicio,
            fim,
            qualidade,
            notas
          }
        ]
      })),
      
      atualizarRegistroSono: (id, dados) => set((state) => ({
        registros: state.registros.map((registro) => 
          registro.id === id 
            ? { ...registro, ...dados } 
            : registro
        )
      })),
      
      removerRegistroSono: (id) => set((state) => ({
        registros: state.registros.filter((registro) => registro.id !== id)
      })),
      
      adicionarLembrete: (tipo, horario, diasSemana) => set((state) => ({
        lembretes: [
          ...state.lembretes,
          {
            id: Date.now().toString(),
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
      }))
    }),
    {
      name: 'sono-storage',
    }
  )
)
