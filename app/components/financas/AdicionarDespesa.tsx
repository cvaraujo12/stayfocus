'use client'

import { useState, useEffect } from 'react'
import { useFinancasStore } from '@/app/stores/financasStore'
import { Check, CreditCard, PlusCircle } from 'lucide-react'

export function AdicionarDespesa() {
  const { categorias, adicionarTransacao } = useFinancasStore()
  
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [mostrarFeedback, setMostrarFeedback] = useState(false)
  
  // Inicializar categoria se estiver vazia
  useEffect(() => {
    if (!categoriaId && categorias.length > 0) {
      setCategoriaId(categorias[0].id)
    }
  }, [categorias, categoriaId])
  
  const handleAdicionarDespesa = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!descricao || !valor || parseFloat(valor) <= 0 || !categoriaId) return
    
    const hoje = new Date().toISOString().split('T')[0]
    
    adicionarTransacao(
      hoje,
      parseFloat(valor),
      descricao,
      categoriaId,
      'despesa'
    )
    
    // Mostrar feedback visual
    setMostrarFeedback(true)
    
    // Limpar formulário
    setDescricao('')
    setValor('')
    
    // Esconder feedback após 1.5 segundos
    setTimeout(() => {
      setMostrarFeedback(false)
    }, 1500)
  }
  
  return (
    <div className="space-y-4">
      {mostrarFeedback ? (
        <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full text-green-600 dark:text-green-300 mb-4">
            <Check className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-medium text-green-600 dark:text-green-300">
            Despesa Registrada!
          </h3>
          <p className="text-sm text-green-500 dark:text-green-400 mt-1">
            Sua despesa foi adicionada com sucesso.
          </p>
        </div>
      ) : (
        <form onSubmit={handleAdicionarDespesa} className="space-y-4">
          <div>
            <label htmlFor="despesaDescricao" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Descrição
            </label>
            <input
              id="despesaDescricao"
              type="text"
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              placeholder="Ex: Mercado"
              required
            />
          </div>
          
          <div>
            <label htmlFor="despesaValor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Valor (R$)
            </label>
            <input
              id="despesaValor"
              type="number"
              value={valor}
              onChange={e => setValor(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              placeholder="0,00"
              min="0.01"
              step="0.01"
              required
            />
          </div>
          
          <div>
            <label htmlFor="despesaCategoria" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Categoria
            </label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {categorias.map(categoria => (
                <button
                  key={categoria.id}
                  type="button"
                  onClick={() => setCategoriaId(categoria.id)}
                  className={`h-14 p-2 rounded-md flex flex-col items-center justify-center text-xs ${
                    categoriaId === categoria.id
                      ? 'ring-2 ring-offset-2 ring-gray-500'
                      : 'border border-gray-200 dark:border-gray-700'
                  }`}
                  style={{ backgroundColor: `${categoria.cor}20` }}
                  aria-label={`Selecionar categoria ${categoria.nome}`}
                >
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center mb-1"
                    style={{ backgroundColor: categoria.cor }}
                  >
                    <span className="text-white text-xs">
                      {/* Usar a primeira letra como ícone simplificado */}
                      {categoria.nome.charAt(0)}
                    </span>
                  </div>
                  <span className="truncate w-full text-center text-gray-900 dark:text-white">
                    {categoria.nome}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full px-4 py-3 mt-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Adicionar Despesa
          </button>
        </form>
      )}
      
      {/* Dicas rápidas */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center mb-2">
          <CreditCard className="h-4 w-4 mr-1" /> 
          Dicas para registrar despesas
        </h3>
        <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1 ml-5 list-disc">
          <li>Registre despesas logo após realizá-las</li>
          <li>Use descrições curtas e específicas</li>
          <li>Categorize corretamente para melhor visualização</li>
        </ul>
      </div>
    </div>
  )
}
