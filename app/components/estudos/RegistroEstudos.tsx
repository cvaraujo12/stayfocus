'use client'

import { useState } from 'react'
import { BookOpen, Plus, X, Edit, Trash, Check, Clock } from 'lucide-react'
import { useRegistroEstudosStore, SessaoEstudo } from '@/app/stores/registroEstudosStore'

export function RegistroEstudos() {
  const { sessoes, adicionarSessao, removerSessao, marcarConcluida, editarSessao } = useRegistroEstudosStore()
  
  const [novaSessao, setNovaSessao] = useState<Omit<SessaoEstudo, 'id' | 'concluida'>>({
    titulo: '',
    categoria: 'estudos',
    duracaoMinutos: 30,
    dataSessao: new Date().toISOString().split('T')[0],
    horaInicio: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    observacoes: ''
  })
  
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [mostrarForm, setMostrarForm] = useState(false)

  const handleAdicionarSessao = () => {
    if (!novaSessao.titulo) return

    adicionarSessao(novaSessao)
    
    setNovaSessao({
      titulo: '',
      categoria: 'estudos',
      duracaoMinutos: 30,
      dataSessao: new Date().toISOString().split('T')[0],
      horaInicio: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      observacoes: ''
    })
    
    setMostrarForm(false)
  }

  const iniciarEdicao = (sessao: SessaoEstudo) => {
    setEditandoId(sessao.id)
    setNovaSessao({
      titulo: sessao.titulo,
      categoria: sessao.categoria || 'estudos',
      duracaoMinutos: sessao.duracaoMinutos,
      dataSessao: sessao.dataSessao,
      horaInicio: sessao.horaInicio || '',
      observacoes: sessao.observacoes || ''
    })
    setMostrarForm(true)
  }

  const salvarEdicao = () => {
    if (!editandoId || !novaSessao.titulo) return

    editarSessao(editandoId, novaSessao)
    
    setNovaSessao({
      titulo: '',
      categoria: 'estudos',
      duracaoMinutos: 30,
      dataSessao: new Date().toISOString().split('T')[0],
      horaInicio: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      observacoes: ''
    })
    
    setEditandoId(null)
    setMostrarForm(false)
  }

  const cancelarForm = () => {
    setNovaSessao({
      titulo: '',
      categoria: 'estudos',
      duracaoMinutos: 30,
      dataSessao: new Date().toISOString().split('T')[0],
      horaInicio: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      observacoes: ''
    })
    setEditandoId(null)
    setMostrarForm(false)
  }

  // Calcular estatísticas
  const sessoesCompletas = sessoes.filter((s) => s.concluida).length
  const totalMinutos = sessoes.reduce((total, s) => total + (s.concluida ? s.duracaoMinutos : 0), 0)
  const totalHoras = Math.floor(totalMinutos / 60)
  const minutosRestantes = totalMinutos % 60

  return (
    <div className="space-y-4">
      {/* Estatísticas */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-4 bg-estudos-light dark:bg-gray-800 rounded-lg border border-estudos-secondary/20 dark:border-estudos-dark/30">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Sessões Completas
          </h4>
          <div className="flex items-center">
            <Check className="h-5 w-5 text-estudos-primary dark:text-estudos-secondary mr-2" />
            <span className="text-xl font-bold text-estudos-primary dark:text-estudos-secondary">
              {sessoesCompletas} / {sessoes.length}
            </span>
          </div>
        </div>
        
        <div className="p-4 bg-estudos-light dark:bg-gray-800 rounded-lg border border-estudos-secondary/20 dark:border-estudos-dark/30">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tempo Total
          </h4>
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-estudos-primary dark:text-estudos-secondary mr-2" />
            <span className="text-xl font-bold text-estudos-primary dark:text-estudos-secondary">
              {totalHoras}h {minutosRestantes}min
            </span>
          </div>
        </div>
      </div>

      {/* Lista de Sessões */}
      <div className="space-y-3">
        {sessoes.map((sessao) => (
          <div
            key={sessao.id}
            className={`p-3 bg-white dark:bg-gray-800 rounded-lg border ${
              sessao.concluida
                ? 'border-green-200 dark:border-green-900'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <button
                  onClick={() => marcarConcluida(sessao.id, !sessao.concluida)}
                  className={`mt-1 mr-3 flex-shrink-0 w-5 h-5 rounded-full border ${
                    sessao.concluida
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-400 dark:border-gray-500'
                  } flex items-center justify-center`}
                  aria-label={sessao.concluida ? 'Marcar como incompleto' : 'Marcar como completo'}
                >
                  {sessao.concluida && <Check className="h-3 w-3" />}
                </button>
                
                <div>
                  <h3
                    className={`font-medium ${
                      sessao.concluida
                        ? 'text-gray-500 dark:text-gray-400 line-through'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {sessao.titulo}
                  </h3>
                  
                  {sessao.observacoes && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {sessao.observacoes}
                    </p>
                  )}
                  
                  <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{sessao.duracaoMinutos} minutos</span>
                    <span className="mx-2">•</span>
                    <BookOpen className="h-3 w-3 mr-1" />
                    <span>{new Date(sessao.dataSessao).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-1">
                <button
                  onClick={() => iniciarEdicao(sessao)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  aria-label="Editar sessão"
                >
                  <Edit className="h-4 w-4" />
                </button>
                
                <button
                  onClick={() => removerSessao(sessao.id)}
                  className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  aria-label="Remover sessão"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Formulário */}
      {mostrarForm ? (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {editandoId ? 'Editar Sessão' : 'Nova Sessão de Estudo'}
            </h3>
            <button
              onClick={cancelarForm}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              aria-label="Fechar formulário"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Título
              </label>
              <input
                type="text"
                id="titulo"
                value={novaSessao.titulo}
                onChange={(e) => setNovaSessao({ ...novaSessao, titulo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="Ex: Matemática - Álgebra"
              />
            </div>
            
            <div>
              <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descrição (opcional)
              </label>
              <textarea
                id="observacoes"
                value={novaSessao.observacoes}
                onChange={(e) => setNovaSessao({ ...novaSessao, observacoes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="Detalhes sobre o que será estudado"
                rows={2}
              />
            </div>
            
            <div>
              <label htmlFor="duracaoMinutos" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Duração (minutos)
              </label>
              <input
                type="number"
                id="duracaoMinutos"
                min="5"
                max="240"
                value={novaSessao.duracaoMinutos}
                onChange={(e) => setNovaSessao({ ...novaSessao, duracaoMinutos: parseInt(e.target.value) || 30 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div className="flex justify-end pt-2">
              <button
                onClick={editandoId ? salvarEdicao : handleAdicionarSessao}
                disabled={!novaSessao.titulo}
                className="px-4 py-2 bg-estudos-primary text-white rounded-lg hover:bg-estudos-primary/90 focus:outline-none focus:ring-2 focus:ring-estudos-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editandoId ? 'Salvar Alterações' : 'Adicionar Sessão'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setMostrarForm(true)}
          className="w-full py-2 flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
          aria-label="Adicionar nova sessão de estudo"
        >
          <Plus className="h-5 w-5 mr-1" />
          <span>Adicionar Sessão de Estudo</span>
        </button>
      )}
    </div>
  )
}
