'use client'

import { useState } from 'react'
import { ConversorInteresses } from '../components/hiperfocos/ConversorInteresses'
import { SistemaAlternancia } from '../components/hiperfocos/SistemaAlternancia'
import { VisualizadorProjetos } from '../components/hiperfocos/VisualizadorProjetos'
import { TemporizadorFoco } from '../components/hiperfocos/TemporizadorFoco'
import { useHiperfocosStore } from '../stores/hiperfocosStore'

export default function HiperfocosPage() {
  // Separamos a interface em guias para melhor organização
  const [tabAtiva, setTabAtiva] = useState<'conversor' | 'alternancia' | 'visualizador' | 'temporizador'>('conversor')
  const { hiperfocos } = useHiperfocosStore()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center">
        <span role="img" aria-label="Foguete" className="mr-2">🚀</span>
        Hiperfocos
      </h1>
      
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Transforme seus interesses intensos em projetos estruturados e gerencie suas transições de foco.
      </p>
      
      {/* Tabs de navegação */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setTabAtiva('conversor')}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            tabAtiva === 'conversor'
              ? 'bg-hiperfocos-light text-hiperfocos-primary border-b-2 border-hiperfocos-primary'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          }`}
          aria-current={tabAtiva === 'conversor' ? 'page' : undefined}
        >
          Conversor de Interesses
        </button>
        
        <button
          onClick={() => setTabAtiva('alternancia')}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            tabAtiva === 'alternancia'
              ? 'bg-hiperfocos-light text-hiperfocos-primary border-b-2 border-hiperfocos-primary'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          }`}
          aria-current={tabAtiva === 'alternancia' ? 'page' : undefined}
        >
          Sistema de Alternância
        </button>
        
        <button
          onClick={() => setTabAtiva('visualizador')}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            tabAtiva === 'visualizador'
              ? 'bg-hiperfocos-light text-hiperfocos-primary border-b-2 border-hiperfocos-primary'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          }`}
          aria-current={tabAtiva === 'visualizador' ? 'page' : undefined}
        >
          Estrutura de Projetos
        </button>
        
        <button
          onClick={() => setTabAtiva('temporizador')}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            tabAtiva === 'temporizador'
              ? 'bg-hiperfocos-light text-hiperfocos-primary border-b-2 border-hiperfocos-primary'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          }`}
          aria-current={tabAtiva === 'temporizador' ? 'page' : undefined}
        >
          Temporizador
        </button>
      </div>
      
      {/* Conteúdo da tab ativa */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {tabAtiva === 'conversor' && <ConversorInteresses />}
        {tabAtiva === 'alternancia' && <SistemaAlternancia />}
        {tabAtiva === 'visualizador' && <VisualizadorProjetos />}
        {tabAtiva === 'temporizador' && <TemporizadorFoco />}
      </div>
      
      {/* Card de resumo - visível em todas as abas */}
      {hiperfocos.length > 0 && (
        <div className="mt-8 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h2 className="text-lg font-medium mb-2 text-gray-800 dark:text-white">Resumo dos Hiperfocos</h2>
          <div className="space-y-2">
            {hiperfocos.map((hiperfoco) => (
              <div 
                key={hiperfoco.id} 
                className="px-3 py-2 rounded-md flex justify-between"
                style={{ backgroundColor: `${hiperfoco.cor}20` }}
              >
                <span className="font-medium" style={{ color: hiperfoco.cor }}>
                  {hiperfoco.titulo}
                </span>
                <span className="text-gray-600 dark:text-gray-300">
                  {hiperfoco.tarefas.filter(t => t.concluida).length}/{hiperfoco.tarefas.length} tarefas
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
