'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { getCurrentUser, signOut } from '@/supabase/auth';

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

  // Valores fornecidos pelo contexto
  const value = {
    user,
    loading,
    error,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 