import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { signUp, signIn, signInWithGitHub, signInWithGoogle } from '@/supabase/auth';

type AuthStatus = 'idle' | 'authenticating' | 'authenticated' | 'error';
type Provider = 'github' | 'google';

interface AuthState {
  status: AuthStatus;
  message: string;
  details?: string;
}

interface UseSupabaseReturn {
  status: AuthStatus;
  message: string;
  details?: string;
  isLoading: boolean;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithProvider: (provider: Provider) => Promise<void>;
  clearError: () => void;
}

export function useSupabase(): UseSupabaseReturn {
  const { refreshUser } = useAuth();
  const [authState, setAuthState] = useState<AuthState>({
    status: 'idle',
    message: ''
  });

  const updateState = (newState: Partial<AuthState>) => {
    setAuthState(prev => ({ ...prev, ...newState }));
  };

  const clearError = () => {
    updateState({ status: 'idle', message: '', details: undefined });
  };

  const register = async (email: string, password: string) => {
    try {
      updateState({ status: 'authenticating', message: 'Criando sua conta...' });

      const result = await signUp(email, password);

      if (result.success) {
        updateState({
          status: 'authenticated',
          message: result.message,
          details: result.details
        });
        await refreshUser();
      } else {
        updateState({
          status: 'error',
          message: result.message,
          details: result.details
        });
      }
    } catch (error) {
      updateState({
        status: 'error',
        message: 'Erro inesperado ao criar conta',
        details: error instanceof Error ? error.message : 'Tente novamente mais tarde'
      });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      updateState({ status: 'authenticating', message: 'Fazendo login...' });

      const result = await signIn(email, password);

      if (result.success) {
        updateState({
          status: 'authenticated',
          message: result.message
        });
        await refreshUser();
      } else {
        updateState({
          status: 'error',
          message: result.message
        });
      }
    } catch (error) {
      updateState({
        status: 'error',
        message: 'Erro inesperado ao fazer login',
        details: error instanceof Error ? error.message : 'Tente novamente mais tarde'
      });
    }
  };

  const loginWithProvider = async (provider: Provider) => {
    try {
      updateState({ 
        status: 'authenticating', 
        message: `Conectando com ${provider === 'github' ? 'GitHub' : 'Google'}...` 
      });

      const loginFn = provider === 'github' ? signInWithGitHub : signInWithGoogle;
      const result = await loginFn();

      if (result.success) {
        updateState({
          status: 'authenticated',
          message: 'Redirecionando...'
        });
      } else {
        updateState({
          status: 'error',
          message: result.message || `Erro ao conectar com ${provider}`
        });
      }
    } catch (error) {
      updateState({
        status: 'error',
        message: `Erro ao conectar com ${provider}`,
        details: error instanceof Error ? error.message : 'Tente novamente mais tarde'
      });
    }
  };

  return {
    status: authState.status,
    message: authState.message,
    details: authState.details,
    isLoading: authState.status === 'authenticating',
    register,
    login,
    loginWithProvider,
    clearError
  };
}
