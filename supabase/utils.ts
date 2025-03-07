import { supabase } from './client';

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
 * Verifica se há conexão com o Supabase
 * @returns Objeto indicando sucesso ou falha
 */
export async function checkConnection(): Promise<{ online: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    return { online: !error, error: error?.message };
  } catch (err) {
    return { online: false, error: err instanceof Error ? err.message : 'Erro desconhecido' };
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