import { createClient } from '@supabase/supabase-js';

// Configuração das credenciais do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gtqnhweevlyzfigtzxml.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0cW5od2Vldmx5emZpZ3R6eG1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMjE4NzQsImV4cCI6MjA1Njg5Nzg3NH0.W30elhoaD3vgrw_-S77-3g_UmwY_LfFa7OlUYJ9VX5k';

// Criação do cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função para testar a conexão com o Supabase
export async function testSupabaseConnection() {
  try {
    // Tenta uma requisição simples para verificar a conexão
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    // Se não houver erro, significa que a conexão está funcionando
    if (!error) {
      return { 
        success: true, 
        message: 'Conexão com o Supabase estabelecida com sucesso!',
        online: true
      };
    }

    // Se houver erro, verifica o tipo
    if (error.code === 'PGRST116' || error.code === '42P01') {
      // Tabela não existe, mas conexão está ok
      return { 
        success: true, 
        message: 'Conexão estabelecida, mas tabela não encontrada',
        online: true
      };
    }

    if (error.code === '401' || error.code === 'PGRST301') {
      return { 
        success: false, 
        message: 'Erro de autenticação. Por favor, faça login novamente.',
        online: true
      };
    }

    // Outros erros indicam problemas de conexão
    return { 
      success: false, 
      message: `Erro de conexão: ${error.message}`,
      online: false
    };

  } catch (error) {
    console.error('Erro ao testar conexão:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      online: false
    };
  }
}

// Exportação padrão para facilitar a importação
export default supabase; 