import { supabase } from '../../supabase/client';
import type { StateCreator, StoreMutatorIdentifier } from 'zustand';

type SyncMiddleware = <
  T extends object,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  f: StateCreator<T, Mps, Mcs>,
  tableMapping: Record<string, keyof T>
) => StateCreator<T, Mps, Mcs>;

export const syncMiddleware: SyncMiddleware = (f, tableMapping) => (set, get, store) => {
  const syncWithSupabase = async (state: any, tableName: string, stateKey: string) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      const userId = user.data.user.id;
      const data = state[stateKey];

      if (!Array.isArray(data)) return;

      // Adiciona user_id a cada item
      const dataWithUserId = data.map((item: any) => ({
        ...item,
        user_id: userId
      }));

      // Remove dados existentes do usuário
      await supabase
        .from(tableName)
        .delete()
        .eq('user_id', userId);

      // Insere novos dados
      if (dataWithUserId.length > 0) {
        const { error } = await supabase
          .from(tableName)
          .insert(dataWithUserId);

        if (error) {
          console.error(`Erro ao sincronizar ${tableName}:`, error);
        }
      }
    } catch (error) {
      console.error(`Erro ao sincronizar ${tableName}:`, error);
    }
  };

  // Carrega dados iniciais do Supabase
  const loadInitialData = async () => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      const userId = user.data.user.id;
      const initialState: any = {};

      for (const [tableName, stateKey] of Object.entries(tableMapping)) {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('user_id', userId);

        if (error) {
          console.error(`Erro ao carregar ${tableName}:`, error);
          continue;
        }

        initialState[stateKey] = data;
      }

      set(initialState);
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
    }
  };

  // Intercepta mudanças de estado para sincronizar com Supabase
  const interceptSet = (
    partial: any,
    replace?: boolean
  ) => {
    const nextState = typeof partial === 'function' ? partial(get()) : partial;

    // Chama o set original
    set(nextState, replace);

    // Sincroniza com Supabase
    Object.entries(tableMapping).forEach(([tableName, stateKey]) => {
      if (nextState[stateKey]) {
        syncWithSupabase(nextState, tableName, stateKey);
      }
    });
  };

  // Carrega dados iniciais ao montar o store
  loadInitialData();

  // Retorna o store com o interceptador
  return f(interceptSet, get, store);
}; 