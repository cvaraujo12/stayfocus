import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Tipos
export type Categoria = {
  id: string
  nome: string
  cor: string
  icone: string
}

export type Transacao = {
  id: string
  data: string
  valor: number
  descricao: string
  categoriaId: string
  tipo: 'receita' | 'despesa'
}

export type Envelope = {
  id: string
  nome: string
  cor: string
  valorAlocado: number
  valorUtilizado: number
}

export type PagamentoRecorrente = {
  id: string
  descricao: string
  valor: number
  dataVencimento: string // dia do mês (1-31)
  categoriaId: string
  proximoPagamento: string | null // data do próximo pagamento (YYYY-MM-DD)
  pago: boolean
}

type FinancasState = {
  // Categorias
  categorias: Categoria[]
  adicionarCategoria: (nome: string, cor: string, icone: string) => void
  atualizarCategoria: (id: string, nome: string, cor: string, icone: string) => void
  removerCategoria: (id: string) => void
  
  // Transações
  transacoes: Transacao[]
  adicionarTransacao: (data: string, valor: number, descricao: string, categoriaId: string, tipo: 'receita' | 'despesa') => void
  removerTransacao: (id: string) => void
  
  // Envelopes
  envelopes: Envelope[]
  adicionarEnvelope: (nome: string, cor: string, valorAlocado: number) => void
  atualizarEnvelope: (id: string, nome: string, cor: string, valorAlocado: number) => void
  removerEnvelope: (id: string) => void
  registrarGastoEnvelope: (id: string, valor: number) => void
  
  // Pagamentos Recorrentes
  pagamentosRecorrentes: PagamentoRecorrente[]
  adicionarPagamentoRecorrente: (descricao: string, valor: number, dataVencimento: string, categoriaId: string) => void
  atualizarPagamentoRecorrente: (id: string, descricao: string, valor: number, dataVencimento: string, categoriaId: string) => void
  removerPagamentoRecorrente: (id: string) => void
  marcarPagamentoComoPago: (id: string, pago: boolean) => void
  atualizarProximoPagamento: (id: string, data: string) => void
}

// Cores predefinidas para categorias (com alto contraste)
const CORES_CATEGORIAS = [
  '#FF5252', // Vermelho
  '#4CAF50', // Verde
  '#2196F3', // Azul
  '#FFC107', // Amarelo
  '#9C27B0'  // Roxo
]

// Ícones predefinidos para categorias
const ICONES_CATEGORIAS = [
  'home',    // Casa
  'shopping-cart', // Compras
  'utensils', // Alimentação
  'car',     // Transporte
  'heart'    // Saúde
]

export const useFinancasStore = create<FinancasState>()(
  persist(
    (set) => ({
      // Categorias - Estado Inicial
      categorias: [
        { id: '1', nome: 'Moradia', cor: CORES_CATEGORIAS[0], icone: 'home' },
        { id: '2', nome: 'Alimentação', cor: CORES_CATEGORIAS[1], icone: 'utensils' },
        { id: '3', nome: 'Transporte', cor: CORES_CATEGORIAS[2], icone: 'car' },
        { id: '4', nome: 'Saúde', cor: CORES_CATEGORIAS[3], icone: 'heart' },
        { id: '5', nome: 'Lazer', cor: CORES_CATEGORIAS[4], icone: 'music' },
      ],
      
      adicionarCategoria: (nome, cor, icone) => 
        set((state) => {
          // Limitar a 5 categorias
          if (state.categorias.length >= 5) return state
          
          return {
            categorias: [
              ...state.categorias,
              {
                id: Date.now().toString(),
                nome,
                cor,
                icone,
              },
            ],
          }
        }),
      
      atualizarCategoria: (id, nome, cor, icone) =>
        set((state) => ({
          categorias: state.categorias.map((categoria) =>
            categoria.id === id ? { ...categoria, nome, cor, icone } : categoria
          ),
        })),
      
      removerCategoria: (id) =>
        set((state) => ({
          categorias: state.categorias.filter((categoria) => categoria.id !== id),
          // Remover transações e pagamentos relacionados à categoria
          transacoes: state.transacoes.filter((transacao) => transacao.categoriaId !== id),
          pagamentosRecorrentes: state.pagamentosRecorrentes.filter(
            (pagamento) => pagamento.categoriaId !== id
          ),
        })),
      
      // Transações - Estado Inicial
      transacoes: [],
      
      adicionarTransacao: (data, valor, descricao, categoriaId, tipo) =>
        set((state) => ({
          transacoes: [
            ...state.transacoes,
            {
              id: Date.now().toString(),
              data,
              valor,
              descricao,
              categoriaId,
              tipo,
            },
          ],
        })),
      
      removerTransacao: (id) =>
        set((state) => ({
          transacoes: state.transacoes.filter((transacao) => transacao.id !== id),
        })),
      
      // Envelopes - Estado Inicial
      envelopes: [
        { id: '1', nome: 'Emergências', cor: '#FF5252', valorAlocado: 500, valorUtilizado: 0 },
        { id: '2', nome: 'Férias', cor: '#2196F3', valorAlocado: 300, valorUtilizado: 0 },
        { id: '3', nome: 'Presentes', cor: '#4CAF50', valorAlocado: 100, valorUtilizado: 0 },
      ],
      
      adicionarEnvelope: (nome, cor, valorAlocado) =>
        set((state) => ({
          envelopes: [
            ...state.envelopes,
            {
              id: Date.now().toString(),
              nome,
              cor,
              valorAlocado,
              valorUtilizado: 0,
            },
          ],
        })),
      
      atualizarEnvelope: (id, nome, cor, valorAlocado) =>
        set((state) => ({
          envelopes: state.envelopes.map((envelope) =>
            envelope.id === id ? { ...envelope, nome, cor, valorAlocado } : envelope
          ),
        })),
      
      removerEnvelope: (id) =>
        set((state) => ({
          envelopes: state.envelopes.filter((envelope) => envelope.id !== id),
        })),
      
      registrarGastoEnvelope: (id, valor) =>
        set((state) => ({
          envelopes: state.envelopes.map((envelope) =>
            envelope.id === id
              ? { ...envelope, valorUtilizado: envelope.valorUtilizado + valor }
              : envelope
          ),
        })),
      
      // Pagamentos Recorrentes - Estado Inicial
      pagamentosRecorrentes: [],
      
      adicionarPagamentoRecorrente: (descricao, valor, dataVencimento, categoriaId) => {
        const hoje = new Date()
        const dia = parseInt(dataVencimento)
        const proximoPagamento = new Date(hoje.getFullYear(), hoje.getMonth(), dia)
        
        // Se o dia já passou este mês, avançar para o próximo mês
        if (proximoPagamento.getDate() < hoje.getDate()) {
          proximoPagamento.setMonth(proximoPagamento.getMonth() + 1)
        }
        
        return set((state) => ({
          pagamentosRecorrentes: [
            ...state.pagamentosRecorrentes,
            {
              id: Date.now().toString(),
              descricao,
              valor,
              dataVencimento,
              categoriaId,
              proximoPagamento: proximoPagamento.toISOString().split('T')[0],
              pago: false,
            },
          ],
        }))
      },
      
      atualizarPagamentoRecorrente: (id, descricao, valor, dataVencimento, categoriaId) =>
        set((state) => ({
          pagamentosRecorrentes: state.pagamentosRecorrentes.map((pagamento) =>
            pagamento.id === id
              ? { ...pagamento, descricao, valor, dataVencimento, categoriaId }
              : pagamento
          ),
        })),
      
      removerPagamentoRecorrente: (id) =>
        set((state) => ({
          pagamentosRecorrentes: state.pagamentosRecorrentes.filter(
            (pagamento) => pagamento.id !== id
          ),
        })),
      
      marcarPagamentoComoPago: (id, pago) =>
        set((state) => {
          const pagamentos = state.pagamentosRecorrentes.map((pagamento) => {
            if (pagamento.id !== id) return pagamento
            
            if (pago) {
              // Se marcado como pago, calcular o próximo pagamento
              const dataAtual = new Date()
              const dia = parseInt(pagamento.dataVencimento)
              let proximoMes = dataAtual.getMonth() + 1
              let proximoAno = dataAtual.getFullYear()
              
              if (proximoMes > 11) {
                proximoMes = 0
                proximoAno++
              }
              
              const proximoPagamento = new Date(proximoAno, proximoMes, dia)
              
              return {
                ...pagamento,
                pago,
                proximoPagamento: proximoPagamento.toISOString().split('T')[0],
              }
            }
            
            return { ...pagamento, pago }
          })
          
          return { pagamentosRecorrentes: pagamentos }
        }),
      
      atualizarProximoPagamento: (id, data) =>
        set((state) => ({
          pagamentosRecorrentes: state.pagamentosRecorrentes.map((pagamento) =>
            pagamento.id === id ? { ...pagamento, proximoPagamento: data } : pagamento
          ),
        })),
    }),
    {
      name: 'financas-storage', // nome para o localStorage
    }
  )
)
