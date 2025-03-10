'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, PlusCircle, Edit2, Calendar, ChevronLeft, ChevronRight, X, RefreshCw, Loader2, Cloud, CloudOff } from 'lucide-react'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'
import { Modal } from '@/app/components/ui/Modal'
import { Badge } from '@/app/components/ui/Badge'
import { usePrioridadesStore, Prioridade } from '@/app/stores/prioridadesStore'
import { useAuth } from '@/app/contexts/AuthContext'
import { checkConnection } from '@/supabase/utils'

export function ListaPrioridades() {
  const { 
    prioridades, 
    adicionarPrioridade, 
    editarPrioridade, 
    removerPrioridade, 
    toggleConcluida, 
    getHistoricoPorData,
    getDatasPrioridades,
    carregarPrioridades,
    sincronizar,
    isSyncing,
    lastSyncedAt
  } = usePrioridadesStore()
  
  const { user } = useAuth()
  
  const [novoTexto, setNovoTexto] = useState('')
  const [prioridadeEditando, setPrioridadeEditando] = useState<Prioridade | null>(null)
  const [textoEditando, setTextoEditando] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [dataAtual, setDataAtual] = useState(new Date().toISOString().split('T')[0])
  const [prioridadesExibidas, setPrioridadesExibidas] = useState<Prioridade[]>([])
  const [datasHistorico, setDatasHistorico] = useState<string[]>([])
  const [isOnline, setIsOnline] = useState(true)
  
  // Verificar status online/offline
  useEffect(() => {
    const verificarConexao = async () => {
      const { online } = await checkConnection()
      setIsOnline(online)
    }
    
    verificarConexao()
    
    // Verificar periodicamente a conexão e quando a visibilidade da página mudar
    const interval = setInterval(verificarConexao, 60000) // a cada minuto
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        verificarConexao()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])
  
  // Carregar prioridades do backend quando logado
  useEffect(() => {
    if (user?.id) {
      carregarPrioridades(user.id)
    }
  }, [user, carregarPrioridades])
  
  // Carregar prioridades do dia atual
  useEffect(() => {
    const prioridadesDoDia = getHistoricoPorData(dataAtual)
    setPrioridadesExibidas(prioridadesDoDia)
  }, [prioridades, dataAtual, getHistoricoPorData])

  // Carregar datas disponíveis no histórico
  useEffect(() => {
    const datas = getDatasPrioridades()
    setDatasHistorico(datas)
  }, [prioridades, getDatasPrioridades])

  // Verifica se estamos vendo o dia atual
  const isToday = () => {
    const hoje = new Date().toISOString().split('T')[0]
    return dataAtual === hoje
  }

  // Funções para navegação no histórico
  const irParaDataAnterior = () => {
    const indexAtual = datasHistorico.indexOf(dataAtual)
    if (indexAtual < datasHistorico.length - 1) {
      setDataAtual(datasHistorico[indexAtual + 1])
    }
  }

  const irParaDataProxima = () => {
    const indexAtual = datasHistorico.indexOf(dataAtual)
    if (indexAtual > 0) {
      setDataAtual(datasHistorico[indexAtual - 1])
    }
  }

  const voltarParaHoje = () => {
    setDataAtual(new Date().toISOString().split('T')[0])
  }

  // Função para adicionar nova prioridade
  const handleAdicionarPrioridade = () => {
    if (!novoTexto.trim() || prioridadesExibidas.length >= 3) return
    
    adicionarPrioridade({
      texto: novoTexto,
      concluida: false
    })
    
    setNovoTexto('')
  }

  // Função para iniciar edição
  const iniciarEdicao = (prioridade: Prioridade) => {
    setPrioridadeEditando(prioridade)
    setTextoEditando(prioridade.texto)
  }

  // Função para salvar edição
  const salvarEdicao = () => {
    if (prioridadeEditando && textoEditando.trim()) {
      editarPrioridade(prioridadeEditando.id, textoEditando)
      setPrioridadeEditando(null)
    }
  }

  // Função para cancelar edição
  const cancelarEdicao = () => {
    setPrioridadeEditando(null)
  }
  
  // Função para sincronizar manualmente
  const sincronizarManualmente = () => {
    if (user?.id) {
      sincronizar(user.id)
    }
  }

  // Formatar data para exibição (DD/MM/YYYY)
  const formatarData = (dataISO: string) => {
    const partes = dataISO.split('-')
    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }
  
  // Formatar horário da última sincronização
  const formatarUltimaSincronizacao = () => {
    if (!lastSyncedAt) return 'Nunca sincronizado'
    
    const data = new Date(lastSyncedAt)
    return `${data.toLocaleDateString()} às ${data.toLocaleTimeString()}`
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho com controles de histórico e status de conexão */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowHistory(!showHistory)}
            aria-label={showHistory ? "Esconder histórico" : "Mostrar histórico"}
          >
            <Calendar className="h-4 w-4 mr-1" />
            {showHistory ? 'Esconder Histórico' : 'Ver Histórico'}
          </Button>
          
          {/* Indicador de status online/offline */}
          <span 
            className={`inline-flex items-center text-xs ${isOnline ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}
            title={isOnline ? 'Conectado' : 'Desconectado'}
          >
            {isOnline ? <Cloud className="h-3 w-3 mr-1" /> : <CloudOff className="h-3 w-3 mr-1" />}
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Botão de sincronização manual */}
          {user && isOnline && (
            <Button
              variant="ghost"
              size="sm"
              onClick={sincronizarManualmente}
              disabled={isSyncing}
              aria-label="Sincronizar dados"
              title={`Última sincronização: ${formatarUltimaSincronizacao()}`}
              className="text-blue-600 dark:text-blue-400"
            >
              {isSyncing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          )}
          
          {isToday() ? (
            <Badge>Hoje</Badge>
          ) : (
            <Badge variant="secondary">{formatarData(dataAtual)}</Badge>
          )}
        </div>
      </div>

      {/* Controles de navegação no histórico */}
      {showHistory && (
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded-lg mb-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={irParaDataAnterior}
            disabled={datasHistorico.indexOf(dataAtual) >= datasHistorico.length - 1}
            aria-label="Data anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-sm font-medium">
            {formatarData(dataAtual)}
            {!isToday() && (
              <Button 
                variant="link" 
                size="sm" 
                className="ml-2 underline text-blue-600 dark:text-blue-400"
                onClick={voltarParaHoje}
              >
                Voltar para hoje
              </Button>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={irParaDataProxima}
            disabled={datasHistorico.indexOf(dataAtual) <= 0}
            aria-label="Próxima data"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Lista de prioridades */}
      <div className="space-y-2">
        {prioridadesExibidas.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            {isToday() ? (
              <p>Nenhuma prioridade definida para hoje.</p>
            ) : (
              <p>Nenhuma prioridade registrada para esta data.</p>
            )}
          </div>
        ) : (
          prioridadesExibidas.map((prioridade) => (
            <div
              key={prioridade.id}
              className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                prioridade.concluida
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : 'bg-white dark:bg-gray-800'
              }`}
            >
              {isToday() && (
                <button
                  onClick={() => toggleConcluida(prioridade.id)}
                  className="mr-3 text-green-600 dark:text-green-400 focus:outline-none"
                  aria-label={prioridade.concluida ? 'Marcar como não concluída' : 'Marcar como concluída'}
                >
                  {prioridade.concluida ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <Circle className="h-6 w-6" />
                  )}
                </button>
              )}
              
              <span
                className={`flex-1 ${
                  prioridade.concluida
                    ? 'text-gray-500 dark:text-gray-400 line-through'
                    : 'text-gray-900 dark:text-white'
                }`}
              >
                {prioridade.texto}
              </span>
              
              {isToday() && (
                <button
                  onClick={() => iniciarEdicao(prioridade)}
                  className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
                  aria-label="Editar prioridade"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Input para adicionar nova prioridade (apenas no dia atual) */}
      {isToday() && prioridadesExibidas.length < 3 && (
        <div className="flex items-center mt-4">
          <Input
            type="text"
            value={novoTexto}
            onChange={(e) => setNovoTexto(e.target.value)}
            placeholder="Nova prioridade..."
            className="flex-1"
            maxLength={50}
          />
          <Button
            onClick={handleAdicionarPrioridade}
            className="ml-2"
            aria-label="Adicionar prioridade"
          >
            <PlusCircle className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Mensagem quando atingir o limite de prioridades */}
      {isToday() && prioridadesExibidas.length >= 3 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
          Máximo de 3 prioridades para manter o foco.
        </p>
      )}

      {/* Modal de edição */}
      <Modal 
        isOpen={prioridadeEditando !== null} 
        onClose={cancelarEdicao}
        title="Editar Prioridade"
      >
        <div className="space-y-4">
          <Input
            type="text"
            value={textoEditando}
            onChange={(e) => setTextoEditando(e.target.value)}
            placeholder="Texto da prioridade..."
            maxLength={50}
          />
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={cancelarEdicao}>
              Cancelar
            </Button>
            <Button onClick={salvarEdicao}>
              Salvar
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Indicador de última sincronização */}
      {lastSyncedAt && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
          Sincronizado: {formatarUltimaSincronizacao()}
        </div>
      )}
    </div>
  )
}
