"use client";

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/supabase/client'
import { useStore } from '../store'
import { User } from '@supabase/supabase-js'
import { getCurrentUser, signOut } from '@/supabase/auth'
import { useRouter } from 'next/navigation'

type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  logout: async () => {},
  refreshUser: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const resetState = useStore(state => state.resetState)
  const router = useRouter()

  // Função para obter o usuário atual
  const refreshUser = async () => {
    try {
      setLoading(true);
      const result = await getCurrentUser();
      
      if (result && result.success) {
        setUser(result.user);
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
        setUser(null);
        
        // Limpa o estado quando o usuário deslogar
        if (resetState) {
          resetState();
        }
        
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

  useEffect(() => {
    refreshUser();
    
    // Configura o listener para mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
        
        // Limpa o estado quando o usuário deslogar
        if (resetState) {
          resetState();
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [resetState]);

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
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 