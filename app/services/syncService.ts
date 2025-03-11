import { supabase } from '@/supabase/client';
import { insertData, updateData, deleteData } from '@/supabase/utils';

// Tipo para operações enfileiradas
type QueuedOperation = {
  id: string;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  payload?: any;
  timestamp: number;
};

// Tipo para resultado da reconciliação
interface ReconciliationResult {
  inserts: number;
  updates: number;
  deletes: number;
  conflicts: number;
  conflictsResolved: number;
  errors: any[];
}

// Tipo para configuração da estratégia de resolução de conflitos
type ConflictResolutionStrategy = 'local' | 'remote' | 'merge' | 'timestamp';

/**
 * Verifica diferenças entre dados locais e remotos para sincronização
 * 
 * @param localData Array de dados locais
 * @param remoteData Array de dados remotos
 * @param options Opções para reconciliação
 * @returns Objetos classificados para operações
 */
export function diffData<T extends { id: string, updated_at?: string }>(
  localData: T[],
  remoteData: T[],
  options: {
    uniqueKey?: keyof T;
    conflictStrategy?: ConflictResolutionStrategy;
  } = {}
) {
  const { 
    uniqueKey = 'id' as keyof T, 
    conflictStrategy = 'timestamp' 
  } = options;
  
  // Mapear por ID para facilitar a comparação
  const localMap = new Map(localData.map(item => [item[uniqueKey], item]));
  const remoteMap = new Map(remoteData.map(item => [item[uniqueKey], item]));
  
  // Objetos para operações
  const toInsert: T[] = [];
  const toUpdate: T[] = [];
  const toDelete: string[] = [];
  const conflicts: Array<{ local: T, remote: T }> = [];
  
  // Verificar itens locais
  for (const [key, localItem] of localMap.entries()) {
    const remoteItem = remoteMap.get(key);
    
    // Item não existe remotamente -> inserir
    if (!remoteItem) {
      toInsert.push(localItem);
      continue;
    }
    
    // Verificar se há diferenças
    if (JSON.stringify(localItem) !== JSON.stringify(remoteItem)) {
      // Estratégia baseada em timestamp
      if (conflictStrategy === 'timestamp' && localItem.updated_at && remoteItem.updated_at) {
        const localDate = new Date(localItem.updated_at);
        const remoteDate = new Date(remoteItem.updated_at);
        
        if (localDate > remoteDate) {
          toUpdate.push(localItem);
        } else if (localDate < remoteDate) {
          // Remoto é mais recente, não fazemos nada
        } else {
          // Mesma data, tratar como conflito
          conflicts.push({ local: localItem, remote: remoteItem });
        }
      } 
      // Estratégia local vence
      else if (conflictStrategy === 'local') {
        toUpdate.push(localItem);
      } 
      // Estratégia remota vence
      else if (conflictStrategy === 'remote') {
        // Não fazemos nada, manter o remoto
      } 
      // Estratégia de mesclagem
      else if (conflictStrategy === 'merge') {
        conflicts.push({ local: localItem, remote: remoteItem });
      }
    }
  }
  
  // Verificar itens remotos que não existem localmente
  for (const [key, remoteItem] of remoteMap.entries()) {
    if (!localMap.has(key)) {
      // Verificar se devemos excluir (apenas se sync bilateral)
      // Para sync unidirecional, comentar esta linha
      // toDelete.push(remoteItem.id as string);
    }
  }
  
  return {
    toInsert,
    toUpdate,
    toDelete,
    conflicts
  };
}

/**
 * Resolve conflitos entre dados locais e remotos
 * 
 * @param conflicts Array de conflitos
 * @param strategy Estratégia de resolução
 * @returns Array de objetos resolvidos
 */
export function resolveConflicts<T extends { id: string }>(
  conflicts: Array<{ local: T, remote: T }>,
  strategy: ConflictResolutionStrategy = 'merge'
): T[] {
  return conflicts.map(({ local, remote }) => {
    if (strategy === 'local') {
      return local;
    } else if (strategy === 'remote') {
      return remote;
    } else if (strategy === 'merge') {
      // Mesclagem simples: manter campos não nulos de ambos
      return {
        ...remote,
        ...Object.fromEntries(
          Object.entries(local).filter(([_, value]) => value !== null && value !== undefined)
        )
      } as T;
    } else { // timestamp
      const localDate = new Date(local.updated_at || 0);
      const remoteDate = new Date(remote.updated_at || 0);
      return localDate > remoteDate ? local : remote;
    }
  });
}

/**
 * Processa a fila de operações offline
 * 
 * @param queueKey Chave para acessar a fila no localStorage
 * @returns Resultado do processamento da fila
 */
export async function processOfflineQueue(
  queueKey: string = 'offline_queue'
): Promise<ReconciliationResult> {
  const result: ReconciliationResult = {
    inserts: 0,
    updates: 0,
    deletes: 0,
    conflicts: 0,
    conflictsResolved: 0,
    errors: []
  };
  
  try {
    // Verificar se está no cliente
    if (typeof window === 'undefined') {
      return result;
    }
    
    // Obter fila do localStorage
    const queueJson = localStorage.getItem(queueKey);
    if (!queueJson) {
      return result;
    }
    
    const queue: QueuedOperation[] = JSON.parse(queueJson);
    if (!queue.length) {
      return result;
    }
    
    console.log(`Processando fila offline com ${queue.length} operações`);
    
    // Agrupar operações por tabela
    const operationsByTable: Record<string, QueuedOperation[]> = {};
    queue.forEach(op => {
      if (!operationsByTable[op.table]) {
        operationsByTable[op.table] = [];
      }
      operationsByTable[op.table].push(op);
    });
    
    // Processar cada tabela
    for (const [table, operations] of Object.entries(operationsByTable)) {
      // Ordenar por timestamp
      operations.sort((a, b) => a.timestamp - b.timestamp);
      
      // Processar operações
      for (const operation of operations) {
        try {
          if (operation.operation === 'insert') {
            await insertData(table, operation.payload);
            result.inserts++;
          } else if (operation.operation === 'update') {
            await updateData(table, operation.payload.id, operation.payload);
            result.updates++;
          } else if (operation.operation === 'delete') {
            await deleteData(table, operation.payload.id);
            result.deletes++;
          }
        } catch (error) {
          console.error(`Erro ao processar operação ${operation.operation} na tabela ${table}:`, error);
          result.errors.push({
            operation,
            error
          });
        }
      }
    }
    
    // Limpar fila processada
    localStorage.setItem(queueKey, JSON.stringify([]));
    
    console.log('Processamento da fila offline concluído:', result);
    
  } catch (error) {
    console.error('Erro ao processar fila offline:', error);
    result.errors.push(error);
  }
  
  return result;
}

/**
 * Reconcilia dados entre versão local e remota
 * 
 * @param table Nome da tabela
 * @param localData Dados locais
 * @param options Opções de reconciliação
 * @returns Resultado da reconciliação
 */
export async function reconcileData<T extends { id: string, updated_at?: string }>(
  table: string,
  localData: T[],
  options: {
    conflictStrategy?: ConflictResolutionStrategy;
    filter?: Record<string, any>;
  } = {}
): Promise<ReconciliationResult> {
  const result: ReconciliationResult = {
    inserts: 0,
    updates: 0,
    deletes: 0,
    conflicts: 0,
    conflictsResolved: 0,
    errors: []
  };
  
  try {
    console.log(`Iniciando reconciliação de dados para tabela ${table}`);
    
    // Obter dados remotos
    let query = supabase.from(table).select('*');
    
    // Aplicar filtros se fornecidos
    if (options.filter) {
      Object.entries(options.filter).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    
    const { data: remoteData, error } = await query;
    
    if (error) {
      console.error(`Erro ao buscar dados remotos da tabela ${table}:`, error);
      result.errors.push(error);
      return result;
    }
    
    // Encontrar diferenças
    const { 
      toInsert, 
      toUpdate, 
      toDelete, 
      conflicts 
    } = diffData(localData, remoteData, {
      conflictStrategy: options.conflictStrategy
    });
    
    console.log(`Diferenças encontradas: ${toInsert.length} inserções, ${toUpdate.length} atualizações, ${toDelete.length} exclusões, ${conflicts.length} conflitos`);
    
    // Processar inserções
    for (const item of toInsert) {
      try {
        await insertData(table, item);
        result.inserts++;
      } catch (error) {
        console.error(`Erro ao inserir em ${table}:`, error);
        result.errors.push({ operation: 'insert', item, error });
      }
    }
    
    // Processar atualizações
    for (const item of toUpdate) {
      try {
        await updateData(table, item.id, item);
        result.updates++;
      } catch (error) {
        console.error(`Erro ao atualizar em ${table}:`, error);
        result.errors.push({ operation: 'update', item, error });
      }
    }
    
    // Processar exclusões
    for (const id of toDelete) {
      try {
        await deleteData(table, id);
        result.deletes++;
      } catch (error) {
        console.error(`Erro ao excluir de ${table}:`, error);
        result.errors.push({ operation: 'delete', id, error });
      }
    }
    
    // Processar conflitos
    result.conflicts = conflicts.length;
    if (conflicts.length > 0) {
      const resolvedItems = resolveConflicts(conflicts, options.conflictStrategy);
      
      for (const item of resolvedItems) {
        try {
          await updateData(table, item.id, item);
          result.conflictsResolved++;
        } catch (error) {
          console.error(`Erro ao resolver conflito em ${table}:`, error);
          result.errors.push({ operation: 'conflict', item, error });
        }
      }
    }
    
    console.log(`Reconciliação concluída para tabela ${table}:`, result);
    
  } catch (error) {
    console.error(`Erro durante reconciliação da tabela ${table}:`, error);
    result.errors.push(error);
  }
  
  return result;
}

export default {
  diffData,
  resolveConflicts,
  processOfflineQueue,
  reconcileData
}; 