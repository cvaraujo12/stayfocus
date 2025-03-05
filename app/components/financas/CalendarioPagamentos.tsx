'use client'

import { useState, useEffect } from 'react'
import { useFinancasStore } from '@/app/stores/financasStore'
import { Calendar, Plus, Check, X, ChevronLeft, ChevronRight } from 'lucide-react'

export function CalendarioPagamentos() {
  const { 
    pagamentosRecorrentes, 
    categorias,
    adicionarPagamentoRecorrente, 
    removerPagamentoRecorrente,
    marcarPagamentoComoPago
  } = useFinancasStore()
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [novoPagamento, setNovoPagamento] = useState({
    descricao: '',
    valor: 0,
    dataVencimento: '1', // dia do mês
    categoriaId: ''
  })
  
  const [mesAtual, setMesAtual] = useState(new Date().getMonth())
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear())
  
  // Formatador para valores monetários
  const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
  
  // Obter os nomes dos meses em português
  const nomesMeses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
  
  // Avançar para o próximo mês
  const avancarMes = () => {
    if (mesAtual === 11) {
      setMesAtual(0)
      setAnoAtual(anoAtual + 1)
    } else {
      setMesAtual(mesAtual + 1)
    }
  }
  
  // Retroceder para o mês anterior
  const retrocederMes = () => {
    if (mesAtual === 0) {
      setMesAtual(11)
      setAnoAtual(anoAtual - 1)
    } else {
      setMesAtual(mesAtual - 1)
    }
  }
  
  // Verificar se um pagamento é do mês atual
  const isDoMesAtual = (dataVencimento: string) => {
    const dia = parseInt(dataVencimento)
    const data = new Date(anoAtual, mesAtual, dia)
    return data.getMonth() === mesAtual && data.getFullYear() === anoAtual
  }
  
  // Filtrar pagamentos do mês atual
  const pagamentosDoMes = pagamentosRecorrentes.filter(pagamento => {
    return isDoMesAtual(pagamento.dataVencimento)
  })
  
  // Ordenar pagamentos por dia
  const pagamentosOrdenados = [...pagamentosDoMes].sort((a, b) => {
    return parseInt(a.dataVencimento) - parseInt(b.dataVencimento)
  })
  
  // Adicionar novo pagamento recorrente
  const handleAdicionarPagamento = () => {
    if (
      !novoPagamento.descricao || 
      novoPagamento.valor <= 0 || 
      !novoPagamento.dataVencimento || 
      !novoPagamento.categoriaId
    ) return
    
    adicionarPagamentoRecorrente(
      novoPagamento.descricao,
      novoPagamento.valor,
      novoPagamento.dataVencimento,
      novoPagamento.categoriaId
    )
    
    setNovoPagamento({
      descricao: '',
      valor: 0,
      dataVencimento: '1',
      categoriaId: ''
    })
    
    setMostrarFormulario(false)
  }
  
  // Verificar se um dia já passou no mês atual
  const isDataPassada = (dia: number) => {
    const hoje = new Date()
    const dataPagamento = new Date(anoAtual, mesAtual, dia)
    return dataPagamento < hoje
  }
  
  // Verificar se é o dia atual
  const isHoje = (dia: number) => {
    const hoje = new Date()
    return (
      dia === hoje.getDate() && 
      mesAtual === hoje.getMonth() && 
      anoAtual === hoje.getFullYear()
    )
  }
  
  // Gerar opções para os dias do mês
  const diasDoMes = Array.from({ length: 31 }, (_, i) => i + 1)
  
  useEffect(() => {
    // Inicializar a categoriaId se estiver vazia e houver categorias disponíveis
    if (!novoPagamento.categoriaId && categorias.length > 0) {
      setNovoPagamento(prev => ({ ...prev, categoriaId: categorias[0].id }))
    }
  }, [categorias, novoPagamento.categoriaId])
  
  return (
    <div className="space-y-4">
      {/* Seletor de mês */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={retrocederMes}
          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">
          {nomesMeses[mesAtual]} {anoAtual}
        </h3>
        
        <button
          onClick={avancarMes}
          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="Próximo mês"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      
      {/* Lista de pagamentos do mês */}
      <div className="space-y-2">
        {pagamentosOrdenados.length > 0 ? (
          pagamentosOrdenados.map(pagamento => {
            const categoria = categorias.find(c => c.id === pagamento.categoriaId)
            const diaVencimento = parseInt(pagamento.dataVencimento)
            const dataPassada = isDataPassada(diaVencimento)
            const hoje = isHoje(diaVencimento)
            
            return (
              <div
                key={pagamento.id}
                className={`border rounded-lg overflow-hidden ${
                  pagamento.pago 
                    ? 'border-green-200 dark:border-green-800' 
                    : hoje 
                      ? 'border-yellow-200 dark:border-yellow-800' 
                      : dataPassada 
                        ? 'border-red-200 dark:border-red-800'
                        : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div 
                  className={`flex items-center justify-between p-3 ${
                    pagamento.pago 
                      ? 'bg-green-50 dark:bg-green-900/20' 
                      : hoje 
                        ? 'bg-yellow-50 dark:bg-yellow-900/20' 
                        : dataPassada 
                          ? 'bg-red-50 dark:bg-red-900/20'
                          : 'bg-gray-50 dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-700 rounded-full mr-3 font-medium">
                      {pagamento.dataVencimento}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {pagamento.descricao}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {categoria?.nome || 'Categoria não especificada'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="font-medium text-gray-900 dark:text-white mr-3">
                      {formatadorMoeda.format(pagamento.valor)}
                    </div>
                    
                    <button
                      onClick={() => marcarPagamentoComoPago(pagamento.id, !pagamento.pago)}
                      className={`p-1 rounded-full ${
                        pagamento.pago 
                          ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' 
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                      aria-label={pagamento.pago ? 'Marcar como não pago' : 'Marcar como pago'}
                    >
                      {pagamento.pago ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <X className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>Nenhum pagamento agendado para este mês</p>
          </div>
        )}
      </div>
      
      {/* Formulário para adicionar pagamento */}
      {mostrarFormulario ? (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mt-3">
          <div className="space-y-3">
            <div>
              <label htmlFor="pagamentoDescricao" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Descrição
              </label>
              <input
                id="pagamentoDescricao"
                type="text"
                value={novoPagamento.descricao}
                onChange={e => setNovoPagamento({ ...novoPagamento, descricao: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                placeholder="Ex: Aluguel"
              />
            </div>
            
            <div>
              <label htmlFor="pagamentoValor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Valor
              </label>
              <input
                id="pagamentoValor"
                type="number"
                value={novoPagamento.valor || ''}
                onChange={e => setNovoPagamento({ ...novoPagamento, valor: parseFloat(e.target.value) || 0 })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                placeholder="Valor"
                min="0.01"
                step="0.01"
              />
            </div>
            
            <div>
              <label htmlFor="pagamentoData" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Dia do Vencimento
              </label>
              <select
                id="pagamentoData"
                value={novoPagamento.dataVencimento}
                onChange={e => setNovoPagamento({ ...novoPagamento, dataVencimento: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              >
                {diasDoMes.map(dia => (
                  <option key={dia} value={dia}>
                    {dia}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="pagamentoCategoria" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Categoria
              </label>
              <select
                id="pagamentoCategoria"
                value={novoPagamento.categoriaId}
                onChange={e => setNovoPagamento({ ...novoPagamento, categoriaId: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              >
                {categorias.map(categoria => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex space-x-2 pt-2">
              <button
                onClick={handleAdicionarPagamento}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                aria-label="Adicionar pagamento"
              >
                Adicionar
              </button>
              <button
                onClick={() => setMostrarFormulario(false)}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                aria-label="Cancelar"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setMostrarFormulario(true)}
          className="w-full px-4 py-2 flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300"
          aria-label="Adicionar novo pagamento"
        >
          <Plus className="h-5 w-5 mr-1" />
          Novo Pagamento
        </button>
      )}
    </div>
  )
}
