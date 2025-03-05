import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Tipo para as notas
export type Nota = {
  id: string
  titulo: string
  conteudo: string
  secao: 'quem-sou' | 'meus-porques' | 'meus-padroes'
  tags: string[]
  dataCriacao: string
  dataAtualizacao: string
  imagemUrl?: string // URL para imagem âncora (opcional)
}

// Tipo para o estado da store
export type AutoconhecimentoState = {
  notas: Nota[]
  modoRefugio: boolean
  // Ações
  adicionarNota: (
    titulo: string,
    conteudo: string,
    secao: 'quem-sou' | 'meus-porques' | 'meus-padroes',
    tags?: string[],
    imagemUrl?: string
  ) => string
  atualizarNota: (
    id: string,
    dados: Partial<Omit<Nota, 'id' | 'dataCriacao'>>
  ) => void
  removerNota: (id: string) => void
  adicionarTag: (id: string, tag: string) => void
  removerTag: (id: string, tag: string) => void
  adicionarImagem: (id: string, imagemUrl: string) => void
  removerImagem: (id: string) => void
  alternarModoRefugio: () => void
  buscarNotas: (termo: string) => Nota[]
}

// Estado inicial
const estadoInicial = {
  notas: [],
  modoRefugio: false
}

// Criação da store com persistência
export const useAutoconhecimentoStore = create<AutoconhecimentoState>()(
  persist(
    (set, get) => ({
      ...estadoInicial,
      
      adicionarNota: (titulo, conteudo, secao, tags = [], imagemUrl) => {
        const id = Date.now().toString()
        const agora = new Date().toISOString()
        
        set((state) => ({
          notas: [
            ...state.notas,
            {
              id,
              titulo,
              conteudo,
              secao,
              tags,
              dataCriacao: agora,
              dataAtualizacao: agora,
              imagemUrl
            }
          ]
        }))
        
        return id
      },
      
      atualizarNota: (id, dados) => set((state) => ({
        notas: state.notas.map((nota) => 
          nota.id === id 
            ? { 
                ...nota, 
                ...dados, 
                dataAtualizacao: new Date().toISOString() 
              } 
            : nota
        )
      })),
      
      removerNota: (id) => set((state) => ({
        notas: state.notas.filter((nota) => nota.id !== id)
      })),
      
      adicionarTag: (id, tag) => set((state) => ({
        notas: state.notas.map((nota) => 
          nota.id === id && !nota.tags.includes(tag)
            ? { 
                ...nota, 
                tags: [...nota.tags, tag],
                dataAtualizacao: new Date().toISOString() 
              } 
            : nota
        )
      })),
      
      removerTag: (id, tag) => set((state) => ({
        notas: state.notas.map((nota) => 
          nota.id === id
            ? { 
                ...nota, 
                tags: nota.tags.filter((t) => t !== tag),
                dataAtualizacao: new Date().toISOString() 
              } 
            : nota
        )
      })),
      
      adicionarImagem: (id, imagemUrl) => set((state) => ({
        notas: state.notas.map((nota) => 
          nota.id === id
            ? { 
                ...nota, 
                imagemUrl,
                dataAtualizacao: new Date().toISOString() 
              } 
            : nota
        )
      })),
      
      removerImagem: (id) => set((state) => ({
        notas: state.notas.map((nota) => 
          nota.id === id
            ? { 
                ...nota, 
                imagemUrl: undefined,
                dataAtualizacao: new Date().toISOString() 
              } 
            : nota
        )
      })),
      
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
      }
    }),
    {
      name: 'autoconhecimento-storage',
    }
  )
)
