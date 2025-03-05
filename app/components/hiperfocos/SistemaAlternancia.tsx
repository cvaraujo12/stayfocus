'use client'

import { useState, FormEvent } from 'react'
import { ArrowRightCircle, Clock, Plus, Check, AlertCircle, RefreshCcw } from 'lucide-react'
import { useHiperfocosStore, type SessaoAlternancia, type Hiperfoco } from '../../stores/hiperfocosStore'
import { format, parseISO, isAfter, addMinutes } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function SistemaAlternancia() {
  const { 
    hiperfocos, 
    sessoes, 
    adicionarSessao, 
    alternarHiperfoco, 
    concluirSessao, 
    removerSessao 
  } = useHiperfocosStore()
  
  const [novaAlternancia, setNovaAlternancia] = useState({
    titulo: '',
    hiperfocoId: '',
    tempoEstimado: ''
  })
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null)
  
  // Obter sessões ativas (não concluídas)
  const sessoesAtivas = sessoes.filter(sessao => !sessao.concluida)
  
  // Manipular o envio do formulário
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    
    if (!novaAlternancia.titulo || !novaAlternancia.hiperfocoId || !novaAlternancia.tempoEstimado) {
      setFeedbackMsg('Por favor, preencha todos os campos')
      return
    }
    
    const tempoEstimadoInt = parseInt(novaAlternancia.tempoEstimado)
    if (isNaN(tempoEstimadoInt) || tempoEstimadoInt <= 0) {
      setFeedbackMsg('Tempo estimado inválido')
      return
    }
    
    try {
      adicionarSessao(
        novaAlternancia.titulo,
        novaAlternancia.hiperfocoId,
        tempoEstimadoInt
      )
      
      // Limpar o formulário
      setNovaAlternancia({
        titulo: '',
        hiperfocoId: '',
        tempoEstimado: ''
      })
      
      setMostrarFormulario(false)
      setFeedbackMsg(null)
    } catch (error) {
      setFeedbackMsg('Erro ao criar a sessão')
    }
  }
  
  // Obter o nome de um hiperfoco pelo ID
  const getHiperfocoNome = (id: string | null): string => {
    if (!id) return 'Nenhum'
    
    const hiperfoco = hiperfocos.find(h => h.id === id)
    return hiperfoco ? hiperfoco.titulo : 'Desconhecido'
  }
  
  // Verificar se uma sessão está atrasada
  const isSessionOverdue = (sessao: SessaoAlternancia): boolean => {
    const inicioDate = parseISO(sessao.tempoInicio)
    const limiteDate = addMinutes(inicioDate, sessao.duracaoEstimada)
    return isAfter(new Date(), limiteDate)
  }
  
  // Alternar para um novo hiperfoco
  const handleAlternarHiperfoco = (sessaoId: string, hiperfocoId: string) => {
    alternarHiperfoco(sessaoId, hiperfocoId)
  }
  
  return (
    <div>
      <div className="flex items-center mb-4">
        <RefreshCcw className="h-6 w-6 text-hiperfocos-primary mr-2" aria-hidden="true" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Sistema de Alternância
        </h2>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Gerencie transições entre diferentes hiperfocos para reduzir o impacto das mudanças de contexto.
      </p>
      
      {/* Mostrar feedback se houver */}
      {feedbackMsg && (
        <div className="bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100 p-3 rounded-md mb-4">
          <AlertCircle className="h-5 w-5 inline mr-2" aria-hidden="true" />
          {feedbackMsg}
        </div>
      )}
      
      {/* Sessões ativas */}
      {sessoesAtivas.length > 0 ? (
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">
            Sessões de Alternância Ativas
          </h3>
          
          {sessoesAtivas.map((sessao) => {
            const isOverdue = isSessionOverdue(sessao)
            const hiperfocoAtual = hiperfocos.find(h => h.id === sessao.hiperfocoAtual)
            
            return (
              <div 
                key={sessao.id} 
                className={`bg-white dark:bg-gray-700 rounded-lg shadow-sm p-4 border-l-4 ${
                  isOverdue ? 'border-amber-500' : 'border-hiperfocos-primary'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white">
                      {sessao.titulo}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="h-4 w-4 inline mr-1" aria-hidden="true" />
                      Iniciado: {format(parseISO(sessao.tempoInicio), "dd 'de' MMMM', às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => concluirSessao(sessao.id)}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-md dark:text-green-400 dark:hover:bg-gray-600"
                      aria-label="Marcar como concluída"
                    >
                      <Check className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Hiperfoco atual */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">
                      Hiperfoco Atual
                    </span>
                    <div 
                      className="px-3 py-1.5 rounded-md text-sm font-medium"
                      style={{ 
                        backgroundColor: hiperfocoAtual ? `${hiperfocoAtual.cor}20` : 'transparent',
                        color: hiperfocoAtual ? hiperfocoAtual.cor : 'inherit' 
                      }}
                    >
                      {getHiperfocoNome(sessao.hiperfocoAtual)}
                    </div>
                  </div>
                  
                  {/* Alternância */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">
                      Alternar para
                    </span>
                    <select
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-hiperfocos-primary focus:border-hiperfocos-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                      value=""
                      onChange={(e) => handleAlternarHiperfoco(sessao.id, e.target.value)}
                      aria-label="Selecionar novo hiperfoco"
                    >
                      <option value="" disabled>Escolha um hiperfoco</option>
                      {hiperfocos
                        .filter(h => h.id !== sessao.hiperfocoAtual)
                        .map(hiperfoco => (
                          <option key={hiperfoco.id} value={hiperfoco.id}>
                            {hiperfoco.titulo}
                          </option>
                        ))
                      }
                    </select>
                  </div>
                </div>
                
                {/* Hiperfoco anterior (se houver) */}
                {sessao.hiperfocoAnterior && (
                  <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                    <ArrowRightCircle className="h-4 w-4 inline mr-1" aria-hidden="true" />
                    Alternou de: {getHiperfocoNome(sessao.hiperfocoAnterior)}
                  </div>
                )}
                
                {/* Mostrar alerta se estiver atrasado */}
                {isOverdue && (
                  <div className="mt-3 text-sm text-amber-500 dark:text-amber-400">
                    <AlertCircle className="h-4 w-4 inline mr-1" aria-hidden="true" />
                    Tempo estimado excedido! ({sessao.duracaoEstimada} minutos)
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 mb-6">
          <p>Nenhuma sessão de alternância ativa no momento.</p>
        </div>
      )}
      
      {/* Formulário para adicionar nova sessão */}
      {mostrarFormulario ? (
        <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            Nova Sessão de Alternância
          </h3>
          
          <div className="space-y-4">
            <div>
              <label 
                htmlFor="titulo" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Título da Sessão
              </label>
              <input
                type="text"
                id="titulo"
                value={novaAlternancia.titulo}
                onChange={(e) => setNovaAlternancia({ ...novaAlternancia, titulo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-hiperfocos-primary focus:border-hiperfocos-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Ex: Sessão de estudo"
              />
            </div>
            
            <div>
              <label 
                htmlFor="hiperfoco" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Hiperfoco Inicial
              </label>
              <select
                id="hiperfoco"
                value={novaAlternancia.hiperfocoId}
                onChange={(e) => setNovaAlternancia({ ...novaAlternancia, hiperfocoId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-hiperfocos-primary focus:border-hiperfocos-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Selecione um hiperfoco</option>
                {hiperfocos.map(hiperfoco => (
                  <option key={hiperfoco.id} value={hiperfoco.id}>
                    {hiperfoco.titulo}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label 
                htmlFor="tempoEstimado" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Tempo Estimado (minutos)
              </label>
              <input
                type="number"
                id="tempoEstimado"
                value={novaAlternancia.tempoEstimado}
                onChange={(e) => setNovaAlternancia({ ...novaAlternancia, tempoEstimado: e.target.value })}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-hiperfocos-primary focus:border-hiperfocos-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Ex: 30"
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setMostrarFormulario(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hiperfocos-primary dark:bg-gray-600 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-hiperfocos-primary hover:bg-hiperfocos-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hiperfocos-primary"
            >
              Iniciar Sessão
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setMostrarFormulario(true)}
          className="flex items-center px-4 py-2 mb-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-hiperfocos-primary hover:bg-hiperfocos-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hiperfocos-primary"
          disabled={hiperfocos.length === 0}
        >
          <Plus className="h-5 w-5 mr-2" aria-hidden="true" />
          Nova Sessão de Alternância
        </button>
      )}
      
      {hiperfocos.length === 0 && (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-600 rounded-md">
          <p>
            Para criar uma sessão de alternância, primeiro crie hiperfocos
            <br />na guia &quot;Conversor de Interesses&quot;.
          </p>
        </div>
      )}
    </div>
  )
}
