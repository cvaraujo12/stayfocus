'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { useAuth } from '../providers/AuthProvider';
import { 
  CloudOff, 
  CloudSun,
  CheckCircle, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp,
  AlertCircle,
  Info
} from 'lucide-react';

export function SyncDebugPanel() {
  const { session } = useAuth();
  const { 
    connectionStatus, 
    lastSyncedAt, 
    pendingChanges, 
    checkConnection,
    tarefas,
    blocosTempo,
    refeicoes,
    medicacoes,
    medicamentos,
    registrosHumor
  } = useAppStore();
  
  const [expanded, setExpanded] = useState(true);
  const [dataExpanded, setDataExpanded] = useState(false);
  
  // Calcula o total de entidades
  const totalEntities = [
    ...(tarefas || []),
    ...(blocosTempo || []),
    ...(refeicoes || []),
    ...(medicacoes || []),
    ...(medicamentos || []),
    ...(registrosHumor || [])
  ].length;
  
  // Calcula o número de entidades modificadas recentemente (últimas 24h)
  const getRecentlyModified = () => {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    return [
      ...(tarefas || []),
      ...(blocosTempo || []),
      ...(refeicoes || []),
      ...(medicacoes || []),
      ...(medicamentos || []),
      ...(registrosHumor || [])
    ].filter(entity => {
      if (!entity.updated_at) return false;
      return new Date(entity.updated_at) > oneDayAgo;
    }).length;
  };
  
  const recentlyModified = getRecentlyModified();
  
  // Calcula o número de entidades excluídas logicamente
  const getLogicallyDeleted = () => {
    return [
      ...(tarefas || []),
      ...(blocosTempo || []),
      ...(refeicoes || []),
      ...(medicacoes || []),
      ...(medicamentos || []),
      ...(registrosHumor || [])
    ].filter(entity => entity.deleted).length;
  };
  
  const logicallyDeleted = getLogicallyDeleted();
  
  // Exibe o número de operações pendentes
  const pendingOperations = pendingChanges && pendingChanges.count ? pendingChanges.count : 0;
  
  // Formata a data da última sincronização
  const formatLastSync = () => {
    if (!lastSyncedAt) return 'Nunca sincronizado';
    
    try {
      const date = new Date(lastSyncedAt);
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    } catch (e) {
      return 'Data inválida';
    }
  };
  
  const handleForceSync = async () => {
    if (checkConnection) {
      await checkConnection();
    }
  };
  
  // Não exibe o painel se não estiver autenticado
  if (!session) return null;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <div 
        className="flex items-center justify-between cursor-pointer" 
        onClick={() => setExpanded(!expanded)}
      >
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-500" />
          Estado de Sincronização
          {pendingOperations > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {pendingOperations}
            </span>
          )}
        </h2>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </div>
      
      {expanded && (
        <div className="mt-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">Status</p>
              <div className="flex items-center mt-1">
                {connectionStatus === 'online' ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : connectionStatus === 'offline' ? (
                  <CloudOff className="h-5 w-5 text-red-500 mr-2" />
                ) : connectionStatus === 'syncing' ? (
                  <CloudSun className="h-5 w-5 text-blue-500 animate-spin mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                )}
                <span className="font-medium">
                  {connectionStatus === 'online' ? 'Online' : 
                   connectionStatus === 'offline' ? 'Offline' : 
                   connectionStatus === 'syncing' ? 'Sincronizando' : 
                   'Verificando'}
                </span>
              </div>
            </div>
            
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">Última sincronização</p>
              <p className="font-medium mt-1">{formatLastSync()}</p>
            </div>
            
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">Operações pendentes</p>
              <p className={`font-medium mt-1 ${pendingOperations > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {pendingOperations > 0 ? `${pendingOperations} pendentes` : 'Nenhuma'}
              </p>
            </div>
            
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">Entidades</p>
              <p className="font-medium mt-1">
                {totalEntities} total / {recentlyModified} modificações recentes
              </p>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <button
              onClick={() => setDataExpanded(!dataExpanded)}
              className="text-sm text-blue-500 flex items-center"
            >
              {dataExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Ocultar detalhes
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Ver mais detalhes
                </>
              )}
            </button>
            
            <button
              onClick={handleForceSync}
              className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
              disabled={connectionStatus === 'syncing'}
            >
              <RefreshCw className="h-3 w-3" />
              Forçar sincronização
            </button>
          </div>
          
          {dataExpanded && (
            <div className="mt-4 space-y-3">
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <h3 className="font-medium mb-2">Dados por Tabela</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tarefas</span>
                    <span>{tarefas?.length || 0} itens</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Blocos de Tempo</span>
                    <span>{blocosTempo?.length || 0} itens</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Refeições</span>
                    <span>{refeicoes?.length || 0} itens</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Medicações</span>
                    <span>{medicacoes?.length || 0} itens</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Medicamentos</span>
                    <span>{medicamentos?.length || 0} itens</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Registros de Humor</span>
                    <span>{registrosHumor?.length || 0} itens</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium pt-2 border-t border-gray-200 dark:border-gray-600">
                    <span>Itens excluídos logicamente</span>
                    <span>{logicallyDeleted} itens</span>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <h3 className="font-medium mb-2">Informações adicionais</h3>
                <p className="text-sm">
                  Os itens excluídos são mantidos no banco de dados com a flag <code>deleted</code> ativada,
                  permitindo recuperação e sincronização consistente entre dispositivos.
                </p>
                <p className="text-sm mt-2">
                  A sincronização usa o campo <code>updated_at</code> e <code>version</code> para 
                  rastrear alterações e resolver conflitos quando necessário.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SyncDebugPanel; 