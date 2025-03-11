/**
 * Serviço centralizado para comunicação com o Supabase
 * Este serviço unifica todas as operações comuns com o Supabase
 */

import { supabase } from '@/supabase/client';
import { User, Session } from '@supabase/supabase-js';

/**
 * Interface para respostas padronizadas
 */
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
}

/**
 * Verifica o status da conexão com o Supabase
 */
export async function checkConnection(): Promise<ServiceResponse<boolean>> {
  try {
    const { error } = await supabase.from('users').select('id').limit(1);
    
    return {
      success: !error,
      data: !error,
      message: error ? `Erro na conexão: ${error.message}` : 'Conexão estabelecida com sucesso'
    };
  } catch (error) {
    console.error('Erro ao verificar conexão:', error);
    return {
      success: false,
      message: 'Falha ao verificar conexão com o Supabase',
      error
    };
  }
}

/**
 * Obtém o usuário atual da sessão
 */
export async function getCurrentUser(): Promise<ServiceResponse<User>> {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      return {
        success: false,
        message: error.message,
        error
      };
    }
    
    return {
      success: !!data.user,
      data: data.user,
      message: data.user ? 'Usuário obtido com sucesso' : 'Nenhum usuário autenticado'
    };
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    return {
      success: false,
      message: 'Falha ao obter usuário atual',
      error
    };
  }
}

/**
 * Obtém a sessão atual
 */
export async function getCurrentSession(): Promise<ServiceResponse<Session>> {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      return {
        success: false,
        message: error.message,
        error
      };
    }
    
    return {
      success: !!data.session,
      data: data.session,
      message: data.session ? 'Sessão obtida com sucesso' : 'Nenhuma sessão ativa'
    };
  } catch (error) {
    console.error('Erro ao obter sessão:', error);
    return {
      success: false,
      message: 'Falha ao obter sessão',
      error
    };
  }
}

/**
 * Insere um registro em uma tabela
 */
export async function insertRecord<T>(
  table: string, 
  data: Partial<T>, 
  options?: { 
    upsert?: boolean 
  }
): Promise<ServiceResponse<T>> {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data, { upsert: options?.upsert })
      .select('*')
      .single();
    
    if (error) {
      return {
        success: false,
        message: `Erro ao inserir em ${table}: ${error.message}`,
        error
      };
    }
    
    return {
      success: true,
      data: result as T,
      message: `Registro inserido com sucesso em ${table}`
    };
  } catch (error) {
    console.error(`Erro ao inserir em ${table}:`, error);
    return {
      success: false,
      message: `Falha ao inserir em ${table}`,
      error
    };
  }
}

/**
 * Atualiza um registro em uma tabela
 */
export async function updateRecord<T>(
  table: string, 
  id: string | number, 
  data: Partial<T>
): Promise<ServiceResponse<T>> {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) {
      return {
        success: false,
        message: `Erro ao atualizar em ${table}: ${error.message}`,
        error
      };
    }
    
    return {
      success: true,
      data: result as T,
      message: `Registro atualizado com sucesso em ${table}`
    };
  } catch (error) {
    console.error(`Erro ao atualizar em ${table}:`, error);
    return {
      success: false,
      message: `Falha ao atualizar em ${table}`,
      error
    };
  }
}

/**
 * Remove um registro de uma tabela
 */
export async function deleteRecord(
  table: string, 
  id: string | number
): Promise<ServiceResponse> {
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) {
      return {
        success: false,
        message: `Erro ao remover de ${table}: ${error.message}`,
        error
      };
    }
    
    return {
      success: true,
      message: `Registro removido com sucesso de ${table}`
    };
  } catch (error) {
    console.error(`Erro ao remover de ${table}:`, error);
    return {
      success: false,
      message: `Falha ao remover de ${table}`,
      error
    };
  }
}

/**
 * Busca registros em uma tabela
 */
export async function fetchRecords<T>(
  table: string, 
  options?: {
    column?: string;
    value?: any;
    limit?: number;
    orderBy?: string;
    ascending?: boolean;
  }
): Promise<ServiceResponse<T[]>> {
  try {
    let query = supabase.from(table).select('*');
    
    if (options?.column && options.value !== undefined) {
      query = query.eq(options.column, options.value);
    }
    
    if (options?.orderBy) {
      query = query.order(options.orderBy, { ascending: options?.ascending ?? false });
    }
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      return {
        success: false,
        message: `Erro ao buscar de ${table}: ${error.message}`,
        error
      };
    }
    
    return {
      success: true,
      data: data as T[],
      message: `Registros obtidos com sucesso de ${table}`
    };
  } catch (error) {
    console.error(`Erro ao buscar de ${table}:`, error);
    return {
      success: false,
      message: `Falha ao buscar de ${table}`,
      error
    };
  }
}

/**
 * Busca um registro específico
 */
export async function fetchRecordById<T>(
  table: string, 
  id: string | number
): Promise<ServiceResponse<T>> {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      return {
        success: false,
        message: `Erro ao buscar de ${table}: ${error.message}`,
        error
      };
    }
    
    return {
      success: true,
      data: data as T,
      message: `Registro obtido com sucesso de ${table}`
    };
  } catch (error) {
    console.error(`Erro ao buscar de ${table}:`, error);
    return {
      success: false,
      message: `Falha ao buscar de ${table}`,
      error
    };
  }
} 