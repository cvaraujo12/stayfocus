'use client'

import { useState } from 'react'
import { useHiperfocosStore, type Hiperfoco, type Tarefa } from '../../stores/hiperfocosStore'
import { ChevronDown, ChevronRight, Plus, Edit, Trash2, Check } from 'lucide-react'

export function VisualizadorProjetos() {
  const { 
    hiperfocos, 
    adicionarSubTarefa, 
    toggleTarefaConcluida, 
    toggleSubTarefaConcluida, 
    atualizarTarefa,
    atualizarSubTarefa,
    removerTarefa,
    removerSubTarefa
  } = useHiperfocosStore()
  
  const [hiperfocoAtivo, setHiperfocoAtivo] = useState<string | null>(
    hiperfocos.length > 0 ? hiperfocos[0].id : null
  )
  
  const [expandidas, setExpandidas] = useState<Record<string, boolean>>({})
  const [novaTarefaTexto, setNovaTarefaTexto] = useState<Record<string, string>>({})
  const [editando, setEditando] = useState<Record<string, boolean>>({})
  const [textoEdicao, setTextoEdicao] = useState<Record<string, string>>({})
  
  // Alterna a expansão de uma tarefa
  const toggleExpand = (tarefaId: string) => {
    setExpandidas(prev => ({
      ...prev,
      [tarefaId]: !prev[tarefaId]
    }))
  }
  
  // Inicia a edição de uma tarefa
  const iniciarEdicao = (id: string, texto: string) => {
    setEditando(prev => ({ ...prev, [id]: true }))
    setTextoEdicao(prev => ({ ...prev, [id]: texto }))
  }
  
  // Salva a edição de uma tarefa
  const salvarEdicao = (hiperfocoId: string, tarefaId: string, tipo: 'tarefa' | 'subtarefa', tarefaPaiId?: string) => {
    if (!textoEdicao[tarefaId] || textoEdicao[tarefaId].trim() === '') return
    
    if (tipo === 'tarefa') {
      atualizarTarefa(hiperfocoId, tarefaId, textoEdicao[tarefaId])
    } else if (tipo === 'subtarefa' && tarefaPaiId) {
      atualizarSubTarefa(hiperfocoId, tarefaPaiId, tarefaId, textoEdicao[tarefaId])
    }
    
    setEditando(prev => ({ ...prev, [tarefaId]: false }))
  }
  
  // Adiciona uma nova subtarefa
  const handleAddSubtarefa = (hiperfocoId: string, tarefaId: string) => {
    const texto = novaTarefaTexto[tarefaId]
    if (!texto || texto.trim() === '') return
    
    adicionarSubTarefa(hiperfocoId, tarefaId, texto)
    
    // Limpar o input e expandir a tarefa pai
    setNovaTarefaTexto(prev => ({ ...prev, [tarefaId]: '' }))
    setExpandidas(prev => ({ ...prev, [tarefaId]: true }))
  }
  
  // Renderiza uma tarefa com suas subtarefas
  const renderizarTarefa = (hiperfoco: Hiperfoco, tarefa: Tarefa) => {
    const isExpanded = expandidas[tarefa.id] || false
    const temSubtarefas = hiperfoco.subTarefas[tarefa.id]?.length > 0
    const isEditing = editando[tarefa.id] || false
    
    return (
      <div 
        key={tarefa.id}
        className="border-l-2 pl-3 my-2"
        style={{ borderColor: hiperfoco.cor }}
      >
        <div className="flex items-center">
          {/* Expandir/Colapsar */}
          <button
            onClick={() => toggleExpand(tarefa.id)}
            className={`p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white ${!temSubtarefas && 'invisible'}`}
            aria-label={isExpanded ? 'Colapsar' : 'Expandir'}
          >
            {isExpanded ? 
              <ChevronDown className="h-4 w-4" aria-hidden="true" /> : 
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            }
          </button>
          
          {/* Checkbox */}
          <button
            onClick={() => toggleTarefaConcluida(hiperfoco.id, tarefa.id)}
            className={`p-1 rounded-md mr-2 ${
              tarefa.concluida 
                ? 'bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-200' 
                : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-400'
            }`}
            aria-label={tarefa.concluida ? 'Marcar como não concluída' : 'Marcar como concluída'}
            aria-pressed={tarefa.concluida}
          >
            <Check className="h-4 w-4" aria-hidden="true" />
          </button>
          
          {/* Conteúdo da tarefa */}
          {isEditing ? (
            <input
              type="text"
              value={textoEdicao[tarefa.id] || ''}
              onChange={(e) => setTextoEdicao({ ...textoEdicao, [tarefa.id]: e.target.value })}
              onBlur={() => salvarEdicao(hiperfoco.id, tarefa.id, 'tarefa')}
              onKeyDown={(e) => e.key === 'Enter' && salvarEdicao(hiperfoco.id, tarefa.id, 'tarefa')}
              className="flex-1 px-2 py-1 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              autoFocus
            />
          ) : (
            <span className={`flex-1 text-sm ${tarefa.concluida ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}>
              {tarefa.texto}
            </span>
          )}
          
          {/* Ações */}
          <div className="flex space-x-1 ml-2">
            <button
              onClick={() => iniciarEdicao(tarefa.id, tarefa.texto)}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
              aria-label="Editar tarefa"
            >
              <Edit className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              onClick={() => removerTarefa(hiperfoco.id, tarefa.id)}
              className="p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
              aria-label="Remover tarefa"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
        
        {/* Sub-tarefas */}
        {isExpanded && (
          <div className="ml-6 mt-2">
            {/* Lista de subtarefas */}
            {(hiperfoco.subTarefas[tarefa.id] || []).map((subTarefa) => {
              const isSubEditing = editando[subTarefa.id] || false
              
              return (
                <div key={subTarefa.id} className="flex items-center mb-2">
                  <button
                    onClick={() => toggleSubTarefaConcluida(hiperfoco.id, tarefa.id, subTarefa.id)}
                    className={`p-1 rounded-md mr-2 ${
                      subTarefa.concluida 
                        ? 'bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-200' 
                        : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                    aria-label={subTarefa.concluida ? 'Marcar como não concluída' : 'Marcar como concluída'}
                    aria-pressed={subTarefa.concluida}
                  >
                    <Check className="h-3 w-3" aria-hidden="true" />
                  </button>
                  
                  {isSubEditing ? (
                    <input
                      type="text"
                      value={textoEdicao[subTarefa.id] || ''}
                      onChange={(e) => setTextoEdicao({ ...textoEdicao, [subTarefa.id]: e.target.value })}
                      onBlur={() => salvarEdicao(hiperfoco.id, subTarefa.id, 'subtarefa', tarefa.id)}
                      onKeyDown={(e) => e.key === 'Enter' && salvarEdicao(hiperfoco.id, subTarefa.id, 'subtarefa', tarefa.id)}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      autoFocus
                    />
                  ) : (
                    <span className={`flex-1 text-xs ${subTarefa.concluida ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-600 dark:text-gray-300'}`}>
                      {subTarefa.texto}
                    </span>
                  )}
                  
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={() => iniciarEdicao(subTarefa.id, subTarefa.texto)}
                      className="p-0.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                      aria-label="Editar subtarefa"
                    >
                      <Edit className="h-3 w-3" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => removerSubTarefa(hiperfoco.id, tarefa.id, subTarefa.id)}
                      className="p-0.5 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                      aria-label="Remover subtarefa"
                    >
                      <Trash2 className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )
            })}
            
            {/* Campo para adicionar nova subtarefa */}
            <div className="flex items-center mt-2">
              <input
                type="text"
                value={novaTarefaTexto[tarefa.id] || ''}
                onChange={(e) => setNovaTarefaTexto({ ...novaTarefaTexto, [tarefa.id]: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSubtarefa(hiperfoco.id, tarefa.id)}
                placeholder="Nova sub-tarefa..."
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-l-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                aria-label="Nova sub-tarefa"
              />
              <button
                onClick={() => handleAddSubtarefa(hiperfoco.id, tarefa.id)}
                className="px-2 py-1 bg-hiperfocos-primary text-white rounded-r-md hover:bg-hiperfocos-secondary"
                aria-label="Adicionar sub-tarefa"
              >
                <Plus className="h-3 w-3" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }
  
  // Obter o hiperfoco ativo
  const hiperfocoSelecionado = hiperfocos.find(h => h.id === hiperfocoAtivo) || null
  
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Visualização em Árvore de Projetos
      </h2>
      
      {hiperfocos.length > 0 ? (
        <div>
          {/* Seletor de hiperfoco */}
          <div className="mb-6">
            <label htmlFor="hiperfoco-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Selecione um Hiperfoco
            </label>
            <select
              id="hiperfoco-select"
              value={hiperfocoAtivo || ''}
              onChange={(e) => setHiperfocoAtivo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-hiperfocos-primary focus:border-hiperfocos-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {hiperfocos.map((hiperfoco) => (
                <option key={hiperfoco.id} value={hiperfoco.id}>
                  {hiperfoco.titulo}
                </option>
              ))}
            </select>
          </div>
          
          {hiperfocoSelecionado && (
            <div>
              {/* Cabeçalho do hiperfoco */}
              <div 
                className="mb-4 p-3 rounded-md"
                style={{ backgroundColor: `${hiperfocoSelecionado.cor}20` }}
              >
                <h3 
                  className="text-lg font-medium mb-1"
                  style={{ color: hiperfocoSelecionado.cor }}
                >
                  {hiperfocoSelecionado.titulo}
                </h3>
                {hiperfocoSelecionado.descricao && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {hiperfocoSelecionado.descricao}
                  </p>
                )}
                
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {hiperfocoSelecionado.tarefas.filter(t => t.concluida).length} de {hiperfocoSelecionado.tarefas.length} tarefas concluídas
                </div>
              </div>
              
              {/* Árvore de tarefas */}
              <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm p-4">
                {hiperfocoSelecionado.tarefas.length > 0 ? (
                  <div>
                    {hiperfocoSelecionado.tarefas.map((tarefa) => renderizarTarefa(hiperfocoSelecionado, tarefa))}
                  </div>
                ) : (
                  <p className="text-center py-4 text-gray-500 dark:text-gray-400">
                    Este hiperfoco não possui tarefas.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-600 rounded-md">
          <p>
            Nenhum hiperfoco encontrado. Crie seu primeiro hiperfoco na guia &quot;Conversor de Interesses&quot;.
          </p>
        </div>
      )}
    </div>
  )
}
