import { supabase } from '@/supabase/client';
import { fetchData, insertData, updateData, deleteData, checkConnection } from '@/supabase/utils';
import { RegistroSono } from '@/app/stores/sonoStore';

// Nome da tabela no Supabase
const TABLE_NAME = 'sleep_records';

/**
 * Tipo para mapear um registro de sono no formato do Supabase
 */
export type RegistroSonoSupabase = {
  id: string;
  user_id: string;
  inicio: string; // Formato ISO
  fim?: string; // Formato ISO
  qualidade?: number; // Escala 1-5
  notas?: string;
  created_at?: string;
  updated_at?: string;
};

/**
 * Converte um RegistroSono do store para o formato do Supabase
 */
export function toRegistroSonoSupabase(registro: RegistroSono, userId: string): Omit<RegistroSonoSupabase, 'created_at' | 'updated_at'> {
  return {
    id: registro.id,
    user_id: userId,
    inicio: registro.inicio,
    fim: registro.fim,
    qualidade: registro.qualidade,
    notas: registro.notas,
  };
}

/**
 * Converte um RegistroSonoSupabase para o formato do store
 */
export function toRegistroSono(registroSupabase: RegistroSonoSupabase): RegistroSono {
  return {
    id: registroSupabase.id,
    inicio: registroSupabase.inicio,
    fim: registroSupabase.fim,
    qualidade: registroSupabase.qualidade,
    notas: registroSupabase.notas,
  };
}

/**
 * Busca os registros de sono do usuário no Supabase
 */
export async function fetchRegistrosSono(userId: string): Promise<RegistroSono[]> {
  try {
    // Verifica se está online
    const { online } = await checkConnection();
    if (!online) {
      console.log('Offline: usando dados locais para registros de sono');
      return []; // Retorna vazio para que o sistema use os dados do localStorage
    }

    // Busca registros filtrados por usuário
    const { data, success, error } = await fetchData<RegistroSonoSupabase>(TABLE_NAME);
    
    if (!success || !data) {
      console.error('Erro ao buscar registros de sono:', error);
      return [];
    }

    // Filtra por usuário e converte para o formato local
    const registrosDoUsuario = data
      .filter(r => r.user_id === userId)
      .map(toRegistroSono);
    
    return registrosDoUsuario;
  } catch (error) {
    console.error('Erro ao buscar registros de sono:', error);
    return [];
  }
}

/**
 * Adiciona um novo registro de sono no Supabase
 */
export async function addRegistroSono(registro: RegistroSono, userId: string): Promise<boolean> {
  try {
    // Verifica se está online
    const { online } = await checkConnection();
    if (!online) {
      console.log('Offline: registro será sincronizado quando online');
      return false;
    }

    const registroSupabase = toRegistroSonoSupabase(registro, userId);
    const { success } = await insertData(TABLE_NAME, registroSupabase);
    
    return success;
  } catch (error) {
    console.error('Erro ao adicionar registro de sono:', error);
    return false;
  }
}

/**
 * Atualiza um registro de sono no Supabase
 */
export async function updateRegistroSono(registro: RegistroSono, userId: string): Promise<boolean> {
  try {
    // Verifica se está online
    const { online } = await checkConnection();
    if (!online) {
      console.log('Offline: atualização será sincronizada quando online');
      return false;
    }

    const registroSupabase = toRegistroSonoSupabase(registro, userId);
    const { success } = await updateData(TABLE_NAME, registro.id, registroSupabase);
    
    return success;
  } catch (error) {
    console.error('Erro ao atualizar registro de sono:', error);
    return false;
  }
}

/**
 * Remove um registro de sono do Supabase
 */
export async function deleteRegistroSono(id: string): Promise<boolean> {
  try {
    // Verifica se está online
    const { online } = await checkConnection();
    if (!online) {
      console.log('Offline: remoção será sincronizada quando online');
      return false;
    }

    const { success } = await deleteData(TABLE_NAME, id);
    return success;
  } catch (error) {
    console.error('Erro ao remover registro de sono:', error);
    return false;
  }
}

/**
 * Sincroniza registros de sono locais com o Supabase
 * Este método pode ser chamado periodicamente ou quando o usuário volta a ficar online
 */
export async function sincronizarRegistrosSono(
  registrosLocais: RegistroSono[], 
  userId: string
): Promise<RegistroSono[]> {
  try {
    // Verifica se está online
    const { online } = await checkConnection();
    if (!online) {
      return registrosLocais; // Mantém dados locais se offline
    }

    // Busca registros do servidor
    const registrosServidor = await fetchRegistrosSono(userId);
    
    // Mapeia IDs para facilitar comparação
    const idsServidor = new Set(registrosServidor.map(r => r.id));
    const idsLocais = new Set(registrosLocais.map(r => r.id));
    
    // Registros para adicionar (existem localmente mas não no servidor)
    const paraAdicionar = registrosLocais.filter(r => !idsServidor.has(r.id));
    
    // Registros para atualizar (existem em ambos)
    const paraAtualizar = registrosLocais.filter(r => idsServidor.has(r.id));
    
    // Registros para remover (existem no servidor mas não localmente)
    const paraRemover = registrosServidor.filter(r => !idsLocais.has(r.id));
    
    // Executa as operações
    for (const registro of paraAdicionar) {
      await addRegistroSono(registro, userId);
    }
    
    for (const registro of paraAtualizar) {
      await updateRegistroSono(registro, userId);
    }
    
    for (const registro of paraRemover) {
      await deleteRegistroSono(registro.id);
    }
    
    // Retorna os registros do servidor após sincronização
    return await fetchRegistrosSono(userId);
  } catch (error) {
    console.error('Erro ao sincronizar registros de sono:', error);
    return registrosLocais; // Mantém dados locais em caso de erro
  }
} 