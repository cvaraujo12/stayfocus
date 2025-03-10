'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { usePrioridadesStore } from '@/app/stores/prioridadesStore'
import { sincronizarTudo } from '@/app/services/syncManager'
import { checkConnection, processSyncQueue } from '@/supabase/utils'
import { AlertCircle, ArrowDownUp, Check, Wifi, WifiOff, Database } from 'lucide-react'

export function SyncStatus() {
  const { user } = useAuth()
  const isSyncing = usePrioridadesStore(state => state.isSyncing)
  const lastSyncedAt = usePrioridadesStore(state => state.lastSyncedAt)
  const [connectionStatus, setConnectionStatus] = useState<{
    online: boolean
    error?: string
    pendingSync: boolean
  }>({ online: true, pendingSync: false })
  const [showSyncMessage, setShowSyncMessage] = useState(false)

  // Monitorar o status de conexão
  useEffect(() => {
    let mounted = true

    const checkConnectionStatus = async () => {
      try {
        const status = await checkConnection()
        if (mounted) {
          // Verifica se há operações pendentes no localStorage
          const queue = localStorage.getItem('offline_queue')
          const hasPendingOperations = queue ? JSON.parse(queue).length > 0 : false
          
          setConnectionStatus({
            ...status,
            pendingSync: hasPendingOperations
          })

          // Se voltou online e tem operações pendentes, tenta sincronizar
          if (status.online && hasPendingOperations && !isSyncing) {
            handleSync()
          }
        }
      } catch (error) {
        if (mounted) {
          setConnectionStatus({ 
            online: false, 
            error: 'Erro ao verificar conexão',
            pendingSync: false
          })
        }
      }
    }

    const handleOnlineStatus = () => {
      if (navigator.onLine) {
        checkConnectionStatus()
      } else {
        setConnectionStatus({ 
          online: false, 
          error: 'Sem conexão com a internet',
          pendingSync: false
        })
      }
    }

    // Verificar status inicial
    checkConnectionStatus()

    // Adicionar listeners para mudanças de status
    window.addEventListener('online', handleOnlineStatus)
    window.addEventListener('offline', handleOnlineStatus)

    // Verificar conexão periodicamente
    const interval = setInterval(checkConnectionStatus, 30000) // 30 segundos

    // Limpar listeners e intervalo ao desmontar
    return () => {
      mounted = false
      window.removeEventListener('online', handleOnlineStatus)
      window.removeEventListener('offline', handleOnlineStatus)
      clearInterval(interval)
    }
  }, [])

  // Exibir mensagem por alguns segundos após sincronização
  useEffect(() => {
    if (lastSyncedAt) {
      setShowSyncMessage(true)
      const timer = setTimeout(() => {
        setShowSyncMessage(false)
      }, 5000) // 5 segundos

      return () => clearTimeout(timer)
    }
  }, [lastSyncedAt])

  // Se não há usuário, não exibir o status
  if (!user) return null

  // Formatar a data da última sincronização
  const formatLastSynced = () => {
    if (!lastSyncedAt) return 'Nunca sincronizado'
    
    const date = new Date(lastSyncedAt)
    return `Sincronizado às ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  // Iniciar sincronização manual
  const handleSync = async () => {
    if (user && !isSyncing && connectionStatus.online) {
      // Verificar conexão antes de sincronizar
      const status = await checkConnection()
      if (status.online) {
        // Primeiro processa a fila offline
        const queueResult = await processSyncQueue()
        if (queueResult.success) {
          // Após processar a fila, sincroniza tudo
          await sincronizarTudo(user.id)
          setConnectionStatus(prev => ({ ...prev, pendingSync: false }))
        } else {
          setConnectionStatus(prev => ({
            ...prev,
            error: queueResult.error || 'Erro ao sincronizar dados offline'
          }))
        }
      } else {
        setConnectionStatus({ ...status, pendingSync: connectionStatus.pendingSync })
      }
    }
  }

  return (
    <div className="flex items-center gap-2 text-xs" role="status" aria-live="polite">
      {/* Ícone de status de conexão */}
      {connectionStatus.online ? (
        <Wifi 
          className="h-4 w-4 text-green-500" 
          aria-label="Online"
        />
      ) : (
        <WifiOff 
          className="h-4 w-4 text-amber-500" 
          aria-label="Offline"
        />
      )}
      
      {/* Status de sincronização */}
      {isSyncing ? (
        <span className="text-blue-500 flex items-center gap-1">
          <ArrowDownUp className="h-3 w-3 animate-pulse" />
          Sincronizando...
        </span>
      ) : showSyncMessage ? (
        <span className="text-green-500 flex items-center gap-1">
          <Check className="h-3 w-3" />
          {formatLastSynced()}
        </span>
      ) : connectionStatus.error ? (
        <span className="text-amber-500 flex items-center gap-1" title={connectionStatus.error}>
          <AlertCircle className="h-3 w-3" />
          {connectionStatus.error}
        </span>
      ) : connectionStatus.pendingSync ? (
        <span className="text-amber-500 flex items-center gap-1">
          <Database className="h-3 w-3" />
          Alterações pendentes
        </span>
      ) : (
        <button 
          onClick={handleSync}
          disabled={!connectionStatus.online || isSyncing}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center gap-1 disabled:opacity-50"
          aria-label={connectionStatus.online ? 'Sincronizar dados' : 'Offline'}
        >
          <ArrowDownUp className="h-3 w-3" />
          {connectionStatus.online ? 'Sincronizar' : 'Offline'}
        </button>
      )}
    </div>
  )
} 