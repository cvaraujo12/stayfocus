"use client";

import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { useAuth } from '../providers/AuthProvider';
import { CloudOff, CloudSun, CheckCircle, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function SyncStatus() {
  const { user } = useAuth();
  const { connectionStatus, lastSyncedAt, checkConnection, pendingChanges } = useStore(state => ({
    connectionStatus: state.connectionStatus,
    lastSyncedAt: state.lastSyncedAt,
    checkConnection: state.checkConnection,
    pendingChanges: state.pendingChanges
  }));
  const [expanded, setExpanded] = useState(false);
  
  useEffect(() => {
    if (!user || !checkConnection) return;

    // Verifica a conexão inicialmente
    checkConnection();

    // Verifica a cada 5 minutos
    const interval = setInterval(() => {
      if (checkConnection) checkConnection();
    }, 5 * 60 * 1000);

    // Adiciona listeners para eventos de conexão
    window.addEventListener('online', () => checkConnection && checkConnection());
    window.addEventListener('offline', () => checkConnection && checkConnection());

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', () => checkConnection && checkConnection());
      window.removeEventListener('offline', () => checkConnection && checkConnection());
    };
  }, [checkConnection, user]);
  
  const handleSync = async () => {
    if (checkConnection) {
      await checkConnection();
    }
  };
  
  const hasPendingChanges = pendingChanges && pendingChanges.count && pendingChanges.count > 0;
  
  // Formatar última sincronização
  const getLastSyncText = () => {
    if (!lastSyncedAt) return 'Nunca sincronizado';
    
    try {
      return `Última sincronização ${formatDistanceToNow(new Date(lastSyncedAt), { 
        locale: ptBR, 
        addSuffix: true 
      })}`;
    } catch (e) {
      return 'Última sincronização desconhecida';
    }
  };
  
  // Não mostra nada se não estiver autenticado
  if (!user) return null;
  
  return (
    <div 
      className={`fixed bottom-4 right-4 p-2 rounded-lg bg-white shadow-lg dark:bg-gray-800 transition-all duration-300 ${expanded ? 'w-64' : 'w-auto'}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-2">
        {connectionStatus === 'online' && !hasPendingChanges ? (
          <>
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400 animate-pulse" />
              <span className="text-sm">Sincronizado</span>
            </div>
            {expanded && (
              <div className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                {getLastSyncText()}
              </div>
            )}
          </>
        ) : connectionStatus === 'offline' ? (
          <>
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <div className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-400" />
              <span className="text-sm">Offline</span>
            </div>
            {expanded && hasPendingChanges && (
              <div className="ml-2 text-xs text-red-500 dark:text-red-400">
                {pendingChanges.count} mudanças pendentes
              </div>
            )}
          </>
        ) : connectionStatus === 'syncing' ? (
          <>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <CloudSun className="w-4 h-4 animate-spin" />
              <span className="text-sm">Sincronizando</span>
            </div>
            {expanded && hasPendingChanges && (
              <div className="ml-2 text-xs text-blue-500 dark:text-blue-400">
                {pendingChanges.count} mudanças pendentes
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
              <div className="w-2 h-2 rounded-full bg-yellow-600 dark:bg-yellow-400 animate-pulse" />
              <span className="text-sm">Verificando...</span>
            </div>
          </>
        )}
        
        {expanded && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleSync();
            }}
            className="ml-auto text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Forçar sincronização"
            title="Forçar sincronização"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {expanded && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          <p>Clique para {expanded ? 'recolher' : 'expandir'}</p>
          {hasPendingChanges && connectionStatus === 'offline' && (
            <p className="mt-1 text-red-500 dark:text-red-400">
              As mudanças serão sincronizadas automaticamente quando estiver online.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default SyncStatus; 