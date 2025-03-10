import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  fetchNotas, 
  addNota as addNotaApi, 
  updateNota as updateNotaApi, 
  deleteNota as deleteNotaApi,
  sincronizarNotas
} from '@/app/services/autoconhecimentoSyncService'

// Tipo para as notas
export type NotaAutoconhecimento = {
  id: string
  titulo: string
  conteudo: string
  dataCriacao: string
  tags: string[]
  secao?: 'quem-sou' | 'meus-porques' | 'meus-padroes'
  dataAtualizacao?: string
  imagemUrl?: string // URL para imagem âncora (opcional)
}

// Tipo para o estado da store
export type AutoconhecimentoState = {
  notas: NotaAutoconhecimento[]
  modoRefugio: boolean
  isSyncing: boolean
  lastSyncedAt: number | null
  
  // Ações básicas
  adicionarNota: (
    titulo: string,
    conteudo: string,
    secao?: 'quem-sou' | 'meus-porques' | 'meus-padroes',
    tags?: string[],
    imagemUrl?: string
  ) => string
  atualizarNota: (
    id: string,
    dados: Partial<Omit<NotaAutoconhecimento, 'id' | 'dataCriacao'>>
  ) => void
  removerNota: (id: string) => void
  adicionarTag: (id: string, tag: string) => void
  removerTag: (id: string, tag: string) => void
  adicionarImagem: (id: string, imagemUrl: string) => void
  removerImagem: (id: string) => void
  alternarModoRefugio: () => void
  buscarNotas: (termo: string) => NotaAutoconhecimento[]
  
  // Sincronização
  carregarNotas: (userId: string) => Promise<void>
  sincronizar: (userId: string) => Promise<void>
  setNotas: (notas: NotaAutoconhecimento[]) => void
}

// Estado inicial
const estadoInicial = {
  notas: [],
  modoRefugio: false,
  isSyncing: false,
  lastSyncedAt: null
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

// Criação da store com persistência
export const useAutoconhecimentoStore = create<AutoconhecimentoState>()(
  persist(
    (set, get) => ({
      ...estadoInicial,
      
      adicionarNota: (titulo, conteudo, secao, tags = [], imagemUrl) => {
        const id = crypto.randomUUID()
        const agora = new Date().toISOString()
        
        const novaNota: NotaAutoconhecimento = {
          id,
          titulo,
          conteudo,
          secao,
          tags,
          dataCriacao: agora.split('T')[0], // Apenas a data YYYY-MM-DD
          dataAtualizacao: agora,
          imagemUrl
        }
        
        // Atualizar state primeiro (UI responsiva)
        set((state) => ({
          notas: [...state.notas, novaNota]
        }))
        
        // Sincronizar com backend
        const userId = getUserId()
        if (userId) {
          addNotaApi(novaNota, userId).catch(error => {
            console.error('Erro ao adicionar nota no servidor:', error)
          })
        }
        
        return id
      },
      
      atualizarNota: (id, dados) => {
        // Atualizar state primeiro
        set((state) => ({
          notas: state.notas.map((nota) => 
            nota.id === id 
              ? { 
                  ...nota, 
                  ...dados, 
                  dataAtualizacao: new Date().toISOString() 
                } 
              : nota
          )
        }))
        
        // Sincronizar com backend
        const userId = getUserId()
        if (userId) {
          const notaAtualizada = get().notas.find(n => n.id === id)
          if (notaAtualizada) {
            updateNotaApi(notaAtualizada, userId).catch(error => {
              console.error('Erro ao atualizar nota no servidor:', error)
            })
          }
        }
      },
      
      removerNota: (id) => {
        // Remover localmente primeiro
        set((state) => ({
          notas: state.notas.filter((nota) => nota.id !== id)
        }))
        
        // Sincronizar com backend
        deleteNotaApi(id).catch(error => {
          console.error('Erro ao remover nota do servidor:', error)
        })
      },
      
      adicionarTag: (id, tag) => {
        // Atualizar state primeiro
        set((state) => ({
          notas: state.notas.map((nota) => 
            nota.id === id && !nota.tags.includes(tag)
              ? { 
                  ...nota, 
                  tags: [...nota.tags, tag],
                  dataAtualizacao: new Date().toISOString() 
                } 
              : nota
          )
        }))
        
        // Sincronizar com backend
        const userId = getUserId()
        if (userId) {
          const notaAtualizada = get().notas.find(n => n.id === id)
          if (notaAtualizada) {
            updateNotaApi(notaAtualizada, userId).catch(error => {
              console.error('Erro ao atualizar tags da nota no servidor:', error)
            })
          }
        }
      },
      
      removerTag: (id, tag) => {
        // Atualizar state primeiro
        set((state) => ({
          notas: state.notas.map((nota) => 
            nota.id === id
              ? { 
                  ...nota, 
                  tags: nota.tags.filter((t) => t !== tag),
                  dataAtualizacao: new Date().toISOString() 
                } 
              : nota
          )
        }))
        
        // Sincronizar com backend
        const userId = getUserId()
        if (userId) {
          const notaAtualizada = get().notas.find(n => n.id === id)
          if (notaAtualizada) {
            updateNotaApi(notaAtualizada, userId).catch(error => {
              console.error('Erro ao remover tag da nota no servidor:', error)
            })
          }
        }
      },
      
      adicionarImagem: (id, imagemUrl) => {
        // Atualizar state primeiro
        set((state) => ({
          notas: state.notas.map((nota) => 
            nota.id === id
              ? { 
                  ...nota, 
                  imagemUrl,
                  dataAtualizacao: new Date().toISOString() 
                } 
              : nota
          )
        }))
        
        // Sincronizar com backend
        const userId = getUserId()
        if (userId) {
          const notaAtualizada = get().notas.find(n => n.id === id)
          if (notaAtualizada) {
            updateNotaApi(notaAtualizada, userId).catch(error => {
              console.error('Erro ao adicionar imagem à nota no servidor:', error)
            })
          }
        }
      },
      
      removerImagem: (id) => {
        // Atualizar state primeiro
        set((state) => ({
          notas: state.notas.map((nota) => 
            nota.id === id
              ? { 
                  ...nota, 
                  imagemUrl: undefined,
                  dataAtualizacao: new Date().toISOString() 
                } 
              : nota
          )
        }))
        
        // Sincronizar com backend
        const userId = getUserId()
        if (userId) {
          const notaAtualizada = get().notas.find(n => n.id === id)
          if (notaAtualizada) {
            updateNotaApi(notaAtualizada, userId).catch(error => {
              console.error('Erro ao remover imagem da nota no servidor:', error)
            })
          }
        }
      },
      
      alternarModoRefugio: () => set((state) => ({
        modoRefugio: !state.modoRefugio
      })),
      
      buscarNotas: (termo) => {
        const { notas } = get()
        if (!termo.trim()) return notas
        
        const termoBusca = termo.toLowerCase()
        return notas.filter((nota) => 
          nota.titulo.toLowerCase().includes(termoBusca) ||
          nota.conteudo.toLowerCase().includes(termoBusca) ||
          nota.tags.some((tag) => tag.toLowerCase().includes(termoBusca))
        )
      },
      
      carregarNotas: async (userId) => {
        try {
          set({ isSyncing: true })
          
          // Carregar notas do servidor
          const notasServidor = await fetchNotas(userId)
          
          if (notasServidor.length > 0) {
            // Se temos dados do servidor, usamos eles
            set({ 
              notas: notasServidor,
              lastSyncedAt: Date.now(),
              isSyncing: false
            })
          } else {
            // Se não temos dados do servidor, tentamos sincronizar os dados locais
            get().sincronizar(userId)
          }
        } catch (error) {
          console.error('Erro ao carregar notas:', error)
          set({ isSyncing: false })
        }
      },
      
      sincronizar: async (userId) => {
        try {
          set({ isSyncing: true })
          
          // Pegar notas locais atuais
          const notasLocais = get().notas
          
          // Executar sincronização bidirecional
          const notasSincronizadas = await sincronizarNotas(notasLocais, userId)
          
          // Atualizar store com dados sincronizados
          set({ 
            notas: notasSincronizadas,
            lastSyncedAt: Date.now(),
            isSyncing: false
          })
        } catch (error) {
          console.error('Erro ao sincronizar notas:', error)
          set({ isSyncing: false })
        }
      },
      
      setNotas: (notas) => {
        set({ notas })
      }
    }),
    {
      name: 'autoconhecimento-storage',
      getStorage: () => localStorage
    }
  )
)
