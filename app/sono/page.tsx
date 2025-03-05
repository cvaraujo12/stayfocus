'use client'

import { useState } from 'react'
import { RegistroSono } from '../components/sono/RegistroSono'
import { VisualizadorSemanal } from '../components/sono/VisualizadorSemanal'
import { ConfiguracaoLembretes } from '../components/sono/ConfiguracaoLembretes'

export default function SonoPage() {
  const [abaSelecionada, setAbaSelecionada] = useState<'registro' | 'visualizador' | 'lembretes'>('registro')
  
  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center mb-8">
        <div className="text-sono-primary mr-3 font-mono">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M2 4v16"></path>
            <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
            <path d="M2 17h20"></path>
            <path d="M6 8v9"></path>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gestão do Sono</h1>
      </div>
      
      {/* Navegação entre abas */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
            abaSelecionada === 'registro'
              ? 'bg-sono-light text-sono-primary border-b-2 border-sono-primary'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setAbaSelecionada('registro')}
          aria-current={abaSelecionada === 'registro' ? 'page' : undefined}
        >
          Registrar Sono
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
            abaSelecionada === 'visualizador'
              ? 'bg-sono-light text-sono-primary border-b-2 border-sono-primary'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setAbaSelecionada('visualizador')}
          aria-current={abaSelecionada === 'visualizador' ? 'page' : undefined}
        >
          Visualizar Sono
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
            abaSelecionada === 'lembretes'
              ? 'bg-sono-light text-sono-primary border-b-2 border-sono-primary'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setAbaSelecionada('lembretes')}
          aria-current={abaSelecionada === 'lembretes' ? 'page' : undefined}
        >
          Lembretes
        </button>
      </div>
      
      {/* Conteúdo da aba selecionada */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        {abaSelecionada === 'registro' && <RegistroSono />}
        {abaSelecionada === 'visualizador' && <VisualizadorSemanal />}
        {abaSelecionada === 'lembretes' && <ConfiguracaoLembretes />}
      </div>
      
      {/* Informações adicionais */}
      <div className="bg-sono-light bg-opacity-50 dark:bg-gray-700 p-4 rounded-lg text-gray-700 dark:text-gray-300">
        <h3 className="text-lg font-medium mb-2 text-sono-primary">A importância do sono</h3>
        <p className="text-sm mb-2">
          O sono de qualidade é essencial para a saúde cerebral e física, especialmente para pessoas neurodivergentes.
          Regular seus ciclos de sono pode ajudar a reduzir a sobrecarga sensorial e melhorar o funcionamento cognitivo.
        </p>
        <ul className="text-sm list-disc pl-5 space-y-1">
          <li>Tente manter horários regulares para dormir e acordar</li>
          <li>Crie uma rotina relaxante antes de dormir</li>
          <li>Reduza a exposição à luz azul pelo menos 1 hora antes de dormir</li>
          <li>Evite cafeína e estimulantes no período da tarde</li>
        </ul>
      </div>
    </main>
  )
}
