import React, { useEffect } from 'react';
import { useAppStore } from '../store';
import { useAuth } from '../providers/AuthProvider';
import { CloudOff, CloudCog, CheckCircle, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function SyncStatus() {
  const { session } = useAuth();
  const { connectionStatus, lastSyncedAt, checkConnection, pendingChanges } = useAppStore();
  
  useEffect(() => {
    if (!session) return;

    // Verifica a conexão inicialmente
    checkConnection();

    // Verifica a cada 5 minutos
    const interval = setInterval(checkConnection, 5 * 60 * 1000);

    // Adiciona listeners para eventos de conexão
    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
    };
  }, [checkConnection, session]);
  
  const handleSync = async () => {
    if (checkConnection) {
      await checkConnection();
    }
  };
  
  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'online':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'offline':
        return <CloudOff className="h-5 w-5 text-red-500" />;
      case 'checking':
        return <CloudCog className="h-5 w-5 text-yellow-500 animate-spin" />;
      default:
        return null;
    }
  };
  
  const getStatusText = () => {
    switch (connectionStatus) {
      case 'online':
        return 'Conectado';
      case 'offline':
        return 'Offline';
      case 'checking':
        return 'Verificando...';
      default:
        return '';
    }
  };
  
  const hasPendingChanges = Object.keys(pendingChanges || {}).length > 0;
  
  // Não mostra nada se não estiver autenticado
  if (!session) return null;
  
  return (
    <div className="fixed bottom-4 right-4 p-2 rounded-full bg-white shadow-lg dark:bg-gray-800">
      {connectionStatus === 'online' ? (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400 animate-pulse" />
          <span className="text-sm">Sincronizado</span>
        </div>
      ) : connectionStatus === 'offline' ? (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <div className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-400" />
          <span className="text-sm">Offline</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
          <div className="w-2 h-2 rounded-full bg-yellow-600 dark:bg-yellow-400 animate-pulse" />
          <span className="text-sm">Sincronizando...</span>
        </div>
      )}
    </div>
  );
}

export default SyncStatus; 