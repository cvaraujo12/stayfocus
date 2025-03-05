import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Tipos
export type Tarefa = {
  id: string
  texto: string
  concluida: boolean
  cor?: string
}

export type Hiperfoco = {
  id: string
  titulo: string
  descricao: string
  tarefas: Tarefa[]
  subTarefas: Record<string, Tarefa[]> // Id da tarefa pai -> lista de sub-tarefas
  cor: string
  dataCriacao: string
  tempoLimite?: number // em minutos, opcional
}

export type SessaoAlternancia = {
  id: string
  titulo: string
  hiperfocoAtual: string | null // ID do hiperfoco ativo
  hiperfocoAnterior: string | null // ID do hiperfoco anterior
  tempoInicio: string
  duracaoEstimada: number // em minutos
  concluida: boolean
}

type HiperfocosState = {
  // Hiperfocos
  hiperfocos: Hiperfoco[]
  adicionarHiperfoco: (titulo: string, descricao: string, cor: string, tempoLimite?: number) => string
  atualizarHiperfoco: (id: string, titulo: string, descricao: string, cor: string, tempoLimite?: number) => void
  removerHiperfoco: (id: string) => void
  
  // Tarefas
  adicionarTarefa: (hiperfocoId: string, texto: string) => string
  atualizarTarefa: (hiperfocoId: string, tarefaId: string, texto: string) => void
  toggleTarefaConcluida: (hiperfocoId: string, tarefaId: string) => void
  removerTarefa: (hiperfocoId: string, tarefaId: string) => void
  
  // Sub-tarefas
  adicionarSubTarefa: (hiperfocoId: string, tarefaPaiId: string, texto: string) => string
  atualizarSubTarefa: (hiperfocoId: string, tarefaPaiId: string, subTarefaId: string, texto: string) => void
  toggleSubTarefaConcluida: (hiperfocoId: string, tarefaPaiId: string, subTarefaId: string) => void
  removerSubTarefa: (hiperfocoId: string, tarefaPaiId: string, subTarefaId: string) => void
  
  // Alternância
  sessoes: SessaoAlternancia[]
  adicionarSessao: (titulo: string, hiperfocoId: string, duracaoEstimada: number) => string
  atualizarSessao: (id: string, titulo: string, hiperfocoId: string, duracaoEstimada: number) => void
  concluirSessao: (id: string) => void
  removerSessao: (id: string) => void
  alternarHiperfoco: (sessaoId: string, novoHiperfocoId: string) => void
}

// Cores predefinidas para hiperfocos
export const CORES_HIPERFOCOS = [
  '#FF5252', // Vermelho
  '#4CAF50', // Verde
  '#2196F3', // Azul
  '#FF9800', // Laranja
  '#9C27B0', // Roxo
  '#795548', // Marrom
  '#607D8B'  // Azul acinzentado
]

export const useHiperfocosStore = create<HiperfocosState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      hiperfocos: [],
      sessoes: [],
      
      // Ações para hiperfocos
      adicionarHiperfoco: (titulo, descricao, cor, tempoLimite) => {
        const id = Date.now().toString()
        set((state) => ({
          hiperfocos: [
            ...state.hiperfocos,
            {
              id,
              titulo,
              descricao,
              tarefas: [],
              subTarefas: {},
              cor,
              dataCriacao: new Date().toISOString(),
              tempoLimite
            }
          ]
        }))
        return id
      },
      
      atualizarHiperfoco: (id, titulo, descricao, cor, tempoLimite) => {
        set((state) => ({
          hiperfocos: state.hiperfocos.map((hiperfoco) =>
            hiperfoco.id === id
              ? { ...hiperfoco, titulo, descricao, cor, tempoLimite }
              : hiperfoco
          )
        }))
      },
      
      removerHiperfoco: (id) => {
        set((state) => ({
          hiperfocos: state.hiperfocos.filter((hiperfoco) => hiperfoco.id !== id),
          // Também remover as sessões associadas a este hiperfoco
          sessoes: state.sessoes.filter(
            (sessao) => sessao.hiperfocoAtual !== id && sessao.hiperfocoAnterior !== id
          )
        }))
      },
      
      // Ações para tarefas
      adicionarTarefa: (hiperfocoId, texto) => {
        const tarefaId = Date.now().toString()
        
        set((state) => ({
          hiperfocos: state.hiperfocos.map((hiperfoco) => {
            if (hiperfoco.id === hiperfocoId) {
              return {
                ...hiperfoco,
                tarefas: [
                  ...hiperfoco.tarefas,
                  {
                    id: tarefaId,
                    texto,
                    concluida: false
                  }
                ],
                // Inicializar a entrada de subTarefas para esta tarefa
                subTarefas: {
                  ...hiperfoco.subTarefas,
                  [tarefaId]: []
                }
              }
            }
            return hiperfoco
          })
        }))
        
        return tarefaId
      },
      
      atualizarTarefa: (hiperfocoId, tarefaId, texto) => {
        set((state) => ({
          hiperfocos: state.hiperfocos.map((hiperfoco) => {
            if (hiperfoco.id === hiperfocoId) {
              return {
                ...hiperfoco,
                tarefas: hiperfoco.tarefas.map((tarefa) =>
                  tarefa.id === tarefaId ? { ...tarefa, texto } : tarefa
                )
              }
            }
            return hiperfoco
          })
        }))
      },
      
      toggleTarefaConcluida: (hiperfocoId, tarefaId) => {
        set((state) => ({
          hiperfocos: state.hiperfocos.map((hiperfoco) => {
            if (hiperfoco.id === hiperfocoId) {
              return {
                ...hiperfoco,
                tarefas: hiperfoco.tarefas.map((tarefa) =>
                  tarefa.id === tarefaId
                    ? { ...tarefa, concluida: !tarefa.concluida }
                    : tarefa
                )
              }
            }
            return hiperfoco
          })
        }))
      },
      
      removerTarefa: (hiperfocoId, tarefaId) => {
        set((state) => ({
          hiperfocos: state.hiperfocos.map((hiperfoco) => {
            if (hiperfoco.id === hiperfocoId) {
              // Filtrar a tarefa e também remover suas subtarefas
              const { [tarefaId]: subTarefasARemover, ...restoSubTarefas } = hiperfoco.subTarefas
              
              return {
                ...hiperfoco,
                tarefas: hiperfoco.tarefas.filter((tarefa) => tarefa.id !== tarefaId),
                subTarefas: restoSubTarefas
              }
            }
            return hiperfoco
          })
        }))
      },
      
      // Ações para sub-tarefas
      adicionarSubTarefa: (hiperfocoId, tarefaPaiId, texto) => {
        const subTarefaId = Date.now().toString()
        
        set((state) => ({
          hiperfocos: state.hiperfocos.map((hiperfoco) => {
            if (hiperfoco.id === hiperfocoId) {
              return {
                ...hiperfoco,
                subTarefas: {
                  ...hiperfoco.subTarefas,
                  [tarefaPaiId]: [
                    ...(hiperfoco.subTarefas[tarefaPaiId] || []),
                    {
                      id: subTarefaId,
                      texto,
                      concluida: false
                    }
                  ]
                }
              }
            }
            return hiperfoco
          })
        }))
        
        return subTarefaId
      },
      
      atualizarSubTarefa: (hiperfocoId, tarefaPaiId, subTarefaId, texto) => {
        set((state) => ({
          hiperfocos: state.hiperfocos.map((hiperfoco) => {
            if (hiperfoco.id === hiperfocoId) {
              return {
                ...hiperfoco,
                subTarefas: {
                  ...hiperfoco.subTarefas,
                  [tarefaPaiId]: (hiperfoco.subTarefas[tarefaPaiId] || []).map((subTarefa) =>
                    subTarefa.id === subTarefaId ? { ...subTarefa, texto } : subTarefa
                  )
                }
              }
            }
            return hiperfoco
          })
        }))
      },
      
      toggleSubTarefaConcluida: (hiperfocoId, tarefaPaiId, subTarefaId) => {
        set((state) => ({
          hiperfocos: state.hiperfocos.map((hiperfoco) => {
            if (hiperfoco.id === hiperfocoId) {
              return {
                ...hiperfoco,
                subTarefas: {
                  ...hiperfoco.subTarefas,
                  [tarefaPaiId]: (hiperfoco.subTarefas[tarefaPaiId] || []).map((subTarefa) =>
                    subTarefa.id === subTarefaId
                      ? { ...subTarefa, concluida: !subTarefa.concluida }
                      : subTarefa
                  )
                }
              }
            }
            return hiperfoco
          })
        }))
      },
      
      removerSubTarefa: (hiperfocoId, tarefaPaiId, subTarefaId) => {
        set((state) => ({
          hiperfocos: state.hiperfocos.map((hiperfoco) => {
            if (hiperfoco.id === hiperfocoId) {
              return {
                ...hiperfoco,
                subTarefas: {
                  ...hiperfoco.subTarefas,
                  [tarefaPaiId]: (hiperfoco.subTarefas[tarefaPaiId] || []).filter(
                    (subTarefa) => subTarefa.id !== subTarefaId
                  )
                }
              }
            }
            return hiperfoco
          })
        }))
      },
      
      // Ações para sessões de alternância
      adicionarSessao: (titulo, hiperfocoId, duracaoEstimada) => {
        const id = Date.now().toString()
        
        set((state) => ({
          sessoes: [
            ...state.sessoes,
            {
              id,
              titulo,
              hiperfocoAtual: hiperfocoId,
              hiperfocoAnterior: null,
              tempoInicio: new Date().toISOString(),
              duracaoEstimada,
              concluida: false
            }
          ]
        }))
        
        return id
      },
      
      atualizarSessao: (id, titulo, hiperfocoId, duracaoEstimada) => {
        set((state) => ({
          sessoes: state.sessoes.map((sessao) =>
            sessao.id === id
              ? { ...sessao, titulo, hiperfocoAtual: hiperfocoId, duracaoEstimada }
              : sessao
          )
        }))
      },
      
      concluirSessao: (id) => {
        set((state) => ({
          sessoes: state.sessoes.map((sessao) =>
            sessao.id === id ? { ...sessao, concluida: true } : sessao
          )
        }))
      },
      
      removerSessao: (id) => {
        set((state) => ({
          sessoes: state.sessoes.filter((sessao) => sessao.id !== id)
        }))
      },
      
      alternarHiperfoco: (sessaoId, novoHiperfocoId) => {
        set((state) => ({
          sessoes: state.sessoes.map((sessao) => {
            if (sessao.id === sessaoId) {
              return {
                ...sessao,
                hiperfocoAnterior: sessao.hiperfocoAtual,
                hiperfocoAtual: novoHiperfocoId,
                tempoInicio: new Date().toISOString()
              }
            }
            return sessao
          })
        }))
      }
    }),
    {
      name: 'hiperfocos-storage' // nome para o localStorage
    }
  )
)
