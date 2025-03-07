// Exportação do cliente Supabase
export { supabase, testSupabaseConnection } from './client';

// Exportação das funções de autenticação
export * from './auth';

// Exportação das funções de CRUD
export * from './utils';

// Exportação padrão para facilitar a importação
import supabase from './client';
import auth from './auth';
import utils from './utils';

export default {
  supabase,
  auth,
  utils
}; 