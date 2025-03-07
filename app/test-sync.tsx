'use client'

import React, { useState, useEffect } from 'react';
import { useAppStore } from './store';
import SyncStatus from './components/SyncStatus';

export default function TestSync() {
  const {
    tarefas,
    adicionarTarefa,
    removerTarefa,
    connectionStatus,
    checkConnection,
    lastSyncedAt,
    pendingChanges
  } = useAppStore();
  
  const [novaTarefa, setNovaTarefa] = useState('');
  
  // Adicionar uma nova tarefa
  const handleAddTarefa = () => {
    if (novaTarefa.trim()) {
      adicionarTarefa({
        texto: novaTarefa,
        concluida: false,
        categoria: 'inicio',
        data: new Date().toISOString().split('T')[0]
      });
      setNovaTarefa('');
    }
  };
  
  // Remover uma tarefa
  const handleRemoveTarefa = (id: string) => {
    removerTarefa(id);
  };
  
  // Forçar verificação de conexão
  const handleCheckConnection = async () => {
    await checkConnection();
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Teste de Sincronização</h1>
      
      <div className="mb-6">
        <SyncStatus />
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Status da Conexão</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Status:</strong> {connectionStatus}</p>
            <p><strong>Última sincronização:</strong> {lastSyncedAt ? new Date(lastSyncedAt).toLocaleString() : 'Nunca'}</p>
            <p><strong>Alterações pendentes:</strong> {Object.keys(pendingChanges).length}</p>
          </div>
          <div>
            <button
              onClick={handleCheckConnection}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Verificar Conexão
            </button>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Adicionar Tarefa</h2>
        <div className="flex">
          <input
            type="text"
            value={novaTarefa}
            onChange={(e) => setNovaTarefa(e.target.value)}
            placeholder="Digite uma nova tarefa"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddTarefa}
            className="px-4 py-2 bg-green-500 text-white rounded-r hover:bg-green-600 transition-colors"
          >
            Adicionar
          </button>
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-2">Tarefas ({tarefas.length})</h2>
        {tarefas.length === 0 ? (
          <p className="text-gray-500">Nenhuma tarefa adicionada.</p>
        ) : (
          <ul className="space-y-2">
            {tarefas.map((tarefa) => (
              <li
                key={tarefa.id}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded shadow"
              >
                <span>{tarefa.texto}</span>
                <button
                  onClick={() => handleRemoveTarefa(tarefa.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded">
        <h3 className="font-semibold mb-2">Instruções de Teste:</h3>
        <ol className="list-decimal list-inside space-y-2">
          <li>Adicione algumas tarefas quando estiver online para testar a sincronização com o Supabase.</li>
          <li>Desative sua conexão com a internet (modo avião ou desconecte o Wi-Fi).</li>
          <li>Adicione mais tarefas - elas devem ser salvas localmente e marcadas como pendentes.</li>
          <li>Reative sua conexão e clique em "Verificar Conexão" - as tarefas pendentes devem ser sincronizadas.</li>
          <li>Recarregue a página para verificar se todas as tarefas foram persistidas no Supabase.</li>
        </ol>
      </div>
    </div>
  );
} 