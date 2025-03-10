import { supabase } from './client';

type QueuedOperation = {
  id: string;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  payload?: any;
  timestamp: number;
};

const QUEUE_KEY = 'offline_queue';

function getOfflineQueue(): QueuedOperation[] {
  if (typeof window === 'undefined') return [];
  const queue = localStorage.getItem(QUEUE_KEY);
  return queue ? JSON.parse(queue) : [];
}

function saveOfflineQueue(queue: QueuedOperation[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

function addToOfflineQueue(operation: Omit<QueuedOperation, 'id' | 'timestamp'>): void {
  const queue = getOfflineQueue();
  queue.push({
    ...operation,
    id: crypto.randomUUID(),
    timestamp: Date.now()
  });
  saveOfflineQueue(queue);
}

export async function processSyncQueue(): Promise<{ success: boolean; error?: string }> {
  try {
    const queue = getOfflineQueue();
    if (queue.length === 0) return { success: true };

    for (const op of queue) {
      try {
        switch (op.operation) {
          case 'insert':
            await supabase.from(op.table).insert(op.payload);
            break;
          case 'update':
            await supabase.from(op.table).update(op.payload).eq('id', op.payload.id);
            break;
          case 'delete':
            await supabase.from(op.table).delete().eq('id', op.payload.id);
            break;
        }
      } catch (error) {
        console.error(`Erro ao processar operação ${op.operation}:`, error);
        // Continua processando outras operações mesmo se uma falhar
      }
    }

    // Limpa a fila após processamento
    saveOfflineQueue([]);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return { success: false, error: message };
  }
}

/**
 * Tipo para resposta padronizada das operações CRUD
 */
export type CrudResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
  message?: string;
};

/**
 * Busca todos os registros de uma tabela específica
 * @param table Nome da tabela no Supabase
 * @returns Resposta padronizada com os dados ou erro
 */
export async function fetchData<T = any>(table: string): Promise<CrudResponse<T[]>> {
  try {
    if (!table) {
      return {
        success: false,
        error: 'Nome da tabela não fornecido',
        status: 400,
        message: 'É necessário fornecer o nome da tabela'
      };
    }

    const { data, error } = await supabase.from(table).select('*');
    
    if (error) {
      console.error(`Erro ao buscar dados da tabela ${table}:`, error);
      return {
        success: false,
        error: error.message,
        status: error.code === '42P01' ? 404 : 500,
        message: error.code === '42P01' 
          ? `A tabela '${table}' não existe` 
          : `Erro ao buscar dados da tabela '${table}'`
      };
    }
    
    return {
      success: true,
      data: data as T[],
      message: `Dados da tabela '${table}' recuperados com sucesso`
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error(`Erro inesperado ao buscar dados da tabela ${table}:`, err);
    return {
      success: false,
      error: errorMessage,
      status: 500,
      message: `Erro inesperado ao buscar dados da tabela '${table}'`
    };
  }
}

/**
 * Insere um novo registro em uma tabela específica
 * @param table Nome da tabela no Supabase
 * @param payload Dados a serem inseridos
 * @returns Resposta padronizada com os dados inseridos ou erro
 */
export async function insertData<T = any>(table: string, payload: any): Promise<CrudResponse<T>> {
  try {
    if (!table) {
      return {
        success: false,
        error: 'Nome da tabela não fornecido',
        status: 400,
        message: 'É necessário fornecer o nome da tabela'
      };
    }

    if (!payload || Object.keys(payload).length === 0) {
      return {
        success: false,
        error: 'Dados não fornecidos',
        status: 400,
        message: 'É necessário fornecer os dados a serem inseridos'
      };
    }

    const { online } = await checkConnection();
    
    if (!online) {
      // Modo offline: salvar na fila para sincronização posterior
      addToOfflineQueue({
        table,
        operation: 'insert',
        payload
      });
      
      return {
        success: true,
        data: payload as T,
        message: `Dados salvos localmente e serão sincronizados quando houver conexão`
      };
    }

    const { data, error } = await supabase.from(table).insert([payload]).select();
    
    if (error) {
      console.error(`Erro ao inserir dados na tabela ${table}:`, error);
      return {
        success: false,
        error: error.message,
        status: error.code === '42P01' ? 404 : 500,
        message: error.code === '42P01' 
          ? `A tabela '${table}' não existe` 
          : `Erro ao inserir dados na tabela '${table}'`
      };
    }
    
    return {
      success: true,
      data: data?.[0] as T,
      message: `Dados inseridos com sucesso na tabela '${table}'`
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error(`Erro inesperado ao inserir dados na tabela ${table}:`, err);
    return {
      success: false,
      error: errorMessage,
      status: 500,
      message: `Erro inesperado ao inserir dados na tabela '${table}'`
    };
  }
}

/**
 * Atualiza um registro existente em uma tabela específica
 * @param table Nome da tabela no Supabase
 * @param id ID do registro a ser atualizado
 * @param payload Dados a serem atualizados
 * @returns Resposta padronizada com os dados atualizados ou erro
 */
export async function updateData<T = any>(table: string, id: string, payload: any): Promise<CrudResponse<T>> {
  try {
    if (!table) {
      return {
        success: false,
        error: 'Nome da tabela não fornecido',
        status: 400,
        message: 'É necessário fornecer o nome da tabela'
      };
    }

    if (!id) {
      return {
        success: false,
        error: 'ID não fornecido',
        status: 400,
        message: 'É necessário fornecer o ID do registro a ser atualizado'
      };
    }

    if (!payload || Object.keys(payload).length === 0) {
      return {
        success: false,
        error: 'Dados não fornecidos',
        status: 400,
        message: 'É necessário fornecer os dados a serem atualizados'
      };
    }

    const { online } = await checkConnection();
    
    if (!online) {
      // Modo offline: salvar na fila para sincronização posterior
      addToOfflineQueue({
        table,
        operation: 'update',
        payload: { ...payload, id }
      });
      
      return {
        success: true,
        data: { ...payload, id } as T,
        message: `Dados salvos localmente e serão sincronizados quando houver conexão`
      };
    }

    const { data, error } = await supabase.from(table).update(payload).eq('id', id).select();
    
    if (error) {
      console.error(`Erro ao atualizar dados na tabela ${table}:`, error);
      return {
        success: false,
        error: error.message,
        status: error.code === '42P01' ? 404 : 500,
        message: error.code === '42P01' 
          ? `A tabela '${table}' não existe` 
          : `Erro ao atualizar dados na tabela '${table}'`
      };
    }
    
    if (!data || data.length === 0) {
      return {
        success: false,
        error: 'Registro não encontrado',
        status: 404,
        message: `Registro com ID '${id}' não encontrado na tabela '${table}'`
      };
    }
    
    return {
      success: true,
      data: data[0] as T,
      message: `Dados atualizados com sucesso na tabela '${table}'`
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error(`Erro inesperado ao atualizar dados na tabela ${table}:`, err);
    return {
      success: false,
      error: errorMessage,
      status: 500,
      message: `Erro inesperado ao atualizar dados na tabela '${table}'`
    };
  }
}

/**
 * Remove um registro de uma tabela específica
 * @param table Nome da tabela no Supabase
 * @param id ID do registro a ser removido
 * @returns Resposta padronizada com os dados removidos ou erro
 */
export async function deleteData<T = any>(table: string, id: string): Promise<CrudResponse<T>> {
  try {
    const { online } = await checkConnection();
    
    if (!online) {
      // Modo offline: salvar na fila para sincronização posterior
      addToOfflineQueue({
        table,
        operation: 'delete',
        payload: { id }
      });
      
      return {
        success: true,
        message: `Operação de exclusão salva localmente e será sincronizada quando houver conexão`
      };
    }
    if (!table) {
      return {
        success: false,
        error: 'Nome da tabela não fornecido',
        status: 400,
        message: 'É necessário fornecer o nome da tabela'
      };
    }

    if (!id) {
      return {
        success: false,
        error: 'ID não fornecido',
        status: 400,
        message: 'É necessário fornecer o ID do registro a ser removido'
      };
    }

    const { data, error } = await supabase.from(table).delete().eq('id', id).select();
    
    if (error) {
      console.error(`Erro ao remover dados da tabela ${table}:`, error);
      return {
        success: false,
        error: error.message,
        status: error.code === '42P01' ? 404 : 500,
        message: error.code === '42P01' 
          ? `A tabela '${table}' não existe` 
          : `Erro ao remover dados da tabela '${table}'`
      };
    }
    
    if (!data || data.length === 0) {
      return {
        success: false,
        error: 'Registro não encontrado',
        status: 404,
        message: `Registro com ID '${id}' não encontrado na tabela '${table}'`
      };
    }
    
    return {
      success: true,
      data: data[0] as T,
      message: `Dados removidos com sucesso da tabela '${table}'`
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error(`Erro inesperado ao remover dados da tabela ${table}:`, err);
    return {
      success: false,
      error: errorMessage,
      status: 500,
      message: `Erro inesperado ao remover dados da tabela '${table}'`
    };
  }
}

/**
 * Verifica a conectividade com o Supabase e fornece feedback detalhado
 * @returns Objeto indicando status da conexão e possível erro
 */
export async function checkConnection(): Promise<{ online: boolean; error?: string }> {
  try {
    // Primeiro verificamos se o navegador tem conexão
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      if (!navigator.onLine) {
        return { 
          online: false, 
          error: 'Sem conexão com a internet. Por favor, verifique sua conexão e tente novamente.' 
        };
      }
    }

    // Fazemos uma requisição simples ao Supabase
    // para verificar se a conexão está funcionando
    const { data, error } = await supabase
      .rpc('ping')
      .select('*')
      .maybeSingle();
    
    // Se não houver erro, a conexão está funcionando
    if (!error) {
      return { online: true };
    }

    // Tratamos diferentes tipos de erro para feedback mais preciso
    switch (error.code) {
      case 'PGRST116':
      case '42P01':
        // Tabela não existe, mas conexão está ok
        return { online: true };
      case 'PGRST301':
      case '401':
        return { 
          online: true, 
          error: 'Problemas de autenticação. Por favor, faça login novamente.' 
        };
      case 'PGRST499':
        return {
          online: false,
          error: 'Tempo limite de conexão excedido. Tente novamente.'
        };
      default:
        return { 
          online: false, 
          error: `Erro de conexão com o Supabase: ${error.message}` 
        };
    }
  } catch (err) {
    console.error('Erro ao verificar conexão:', err);
    return { 
      online: false, 
      error: err instanceof Error 
        ? `Erro inesperado: ${err.message}` 
        : 'Erro desconhecido ao verificar conexão'
    };
  }
}

/**
 * Busca dados com filtros personalizados
 * @param table Nome da tabela no Supabase
 * @param column Coluna para filtrar
 * @param value Valor para filtrar
 * @returns Resposta padronizada com os dados filtrados ou erro
 */
export async function fetchFilteredData<T = any>(
  table: string, 
  column: string, 
  value: any
): Promise<CrudResponse<T[]>> {
  try {
    if (!table) {
      return {
        success: false,
        error: 'Nome da tabela não fornecido',
        status: 400,
        message: 'É necessário fornecer o nome da tabela'
      };
    }

    if (!column) {
      return {
        success: false,
        error: 'Coluna não fornecida',
        status: 400,
        message: 'É necessário fornecer a coluna para filtrar'
      };
    }

    const { data, error } = await supabase.from(table).select('*').eq(column, value);
    
    if (error) {
      console.error(`Erro ao buscar dados filtrados da tabela ${table}:`, error);
      return {
        success: false,
        error: error.message,
        status: error.code === '42P01' ? 404 : 500,
        message: error.code === '42P01' 
          ? `A tabela '${table}' não existe` 
          : `Erro ao buscar dados filtrados da tabela '${table}'`
      };
    }
    
    return {
      success: true,
      data: data as T[],
      message: `Dados filtrados da tabela '${table}' recuperados com sucesso`
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error(`Erro inesperado ao buscar dados filtrados da tabela ${table}:`, err);
    return {
      success: false,
      error: errorMessage,
      status: 500,
      message: `Erro inesperado ao buscar dados filtrados da tabela '${table}'`
    };
  }
}

export default {
  fetchData,
  insertData,
  updateData,
  deleteData,
  checkConnection,
  fetchFilteredData
}; 