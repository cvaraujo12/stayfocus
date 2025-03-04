'use client'

import { Droplet, PlusCircle, MinusCircle } from 'lucide-react'
import { useAlimentacaoStore } from '@/app/stores/alimentacaoStore'

export function LembreteHidratacao() {
  const { 
    coposBebidos, 
    metaDiaria, 
    ultimoRegistro, 
    adicionarCopo, 
    removerCopo, 
    ajustarMeta 
  } = useAlimentacaoStore()

  // Calcular a porcentagem de progresso
  const progresso = Math.min((coposBebidos / metaDiaria) * 100, 100)

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-4 md:mb-0">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            Acompanhamento de Hidratação
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Registre os copos de água que você bebe durante o dia
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => ajustarMeta(-1)}
            className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Diminuir meta diária"
            disabled={metaDiaria <= 1}
          >
            <MinusCircle className="h-6 w-6" />
          </button>
          
          <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Meta: {metaDiaria} copos
            </span>
          </div>
          
          <button
            onClick={() => ajustarMeta(1)}
            className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Aumentar meta diária"
            disabled={metaDiaria >= 15}
          >
            <PlusCircle className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
        <div
          className="bg-blue-500 h-full transition-all duration-500 ease-out"
          style={{ width: `${progresso}%` }}
          role="progressbar"
          aria-valuenow={coposBebidos}
          aria-valuemin={0}
          aria-valuemax={metaDiaria}
        ></div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {coposBebidos} de {metaDiaria} copos
          {ultimoRegistro && (
            <span className="ml-2">
              (Último: {ultimoRegistro})
            </span>
          )}
        </div>
        
        <div className="text-blue-600 dark:text-blue-400">
          {progresso.toFixed(0)}%
        </div>
      </div>

      {/* Visualização dos copos */}
      <div className="flex flex-wrap gap-2 my-4 justify-center">
        {Array.from({ length: metaDiaria }).map((_, index) => (
          <div
            key={index}
            className={`w-12 h-16 flex items-center justify-center rounded-b-lg border border-t-0 ${
              index < coposBebidos
                ? 'bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700'
                : 'bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-700'
            }`}
            aria-label={index < coposBebidos ? 'Copo bebido' : 'Copo não bebido'}
          >
            <Droplet
              className={`h-8 w-8 ${
                index < coposBebidos
                  ? 'text-blue-500 dark:text-blue-400'
                  : 'text-gray-400 dark:text-gray-600'
              }`}
            />
          </div>
        ))}
      </div>

      {/* Botões de ação */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={adicionarCopo}
          disabled={coposBebidos >= metaDiaria}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Registrar um copo de água"
        >
          Registrar Copo
        </button>
        
        <button
          onClick={removerCopo}
          disabled={coposBebidos <= 0}
          className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Remover um copo de água"
        >
          Remover Copo
        </button>
      </div>

      {/* Dicas */}
      <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-800 dark:text-blue-300">
        <h4 className="font-medium mb-1">Dicas de Hidratação:</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Mantenha uma garrafa de água sempre visível</li>
          <li>Beba um copo ao acordar e antes de cada refeição</li>
          <li>Configure lembretes no celular a cada 1-2 horas</li>
        </ul>
      </div>
    </div>
  )
}
