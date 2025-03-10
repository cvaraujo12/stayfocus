import { supabase } from './client';
import { AuthError, Session } from '@supabase/supabase-js';

type Provider = 'github' | 'google';

/**
 * Realiza login com email e senha
 * @param email Email do usuário
 * @param password Senha do usuário
 * @returns Objeto com dados do usuário ou mensagem de erro
 */
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      return {
        success: false,
        message: error.message,
        user: null,
        session: null
      };
    }
    
    if (data.session) {
      await storeSessionSecurely(data.session);
    }
    
    return {
      success: true,
      message: 'Login realizado com sucesso',
      user: data.user,
      session: data.session
    };
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao fazer login',
      user: null,
      session: null
    };
  }
}

/**
 * Realiza logout do usuário atual
 * @returns Objeto indicando sucesso ou falha
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return {
        success: false,
        message: error.message
      };
    }
    
    return {
      success: true,
      message: 'Logout realizado com sucesso'
    };
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Configuração base para autenticação OAuth
 * @param provider Provedor de autenticação (github, google, etc)
 * @param options Opções adicionais para o provedor
 * @returns Configuração para autenticação OAuth
 */
function getOAuthConfig(provider: Provider, options: Record<string, any> = {}) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
  // Configurações específicas por provedor
  const providerConfigs = {
    github: {
      scopes: 'read:user user:email',
      redirectTo: `${baseUrl}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    },
    google: {
      scopes: 'profile email',
      redirectTo: `${baseUrl}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
        response_type: 'code'
      }
    }
  };

  const config = providerConfigs[provider] || {
    redirectTo: `${baseUrl}/auth/callback`
  };

  return {
    provider,
    options: {
      ...config,
      ...options
    }
  };
}

/**
 * Armazena a sessão de forma segura
 * @param session Sessão a ser armazenada
 */
async function storeSessionSecurely(session: Session) {
  try {
    // O Supabase já armazena a sessão em cookies HttpOnly por padrão
    
    if (typeof localStorage !== 'undefined') {
      // Armazena apenas metadados não sensíveis
      const metadata = {
        expires_at: session.expires_at,
        provider_token: !!session.provider_token, // Apenas indica se existe
        provider_refresh_token: !!session.provider_refresh_token, // Apenas indica se existe
        last_sign_in: new Date().toISOString()
      };
      
      localStorage.setItem('auth_metadata', JSON.stringify(metadata));
    }
    
    // Configura refresh automático do token
    if (session.expires_at) {
      const expiresAt = new Date(session.expires_at * 1000);
      const now = new Date();
      const timeUntilExpiry = expiresAt.getTime() - now.getTime();
      
      // Agenda refresh 5 minutos antes da expiração
      if (timeUntilExpiry > 5 * 60 * 1000) {
        setTimeout(async () => {
          await refreshSession();
        }, timeUntilExpiry - 5 * 60 * 1000);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao armazenar sessão:', error);
    return false;
  }
}

/**
 * Atualiza a sessão atual para evitar expiração do token
 * @returns Resultado da operação de refresh
 */
async function refreshSession() {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Erro ao atualizar sessão:', error);
      return false;
    }
    
    if (data.session) {
      await storeSessionSecurely(data.session);
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar sessão:', error);
    return false;
  }
}

/**
 * Realiza login com GitHub
 * @param options Opções adicionais para autenticação
 * @returns Dados da autenticação ou erro
 */
export async function signInWithGitHub(options: Record<string, any> = {}) {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth(
      getOAuthConfig('github', options)
    );
    
    if (error) {
      throw error;
    }
    
    // O OAuth apenas inicia o fluxo e retorna uma URL para redirecionamento,
    // não uma sessão imediata
    return { 
      success: true, 
      data, 
      message: 'Redirecionando para autenticação com GitHub' 
    };
  } catch (error) {
    console.error('Erro ao fazer login com GitHub:', error);
    return { 
      success: false, 
      data: null, 
      message: error instanceof AuthError 
        ? error.message 
        : error instanceof Error 
          ? error.message 
          : 'Erro desconhecido ao fazer login com GitHub' 
    };
  }
}

/**
 * Realiza login com Google
 * @param options Opções adicionais para autenticação
 * @returns Dados da autenticação ou erro
 */
export async function signInWithGoogle(options: Record<string, any> = {}) {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth(
      getOAuthConfig('google', options)
    );
    
    if (error) {
      throw error;
    }
    
    // O OAuth apenas inicia o fluxo e retorna uma URL para redirecionamento,
    // não uma sessão imediata
    return { 
      success: true, 
      data, 
      message: 'Redirecionando para autenticação com Google' 
    };
  } catch (error) {
    console.error('Erro ao fazer login com Google:', error);
    return { 
      success: false, 
      data: null, 
      message: error instanceof AuthError 
        ? error.message 
        : error instanceof Error 
          ? error.message 
          : 'Erro desconhecido ao fazer login com Google' 
    };
  }
}

/**
 * Registra um novo usuário
 * @param email Email do usuário
 * @param password Senha do usuário
 * @returns Objeto com dados do usuário registrado, status detalhado e mensagens de feedback
 */
export async function signUp(email: string, password: string) {
  try {
    // Validações básicas para feedback imediato
    if (!email || !email.includes('@')) {
      return {
        success: false,
        status: 'validation_error',
        message: 'Por favor, insira um email válido',
        details: 'O email deve conter @',
        user: null,
        session: null
      };
    }

    if (!password || password.length < 8) {
      return {
        success: false,
        status: 'validation_error',
        message: 'A senha deve ter no mínimo 8 caracteres',
        details: 'Use uma combinação de letras, números e símbolos para maior segurança',
        user: null,
        session: null
      };
    }

    // Tenta criar o usuário
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window?.location?.origin}/auth/callback`
      }
    });
    
    if (error) {
      // Traduz mensagens de erro comuns para feedback mais amigável
      const errorMessages: Record<string, { message: string, details: string }> = {
        'User already registered': {
          message: 'Email já cadastrado',
          details: 'Tente fazer login ou recuperar sua senha'
        },
        'Password should be at least 6 characters': {
          message: 'Senha muito curta',
          details: 'Use uma senha com pelo menos 8 caracteres'
        },
        'Invalid email': {
          message: 'Email inválido',
          details: 'Verifique se o email está correto'
        }
      };

      const friendlyError = errorMessages[error.message] || {
        message: error.message,
        details: 'Se o problema persistir, entre em contato com o suporte'
      };

      return {
        success: false,
        status: 'error',
        message: friendlyError.message,
        details: friendlyError.details,
        user: null,
        session: null
      };
    }
    
    // Armazena a sessão se disponível
    if (data.session) {
      await storeSessionSecurely(data.session);
    }

    // Verifica se o email já existe
    if (data.user?.identities?.length === 0) {
      return {
        success: false,
        status: 'existing_user',
        message: 'Email já cadastrado',
        details: 'Use a opção de login ou recupere sua senha',
        user: null,
        session: null
      };
    }
    
    return {
      success: true,
      status: 'success',
      message: 'Cadastro realizado com sucesso!',
      details: 'Verifique seu email para confirmar sua conta',
      user: data.user,
      session: data.session
    };
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    return {
      success: false,
      status: 'unexpected_error',
      message: 'Erro inesperado ao criar conta',
      details: error instanceof Error ? error.message : 'Tente novamente mais tarde',
      user: null,
      session: null
    };
  }
}

/**
 * Obtém o usuário atual
 * @returns Objeto com dados do usuário ou mensagem de erro
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      return {
        success: false,
        user: null,
        message: error.message
      };
    }
    
    if (user) {
      return {
        success: true,
        user,
        message: 'Usuário autenticado'
      };
    }
    
    return {
      success: false,
      user: null,
      message: 'Nenhum usuário autenticado'
    };
  } catch (error) {
    console.error('Erro ao buscar usuário atual:', error);
    return {
      success: false,
      user: null,
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Obtém a sessão atual
 * @returns Dados da sessão atual ou null
 */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Atualiza os dados do usuário
 * @param userData Dados a serem atualizados
 * @returns Dados atualizados do usuário
 */
export async function updateUserData(userData: { [key: string]: any }) {
  const { data, error } = await supabase.auth.updateUser(userData);
  if (error) throw error;
  return data;
}

export default {
  signIn,
  signOut,
  signInWithGitHub,
  signInWithGoogle,
  signUp,
  getCurrentUser,
  getSession,
  updateUserData
}; 