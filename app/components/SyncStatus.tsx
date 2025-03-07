import React from 'react';
import { useAppStore } from '../store';
import { CloudOff, CloudCog, CheckCircle, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const SyncStatus: React.FC = () => {
  const { connectionStatus, lastSyncedAt, checkConnection, pendingChanges } = useAppStore();
  
  const handleSync = async () => {
    await checkConnection();
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
  
  const hasPendingChanges = Object.keys(pendingChanges).length > 0;
  
  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className="flex items-center">
        {getStatusIcon()}
        <span className="ml-1">{getStatusText()}</span>
      </div>
      
      {lastSyncedAt && connectionStatus === 'online' && (
        <span className="text-gray-500">
          Última sincronização: {formatDistanceToNow(new Date(lastSyncedAt), { addSuffix: true, locale: ptBR })}
        </span>
      )}
      
      {hasPendingChanges && (
        <span className="text-yellow-500">
          ({Object.keys(pendingChanges).length} alterações pendentes)
        </span>
      )}
      
      <button
        onClick={handleSync}
        disabled={connectionStatus === 'checking'}
        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Sincronizar dados"
      >
        <RefreshCw className={`h-4 w-4 ${connectionStatus === 'checking' ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
};

export default SyncStatus; 