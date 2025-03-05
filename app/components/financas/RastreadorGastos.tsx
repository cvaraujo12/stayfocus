'use client'

import { useEffect, useState } from 'react'
import { useFinancasStore } from '@/app/stores/financasStore'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Home, ShoppingCart, Utensils, Car, Heart, Music } from 'lucide-react'

// Mapeamento de nomes de ícones para componentes Lucide
const iconesMapeados: Record<string, React.ReactNode> = {
  'home': <Home className="h-5 w-5" />,
  'shopping-cart': <ShoppingCart className="h-5 w-5" />,
  'utensils': <Utensils className="h-5 w-5" />,
  'car': <Car className="h-5 w-5" />,
  'heart': <Heart className="h-5 w-5" />,
  'music': <Music className="h-5 w-5" />,
}

export function RastreadorGastos() {
  const { categorias, transacoes } = useFinancasStore()
  const [dadosGrafico, setDadosGrafico] = useState<Array<{ name: string; value: number; cor: string }>>([])
  const [totalGastos, setTotalGastos] = useState(0)
  
  // Calcular os dados do gráfico quando as transações ou categorias mudarem
  useEffect(() => {
    const despesas = transacoes.filter(t => t.tipo === 'despesa')
    const total = despesas.reduce((acc, t) => acc + t.valor, 0)
    setTotalGastos(total)
    
    // Agrupar transações por categoria e calcular o total por categoria
    const gastosPorCategoria: Record<string, number> = {}
    
    despesas.forEach(transacao => {
      if (!gastosPorCategoria[transacao.categoriaId]) {
        gastosPorCategoria[transacao.categoriaId] = 0
      }
      gastosPorCategoria[transacao.categoriaId] += transacao.valor
    })
    
    // Preparar os dados para o gráfico
    const dados = Object.entries(gastosPorCategoria).map(([categoriaId, valor]) => {
      const categoria = categorias.find(c => c.id === categoriaId)
      return {
        name: categoria ? categoria.nome : 'Outros',
        value: valor,
        cor: categoria ? categoria.cor : '#CCCCCC'
      }
    })
    
    setDadosGrafico(dados)
  }, [transacoes, categorias])
  
  // Formatador para valores monetários
  const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
  
  // Formatador para porcentagens
  const formatadorPorcentagem = new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
  
  // Custom tooltip para o gráfico
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentual = data.value / totalGastos
      
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow-md">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">{formatadorMoeda.format(data.value)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatadorPorcentagem.format(percentual)}
          </p>
        </div>
      )
    }
    
    return null
  }
  
  return (
    <div className="space-y-4">
      {/* Exibir o gráfico apenas se houver dados */}
      {dadosGrafico.length > 0 ? (
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dadosGrafico}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {dadosGrafico.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-40 text-gray-500 dark:text-gray-400">
          <p>Sem despesas registradas</p>
          <p className="text-sm">Adicione despesas para visualizar o gráfico</p>
        </div>
      )}
      
      {/* Lista de categorias com valores */}
      <div className="space-y-2 mt-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Total de Gastos: {formatadorMoeda.format(totalGastos)}
        </h3>
        
        {categorias.map(categoria => {
          const dadoCategoria = dadosGrafico.find(d => d.name === categoria.nome)
          const valorCategoria = dadoCategoria ? dadoCategoria.value : 0
          const percentual = totalGastos > 0 ? valorCategoria / totalGastos : 0
          
          return (
            <div 
              key={categoria.id}
              className="flex items-center justify-between p-2 rounded-lg"
              style={{ backgroundColor: `${categoria.cor}20` }}
            >
              <div className="flex items-center">
                <div className="p-1 rounded-full mr-2" style={{ backgroundColor: categoria.cor }}>
                  <span className="text-white">
                    {iconesMapeados[categoria.icone] || <ShoppingCart className="h-5 w-5" />}
                  </span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {categoria.nome}
                </span>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900 dark:text-white">
                  {formatadorMoeda.format(valorCategoria)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatadorPorcentagem.format(percentual)}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
