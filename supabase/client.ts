import { createClient } from '@supabase/supabase-js';

// Configuração das credenciais do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gtqnhweevlyzfigtzxml.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0cW5od2Vldmx5emZpZ3R6eG1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMjE4NzQsImV4cCI6MjA1Njg5Nzg3NH0.W30elhoaD3vgrw_-S77-3g_UmwY_LfFa7OlUYJ9VX5k';

// Criação do cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função para testar a conexão com o Supabase
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('users').select('count').single();
    
    if (error) {
      console.error('Erro ao conectar com o Supabase:', error.message);
      return { success: false, message: error.message };
    }
    
    return { success: true, message: 'Conexão com o Supabase estabelecida com sucesso!' };
  } catch (error) {
    console.error('Erro ao testar conexão com o Supabase:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

// Exportação padrão para facilitar a importação
export default supabase; 