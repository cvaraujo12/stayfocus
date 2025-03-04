import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SessaoEstudo = {
  id: string
  titulo: string
  descricao: string
  duracao: number // em minutos
  data: string
  completo: boolean
}

// Dados iniciais para demonstração
const sessoesIniciais: SessaoEstudo[] = [
  {
    id: '1',
    titulo: 'Matemática - Álgebra Linear',
    descricao: 'Revisão de matrizes e determinantes',
    duracao: 45,
    data: '2023-03-03',
    completo: true,
  },
  {
    id: '2',
    titulo: 'Inglês - Vocabulário',
    descricao: 'Praticar vocabulário técnico',
    duracao: 30,
    data: '2023-03-04',
    completo: false,
  },
]

interface RegistroEstudosState {
  sessoes: SessaoEstudo[]
  adicionarSessao: (sessao: Omit<SessaoEstudo, 'id' | 'data' | 'completo'>) => void
  removerSessao: (id: string) => void
  alternarCompletar: (id: string) => void
  editarSessao: (id: string, dados: Pick<SessaoEstudo, 'titulo' | 'descricao' | 'duracao'>) => void
}

export const useRegistroEstudosStore = create<RegistroEstudosState>()(
  persist(
    (set) => ({
      sessoes: sessoesIniciais,
      
      adicionarSessao: (sessao) => set((state) => {
        const hoje = new Date().toISOString().split('T')[0]
        
        return {
          sessoes: [
            ...state.sessoes,
            {
              id: Date.now().toString(),
              titulo: sessao.titulo,
              descricao: sessao.descricao,
              duracao: sessao.duracao,
              data: hoje,
              completo: false,
            },
          ],
        }
      }),
      
      removerSessao: (id) => set((state) => ({
        sessoes: state.sessoes.filter((sessao) => sessao.id !== id)
      })),
      
      alternarCompletar: (id) => set((state) => ({
        sessoes: state.sessoes.map((sessao) =>
          sessao.id === id ? { ...sessao, completo: !sessao.completo } : sessao
        )
      })),
      
      editarSessao: (id, dados) => set((state) => ({
        sessoes: state.sessoes.map((sessao) =>
          sessao.id === id
            ? {
                ...sessao,
                titulo: dados.titulo,
                descricao: dados.descricao,
                duracao: dados.duracao,
              }
            : sessao
        )
      })),
    }),
    {
      name: 'registro-estudos-storage',
      getStorage: () => localStorage
    }
  )
)
