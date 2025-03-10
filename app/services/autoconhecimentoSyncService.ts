import { supabase } from '@/supabase/client';
import { fetchData, insertData, updateData, deleteData, checkConnection } from '@/supabase/utils';
import { NotaAutoconhecimento } from '@/app/stores/autoconhecimentoStore';

// Nome da tabela no Supabase
const TABLE_NAME = 'self_knowledge_notes';

/**
 * Tipo para mapear uma nota de autoconhecimento no formato do Supabase
 */
export type NotaAutoconhecimentoSupabase = {
  id: string;
  user_id: string;
  titulo: string;
  conteudo: string;
  data_criacao: string; // Formato ISO YYYY-MM-DD
  tags: string[];
  created_at?: string;
  updated_at?: string;
};

/**
 * Converte uma NotaAutoconhecimento do store para o formato do Supabase
 */
export function toNotaAutoconhecimentoSupabase(nota: NotaAutoconhecimento, userId: string): Omit<NotaAutoconhecimentoSupabase, 'created_at' | 'updated_at'> {
  return {
    id: nota.id,
    user_id: userId,
    titulo: nota.titulo,
    conteudo: nota.conteudo,
    data_criacao: nota.dataCriacao,
    tags: nota.tags || [],
  };
}

/**
 * Converte uma NotaAutoconhecimentoSupabase para o formato do store
 */
export function toNotaAutoconhecimento(notaSupabase: NotaAutoconhecimentoSupabase): NotaAutoconhecimento {
  return {
    id: notaSupabase.id,
    titulo: notaSupabase.titulo,
    conteudo: notaSupabase.conteudo,
    dataCriacao: notaSupabase.data_criacao,
    tags: notaSupabase.tags || [],
  };
}

/**
 * Busca as notas de autoconhecimento do usuário no Supabase
 */
export async function fetchNotas(userId: string): Promise<NotaAutoconhecimento[]> {
  try {
    // Verifica se está online
    const { online } = await checkConnection();
    if (!online) {
      console.log('Offline: usando dados locais para notas de autoconhecimento');
      return []; // Retorna vazio para que o sistema use os dados do localStorage
    }

    // Busca notas filtradas por usuário
    const { data, success, error } = await fetchData<NotaAutoconhecimentoSupabase>(TABLE_NAME);
    
    if (!success || !data) {
      console.error('Erro ao buscar notas de autoconhecimento:', error);
      return [];
    }

    // Filtra por usuário e converte para o formato local
    const notasDoUsuario = data
      .filter(p => p.user_id === userId)
      .map(toNotaAutoconhecimento);
    
    return notasDoUsuario;
  } catch (error) {
    console.error('Erro ao buscar notas de autoconhecimento:', error);
    return [];
  }
}

/**
 * Adiciona uma nova nota de autoconhecimento no Supabase
 */
export async function addNota(nota: NotaAutoconhecimento, userId: string): Promise<boolean> {
  try {
    // Verifica se está online
    const { online } = await checkConnection();
    if (!online) {
      console.log('Offline: nota será sincronizada quando online');
      return false;
    }

    const notaSupabase = toNotaAutoconhecimentoSupabase(nota, userId);
    const { success } = await insertData(TABLE_NAME, notaSupabase);
    
    return success;
  } catch (error) {
    console.error('Erro ao adicionar nota de autoconhecimento:', error);
    return false;
  }
}

/**
 * Atualiza uma nota de autoconhecimento no Supabase
 */
export async function updateNota(nota: NotaAutoconhecimento, userId: string): Promise<boolean> {
  try {
    // Verifica se está online
    const { online } = await checkConnection();
    if (!online) {
      console.log('Offline: atualização será sincronizada quando online');
      return false;
    }

    const notaSupabase = toNotaAutoconhecimentoSupabase(nota, userId);
    const { success } = await updateData(TABLE_NAME, nota.id, notaSupabase);
    
    return success;
  } catch (error) {
    console.error('Erro ao atualizar nota de autoconhecimento:', error);
    return false;
  }
}

/**
 * Remove uma nota de autoconhecimento do Supabase
 */
export async function deleteNota(id: string): Promise<boolean> {
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
    console.error('Erro ao remover nota de autoconhecimento:', error);
    return false;
  }
}

/**
 * Sincroniza notas de autoconhecimento locais com o Supabase
 * Este método pode ser chamado periodicamente ou quando o usuário volta a ficar online
 */
export async function sincronizarNotas(
  notasLocais: NotaAutoconhecimento[], 
  userId: string
): Promise<NotaAutoconhecimento[]> {
  try {
    // Verifica se está online
    const { online } = await checkConnection();
    if (!online) {
      return notasLocais; // Mantém dados locais se offline
    }

    // Busca notas do servidor
    const notasServidor = await fetchNotas(userId);
    
    // Mapeia IDs para facilitar comparação
    const idsServidor = new Set(notasServidor.map(n => n.id));
    const idsLocais = new Set(notasLocais.map(n => n.id));
    
    // Notas para adicionar (existem localmente mas não no servidor)
    const paraAdicionar = notasLocais.filter(n => !idsServidor.has(n.id));
    
    // Notas para atualizar (existem em ambos)
    const paraAtualizar = notasLocais.filter(n => idsServidor.has(n.id));
    
    // Notas para remover (existem no servidor mas não localmente)
    const paraRemover = notasServidor.filter(n => !idsLocais.has(n.id));
    
    // Executa as operações
    for (const nota of paraAdicionar) {
      await addNota(nota, userId);
    }
    
    for (const nota of paraAtualizar) {
      await updateNota(nota, userId);
    }
    
    for (const nota of paraRemover) {
      await deleteNota(nota.id);
    }
    
    // Retorna as notas do servidor após sincronização
    return await fetchNotas(userId);
  } catch (error) {
    console.error('Erro ao sincronizar notas de autoconhecimento:', error);
    return notasLocais; // Mantém dados locais em caso de erro
  }
} 