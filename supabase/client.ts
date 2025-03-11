import { createClient } from '@supabase/supabase-js';

// Verificação das variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verificação de segurança para garantir que as variáveis de ambiente estão configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Erro: As variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórias.');
  
  if (typeof window !== 'undefined') {
    // Apenas mostra alerta no navegador, não no servidor
    alert('Erro de configuração: Entre em contato com o suporte.');
  }
}

// Configurações para o cliente Supabase com opções atualizadas
const supabaseOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    // Configurações de realtime
  },
  global: {
    // Configurações globais
  },
  // Usa a opção storage em vez das opções depreciadas
  storage: {
    // Usando localStorage para armazenar sessões no cliente
    // Esta opção substitui getStorage, serialize e deserialize
  }
};

// Criação do cliente Supabase com as novas opções
export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || '',
  supabaseOptions
);

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