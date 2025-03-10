'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { getCurrentUser, signOut } from '@/supabase/auth';
import { useAppStore } from '../store';
import { SyncManager } from '@/app/components/SyncManager';

// Definição do tipo para o contexto de autenticação
type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

// Criação do contexto com valores padrão
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  logout: async () => {},
  refreshUser: async () => {},
});

// Hook personalizado para usar o contexto de autenticação
export const useAuth = () => useContext(AuthContext);

// Provedor do contexto de autenticação
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Função para limpar o estado do usuário
  const clearUserState = () => {
    // Limpa o estado do Zustand
    const storeState = useAppStore.getState();
    if (storeState && storeState.resetState) {
      storeState.resetState();
    }

    // Limpa o localStorage
    if (typeof window !== 'undefined') {
      const storagePrefix = 'stayfocus-storage';
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(storagePrefix)) {
          localStorage.removeItem(key);
        }
      });
    }
  };

  // Função para obter o usuário atual
  const refreshUser = async () => {
    try {
      setLoading(true);
      const result = await getCurrentUser();
      
      if (result && result.success) {
        setUser(result.user);
        
        // Salvar dados do usuário no localStorage para acesso offline
        if (typeof window !== 'undefined' && result.user) {
          localStorage.setItem('auth-user', JSON.stringify({
            id: result.user.id,
            email: result.user.email,
            user_metadata: result.user.user_metadata
          }));
        }
      } else if (result) {
        setUser(null);
        if (result.message !== 'Nenhum usuário autenticado') {
          setError(result.message);
        }
      } else {
        setUser(null);
        setError('Erro ao obter dados do usuário');
      }
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      setError('Erro ao verificar autenticação');
    } finally {
      setLoading(false);
    }
  };

  // Função para fazer logout
  const logout = async () => {
    try {
      setLoading(true);
      const result = await signOut();
      
      if (result && result.success) {
        // Limpa o estado do usuário
        setUser(null);
        clearUserState();
        
        // Remove dados do usuário do localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-user');
        }

        // Redireciona para a página de login
        router.push('/login');
      } else if (result) {
        setError(result.message);
      } else {
        setError('Erro ao fazer logout');
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      setError('Erro ao fazer logout');
    } finally {
      setLoading(false);
    }
  };

  // Efeito para verificar o usuário atual ao carregar o componente
  useEffect(() => {
    refreshUser();
    
    // Adicionar listener para mudanças de autenticação
    const handleAuthChange = () => {
      refreshUser();
    };
    
    // Verificar mudanças na autenticação a cada 5 minutos
    const interval = setInterval(handleAuthChange, 5 * 60 * 1000);
    
    // Limpar o intervalo ao desmontar o componente
    return () => clearInterval(interval);
  }, []);

  // Efeito para atualizar o estado quando o usuário mudar
  useEffect(() => {
    if (!user) {
      // Se não houver usuário, limpa o estado
      clearUserState();
    }
  }, [user]);

  // Valores fornecidos pelo contexto
  const value = {
    user,
    loading,
    error,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* SyncManager é responsável por iniciar e gerenciar a sincronização de dados */}
      <SyncManager userId={user?.id || null} />
      {children}
    </AuthContext.Provider>
  );
} 