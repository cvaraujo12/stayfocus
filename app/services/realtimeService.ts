import { supabase } from '@/supabase/client';
import { RealtimeChannel, RealtimePostgresChangesFilter, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/**
 * Tipos de eventos para subscrição em tempo real
 */
export type EventType = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

/**
 * Interface para a função de callback de eventos em tempo real
 */
export interface RealtimeChangePayload<T = any> {
  eventType: EventType;
  new: T;
  old: T | null;
  table: string;
}

/**
 * Tipo do callback para eventos de mudança
 */
export type RealtimeCallback<T = any> = (payload: RealtimeChangePayload<T>) => void;

/**
 * Mapeamento de canais ativos para gerenciá-los
 */
const activeChannels: Map<string, RealtimeChannel> = new Map();

/**
 * Converte os tipos de evento da nossa API para o formato esperado pelo Supabase
 */
function mapEventType(eventType: EventType): '*' | 'INSERT' | 'UPDATE' | 'DELETE' {
  return eventType === '*' ? '*' : eventType;
}

/**
 * Subscreve a uma tabela específica para receber atualizações em tempo real
 * 
 * @param table Nome da tabela para observar
 * @param eventType Tipo de evento para observar (INSERT, UPDATE, DELETE ou *)
 * @param callback Função a ser chamada quando ocorrer o evento
 * @returns Identificador do canal para uso em unsubscribe
 */
export function subscribeToTable<T = any>(
  table: string,
  eventType: EventType = '*',
  callback: RealtimeCallback<T>
): string {
  // Criar identificador único para o canal
  const channelId = `${table}:${eventType}:${Date.now()}`;
  
  // Converter eventType para o formato esperado pela API
  const event = mapEventType(eventType);
  
  console.log(`Iniciando subscrição em tempo real para ${table} (eventos: ${event})`);
  
  try {
    // Configurar o filtro para as mudanças no Postgres
    const filter: RealtimePostgresChangesFilter<`*` | 'INSERT' | 'UPDATE' | 'DELETE'> = {
      event,
      schema: 'public',
      table
    };

    // Criar e configurar o canal usando a API mais recente do Supabase
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        filter,
        (payload: RealtimePostgresChangesPayload<T>) => {
          console.log(`Evento recebido de ${table}:`, payload.eventType);
          
          // Normalizar payload para formato consistente
          const normalizedPayload: RealtimeChangePayload<T> = {
            eventType: payload.eventType as EventType,
            new: payload.new as T,
            old: payload.old as T | null,
            table
          };
          
          // Chamar callback com dados normalizados
          callback(normalizedPayload);
        }
      )
      .subscribe((status) => {
        console.log(`Status da subscrição para ${table}: ${status}`);
        
        if (status === 'CHANNEL_ERROR') {
          console.error(`Erro no canal ${channelId}`);
        }
        
        if (status === 'TIMED_OUT') {
          console.error(`Timeout na conexão do canal ${channelId}`);
        }
      });
    
    // Armazenar canal para gerenciamento posterior
    activeChannels.set(channelId, channel);
    
    return channelId;
  } catch (error) {
    console.error(`Erro ao subscrever à tabela ${table}:`, error);
    throw error;
  }
}

/**
 * Cancela a subscrição de um canal específico
 * 
 * @param channelId Identificador do canal retornado por subscribeToTable
 * @returns true se desinscrição bem-sucedida, false caso contrário
 */
export function unsubscribeFromChannel(channelId: string): boolean {
  const channel = activeChannels.get(channelId);
  
  if (!channel) {
    console.warn(`Tentativa de desinscrição de canal inexistente: ${channelId}`);
    return false;
  }
  
  try {
    supabase.removeChannel(channel);
    activeChannels.delete(channelId);
    console.log(`Desinscrição do canal ${channelId} realizada com sucesso`);
    return true;
  } catch (error) {
    console.error(`Erro ao desinscrever do canal ${channelId}:`, error);
    return false;
  }
}

/**
 * Cancela todas as subscrições ativas
 */
export function unsubscribeAll(): void {
  console.log(`Desativando ${activeChannels.size} canais de tempo real`);
  
  for (const [channelId, channel] of activeChannels.entries()) {
    try {
      supabase.removeChannel(channel);
      console.log(`Canal ${channelId} desativado`);
    } catch (error) {
      console.error(`Erro ao desativar canal ${channelId}:`, error);
    }
  }
  
  activeChannels.clear();
}

/**
 * Verifica se o recurso de tempo real está disponível
 */
export async function checkRealtimeAvailability(): Promise<boolean> {
  try {
    // Tenta criar um canal de teste
    const testChannel = supabase.channel('test_availability');
    const status = await testChannel.subscribe();
    
    // Se chegou aqui, o tempo real está disponível
    if (status === 'SUBSCRIBED') {
      supabase.removeChannel(testChannel);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Recurso de tempo real não está disponível:', error);
    return false;
  }
}

export default {
  subscribeToTable,
  unsubscribeFromChannel,
  unsubscribeAll,
  checkRealtimeAvailability
}; 