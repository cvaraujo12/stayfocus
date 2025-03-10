import { supabase } from '@/supabase/client';
import { fetchData, insertData, updateData, deleteData, checkConnection } from '@/supabase/utils';
import { Prioridade } from '@/app/stores/prioridadesStore';

// Nome da tabela no Supabase
const TABLE_NAME = 'priorities';

/**
 * Tipo para mapear uma prioridade no formato do Supabase
 */
export type PrioridadeSupabase = {
  id: string;
  user_id: string;
  texto: string;
  concluida: boolean;
  data_prioridade: string; // Formato ISO YYYY-MM-DD
  created_at?: string;
  updated_at?: string;
};

/**
 * Converte uma Prioridade do store para o formato do Supabase
 */
export function toPrioridadeSupabase(prioridade: Prioridade, userId: string): Omit<PrioridadeSupabase, 'created_at' | 'updated_at'> {
  return {
    id: prioridade.id,
    user_id: userId,
    texto: prioridade.texto,
    concluida: prioridade.concluida,
    data_prioridade: prioridade.data,
  };
}

/**
 * Converte uma PrioridadeSupabase para o formato do store
 */
export function toPrioridade(prioridadeSupabase: PrioridadeSupabase): Prioridade {
  return {
    id: prioridadeSupabase.id,
    texto: prioridadeSupabase.texto,
    concluida: prioridadeSupabase.concluida,
    data: prioridadeSupabase.data_prioridade,
  };
}

/**
 * Busca as prioridades do usuário no Supabase
 */
export async function fetchPrioridades(userId: string): Promise<Prioridade[]> {
  try {
    // Verifica se está online
    const { online } = await checkConnection();
    if (!online) {
      console.log('Offline: usando dados locais para prioridades');
      return []; // Retorna vazio para que o sistema use os dados do localStorage
    }

    // Busca prioridades filtradas por usuário
    const { data, success, error } = await fetchData<PrioridadeSupabase>(TABLE_NAME);
    
    if (!success || !data) {
      console.error('Erro ao buscar prioridades:', error);
      return [];
    }

    // Filtra por usuário e converte para o formato local
    const prioridadesDoUsuario = data
      .filter(p => p.user_id === userId)
      .map(toPrioridade);
    
    return prioridadesDoUsuario;
  } catch (error) {
    console.error('Erro ao buscar prioridades:', error);
    return [];
  }
}

/**
 * Adiciona uma nova prioridade no Supabase
 */
export async function addPrioridade(prioridade: Prioridade, userId: string): Promise<boolean> {
  try {
    // Verifica se está online
    const { online } = await checkConnection();
    if (!online) {
      console.log('Offline: prioridade será sincronizada quando online');
      return false;
    }

    const prioridadeSupabase = toPrioridadeSupabase(prioridade, userId);
    const { success } = await insertData(TABLE_NAME, prioridadeSupabase);
    
    return success;
  } catch (error) {
    console.error('Erro ao adicionar prioridade:', error);
    return false;
  }
}

/**
 * Atualiza uma prioridade no Supabase
 */
export async function updatePrioridade(prioridade: Prioridade, userId: string): Promise<boolean> {
  try {
    // Verifica se está online
    const { online } = await checkConnection();
    if (!online) {
      console.log('Offline: atualização será sincronizada quando online');
      return false;
    }

    const prioridadeSupabase = toPrioridadeSupabase(prioridade, userId);
    const { success } = await updateData(TABLE_NAME, prioridade.id, prioridadeSupabase);
    
    return success;
  } catch (error) {
    console.error('Erro ao atualizar prioridade:', error);
    return false;
  }
}

/**
 * Remove uma prioridade do Supabase
 */
export async function deletePrioridade(id: string): Promise<boolean> {
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
    console.error('Erro ao remover prioridade:', error);
    return false;
  }
}

/**
 * Sincroniza prioridades locais com o Supabase
 * Este método pode ser chamado periodicamente ou quando o usuário volta a ficar online
 */
export async function sincronizarPrioridades(
  prioridadesLocais: Prioridade[], 
  userId: string
): Promise<Prioridade[]> {
  try {
    // Verifica se está online
    const { online } = await checkConnection();
    if (!online) {
      return prioridadesLocais; // Mantém dados locais se offline
    }

    // Busca prioridades do servidor
    const prioridadesServidor = await fetchPrioridades(userId);
    
    // Mapeia IDs para facilitar comparação
    const idsServidor = new Set(prioridadesServidor.map(p => p.id));
    const idsLocais = new Set(prioridadesLocais.map(p => p.id));
    
    // Prioridades para adicionar (existem localmente mas não no servidor)
    const paraAdicionar = prioridadesLocais.filter(p => !idsServidor.has(p.id));
    
    // Prioridades para atualizar (existem em ambos)
    const paraAtualizar = prioridadesLocais.filter(p => idsServidor.has(p.id));
    
    // Prioridades para remover (existem no servidor mas não localmente)
    const paraRemover = prioridadesServidor.filter(p => !idsLocais.has(p.id));
    
    // Executa as operações
    for (const prioridade of paraAdicionar) {
      await addPrioridade(prioridade, userId);
    }
    
    for (const prioridade of paraAtualizar) {
      await updatePrioridade(prioridade, userId);
    }
    
    for (const prioridade of paraRemover) {
      await deletePrioridade(prioridade.id);
    }
    
    // Retorna as prioridades do servidor após sincronização
    return await fetchPrioridades(userId);
  } catch (error) {
    console.error('Erro ao sincronizar prioridades:', error);
    return prioridadesLocais; // Mantém dados locais em caso de erro
  }
} 