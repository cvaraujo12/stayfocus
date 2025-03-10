import { supabase } from '@/supabase/client';
import { fetchData, insertData, updateData, deleteData, checkConnection } from '@/supabase/utils';
import { SessaoEstudo } from '@/app/stores/registroEstudosStore';

// Nome da tabela no Supabase
const TABLE_NAME = 'study_sessions';

/**
 * Tipo para mapear uma sessão de estudo no formato do Supabase
 */
export type SessaoEstudoSupabase = {
  id: string;
  user_id: string;
  titulo: string;
  categoria: string | null;
  duracao_minutos: number;
  data_sessao: string; // Formato ISO YYYY-MM-DD
  hora_inicio: string | null; // Formato HH:MM
  observacoes: string | null;
  concluida: boolean;
  created_at?: string;
  updated_at?: string;
};

/**
 * Converte uma SessaoEstudo do store para o formato do Supabase
 */
export function toSessaoEstudoSupabase(sessao: SessaoEstudo, userId: string): Omit<SessaoEstudoSupabase, 'created_at' | 'updated_at'> {
  return {
    id: sessao.id,
    user_id: userId,
    titulo: sessao.titulo,
    categoria: sessao.categoria || null,
    duracao_minutos: sessao.duracaoMinutos,
    data_sessao: sessao.dataSessao,
    hora_inicio: sessao.horaInicio || null,
    observacoes: sessao.observacoes || null,
    concluida: sessao.concluida || false,
  };
}

/**
 * Converte uma SessaoEstudoSupabase para o formato do store
 */
export function toSessaoEstudo(sessaoSupabase: SessaoEstudoSupabase): SessaoEstudo {
  return {
    id: sessaoSupabase.id,
    titulo: sessaoSupabase.titulo,
    categoria: sessaoSupabase.categoria || undefined,
    duracaoMinutos: sessaoSupabase.duracao_minutos,
    dataSessao: sessaoSupabase.data_sessao,
    horaInicio: sessaoSupabase.hora_inicio || undefined,
    observacoes: sessaoSupabase.observacoes || undefined,
    concluida: sessaoSupabase.concluida,
  };
}

/**
 * Busca as sessões de estudo do usuário no Supabase
 */
export async function fetchSessoesEstudo(userId: string): Promise<SessaoEstudo[]> {
  try {
    // Verifica se está online
    const { online } = await checkConnection();
    if (!online) {
      console.log('Offline: usando dados locais para sessões de estudo');
      return []; // Retorna vazio para que o sistema use os dados do localStorage
    }

    // Busca sessões filtradas por usuário
    const { data, success, error } = await fetchData<SessaoEstudoSupabase>(TABLE_NAME);
    
    if (!success || !data) {
      console.error('Erro ao buscar sessões de estudo:', error);
      return [];
    }

    // Filtra por usuário e converte para o formato local
    const sessoesDoUsuario = data
      .filter(s => s.user_id === userId)
      .map(toSessaoEstudo);
    
    return sessoesDoUsuario;
  } catch (error) {
    console.error('Erro ao buscar sessões de estudo:', error);
    return [];
  }
}

/**
 * Adiciona uma nova sessão de estudo no Supabase
 */
export async function addSessaoEstudo(sessao: SessaoEstudo, userId: string): Promise<boolean> {
  try {
    // Verifica se está online
    const { online } = await checkConnection();
    if (!online) {
      console.log('Offline: sessão será sincronizada quando online');
      return false;
    }

    const sessaoSupabase = toSessaoEstudoSupabase(sessao, userId);
    const { success } = await insertData(TABLE_NAME, sessaoSupabase);
    
    return success;
  } catch (error) {
    console.error('Erro ao adicionar sessão de estudo:', error);
    return false;
  }
}

/**
 * Atualiza uma sessão de estudo no Supabase
 */
export async function updateSessaoEstudo(sessao: SessaoEstudo, userId: string): Promise<boolean> {
  try {
    // Verifica se está online
    const { online } = await checkConnection();
    if (!online) {
      console.log('Offline: atualização será sincronizada quando online');
      return false;
    }

    const sessaoSupabase = toSessaoEstudoSupabase(sessao, userId);
    const { success } = await updateData(TABLE_NAME, sessao.id, sessaoSupabase);
    
    return success;
  } catch (error) {
    console.error('Erro ao atualizar sessão de estudo:', error);
    return false;
  }
}

/**
 * Remove uma sessão de estudo do Supabase
 */
export async function deleteSessaoEstudo(id: string): Promise<boolean> {
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
    console.error('Erro ao remover sessão de estudo:', error);
    return false;
  }
}

/**
 * Sincroniza sessões de estudo locais com o Supabase
 * Este método pode ser chamado periodicamente ou quando o usuário volta a ficar online
 */
export async function sincronizarSessoesEstudo(
  sessoesLocais: SessaoEstudo[], 
  userId: string
): Promise<SessaoEstudo[]> {
  try {
    // Verifica se está online
    const { online } = await checkConnection();
    if (!online) {
      return sessoesLocais; // Mantém dados locais se offline
    }

    // Busca sessões do servidor
    const sessoesServidor = await fetchSessoesEstudo(userId);
    
    // Mapeia IDs para facilitar comparação
    const idsServidor = new Set(sessoesServidor.map(s => s.id));
    const idsLocais = new Set(sessoesLocais.map(s => s.id));
    
    // Sessões para adicionar (existem localmente mas não no servidor)
    const paraAdicionar = sessoesLocais.filter(s => !idsServidor.has(s.id));
    
    // Sessões para atualizar (existem em ambos)
    const paraAtualizar = sessoesLocais.filter(s => idsServidor.has(s.id));
    
    // Sessões para remover (existem no servidor mas não localmente)
    const paraRemover = sessoesServidor.filter(s => !idsLocais.has(s.id));
    
    // Executa as operações
    for (const sessao of paraAdicionar) {
      await addSessaoEstudo(sessao, userId);
    }
    
    for (const sessao of paraAtualizar) {
      await updateSessaoEstudo(sessao, userId);
    }
    
    for (const sessao of paraRemover) {
      await deleteSessaoEstudo(sessao.id);
    }
    
    // Retorna as sessões do servidor após sincronização
    return await fetchSessoesEstudo(userId);
  } catch (error) {
    console.error('Erro ao sincronizar sessões de estudo:', error);
    return sessoesLocais; // Mantém dados locais em caso de erro
  }
} 