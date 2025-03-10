'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../providers/AuthProvider'
import { useAppStore } from '../store'
import { Wifi, WifiOff, Loader2, Check, X, Plus, Trash } from 'lucide-react'
import SyncDebugPanel from '../components/SyncDebugPanel'

export default function TesteSincronizacao() {
  const { session } = useAuth()
  const { 
    connectionStatus, 
    checkConnection, 
    tarefas = [], // Valor padrão caso seja undefined
    adicionarTarefa,
    removerTarefa,
    toggleTarefaConcluida
  } = useAppStore()
  
  const [novaTarefa, setNovaTarefa] = useState('')
  
  useEffect(() => {
    // Verificar status de conexão ao montar
    if (checkConnection) {
      checkConnection()
    }
  }, [checkConnection])
  
  const handleAddTarefa = (e: React.FormEvent) => {
    e.preventDefault()
    if (!novaTarefa.trim() || !adicionarTarefa) return
    
    adicionarTarefa({
      texto: novaTarefa,
      concluida: false,
      categoria: 'estudos',
      data: new Date().toISOString().split('T')[0]
    })
    
    setNovaTarefa('')
  }
  
  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Teste de Sincronização</h1>
      
      {!session ? (
        <div className="bg-amber-100 dark:bg-amber-900 p-4 rounded-lg mb-6">
          <p className="text-amber-800 dark:text-amber-200">
            Você precisa estar logado para testar a sincronização.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              {connectionStatus === 'online' ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : connectionStatus === 'offline' ? (
                <WifiOff className="h-5 w-5 text-amber-500" />
              ) : (
                <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
              )}
              <span>
                {connectionStatus === 'online' 
                  ? 'Online' 
                  : connectionStatus === 'offline' 
                  ? 'Offline' 
                  : connectionStatus === 'syncing'
                  ? 'Sincronizando...'
                  : 'Verificando...'}
              </span>
            </div>
          </div>
          
          {/* Painel de debug de sincronização */}
          <SyncDebugPanel />
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Demonstração de sincronização com tarefas */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Teste com Tarefas</h2>
              <form onSubmit={handleAddTarefa} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={novaTarefa}
                  onChange={(e) => setNovaTarefa(e.target.value)}
                  placeholder="Nova tarefa..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                />
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </button>
              </form>
              
              <div className="space-y-2 max-h-[400px] overflow-auto">
                {tarefas && tarefas.length > 0 ? (
                  tarefas
                    .filter(tarefa => !tarefa.deleted) // Não mostra tarefas logicamente excluídas
                    .sort((a, b) => {
                      // Ordena por data de atualização (mais recente primeiro)
                      if (!a.updated_at || !b.updated_at) return 0;
                      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
                    })
                    .map(tarefa => (
                      <div 
                        key={tarefa.id} 
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={tarefa.concluida}
                            onChange={() => {
                              if (toggleTarefaConcluida) {
                                toggleTarefaConcluida(tarefa.id)
                              }
                            }}
                            className="h-4 w-4 text-blue-500"
                          />
                          <span className={tarefa.concluida ? 'line-through text-gray-500' : ''}>
                            {tarefa.texto}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            v{tarefa.version || 1}
                          </span>
                          <button
                            onClick={() => {
                              if (removerTarefa) {
                                removerTarefa(tarefa.id)
                              }
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">Nenhuma tarefa adicionada</p>
                )}
              </div>
              
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <p>Adicione tarefas para testar a sincronização. Tente:</p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Adicionar tarefas quando online</li>
                  <li>Desconectar a internet (modo avião)</li>
                  <li>Adicionar mais tarefas (serão salvas localmente)</li>
                  <li>Reconectar à internet</li>
                  <li>Observar a sincronização automática</li>
                </ol>
              </div>
            </div>
            
            {/* Painel de instruções */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Sobre a Sincronização</h2>
              
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-medium mb-1">Recursos implementados:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Controle de versão de entidades</li>
                    <li>Sincronização diferencial (upsert)</li>
                    <li>Fila de sincronização com retentativas</li>
                    <li>Backoff exponencial para falhas</li>
                    <li>Exclusão lógica de registros</li>
                    <li>Detecção automática de conexão</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">Estratégia de sincronização:</h3>
                  <p>
                    Cada entidade inclui campos <code>updated_at</code> e <code>version</code> para 
                    rastreamento de alterações. Em vez de deletar registros fisicamente, uma flag <code>deleted</code> é usada para permitir a sincronização entre dispositivos.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">Resolução de conflitos:</h3>
                  <p>
                    Quando ocorrem conflitos, a versão com maior número ou data de atualização mais
                    recente prevalece. Isso garante uma sincronização consistente entre dispositivos.
                  </p>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                  <h3 className="font-medium mb-1 text-blue-700 dark:text-blue-300">Dica:</h3>
                  <p className="text-blue-600 dark:text-blue-400">
                    Você pode acompanhar o status da sincronização no painel acima. Operações pendentes
                    serão processadas quando houver conexão disponível.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">Informações do Usuário</h2>
            <p><strong>ID:</strong> {session.user.id}</p>
            <p><strong>Email:</strong> {session.user.email}</p>
          </div>
        </>
      )}
    </div>
  )
} 