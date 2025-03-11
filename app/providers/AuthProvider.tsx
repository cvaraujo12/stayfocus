"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react'
import { supabase } from '@/supabase/client'
import { useStore } from '../store'
import { User } from '@supabase/supabase-js'
import { getCurrentUser, signOut, setupSessionRefresh } from '@/supabase/auth'
import { useRouter } from 'next/navigation'
import { SyncManager } from '@/app/components/SyncManager'

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
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const cleanupRef = useRef<(() => void) | null>(null);

  // Função para obter o usuário atual
  const refreshUser = async () => {
    try {
      setLoading(true);
      const { success, user, message } = await getCurrentUser();
      
      if (success && user) {
        setUser(user);
        setError(null);
      } else {
        setUser(null);
        setError(message || 'Erro ao obter usuário');
      }
    } catch (err) {
      console.error('Erro ao obter usuário:', err);
      setUser(null);
      setError('Erro ao carregar usuário');
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      const { success, message } = await signOut();
      
      if (success) {
        setUser(null);
        router.push('/login');
      } else {
        setError(message || 'Erro ao realizar logout');
      }
    } catch (err) {
      console.error('Erro ao realizar logout:', err);
      setError('Erro ao realizar logout');
    }
  };

  // Carregar usuário inicial e configurar listener de autenticação
  useEffect(() => {
    // Função para carregar usuário e configurar refresh
    const loadUserAndSetupRefresh = async () => {
      // Carregar usuário atual
      await refreshUser();
      
      // Configurar refresh automático de token
      const cleanup = await setupSessionRefresh();
      cleanupRef.current = cleanup;
      
      // Configurar listener de alterações na autenticação
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log(`Evento de autenticação: ${event}`);
          
          if (event === 'SIGNED_IN' && session) {
            setUser(session.user);
            setError(null);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
          } else if (event === 'USER_UPDATED' && session) {
            setUser(session.user);
          }
        }
      );
      
      // Atualizar loading ao final
      setLoading(false);
      
      // Limpar listener ao desmontar
      return () => {
        subscription.unsubscribe();
        if (cleanupRef.current) {
          cleanupRef.current();
        }
      };
    };
    
    loadUserAndSetupRefresh();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, logout, refreshUser }}>
      {user && <SyncManager userId={user.id} />}
      {children}
    </AuthContext.Provider>
  );
} 