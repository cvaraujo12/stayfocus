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
      console.log("[AUTH] Iniciando refreshUser para obter usuário atual...");
      
      const { success, user, message } = await getCurrentUser();
      console.log("[AUTH] Resultado de getCurrentUser:", { success, hasUser: !!user, message });
      
      if (success && user) {
        console.log("[AUTH] Usuário obtido com sucesso:", { id: user.id, email: user.email });
        setUser(user);
        setError(null);
      } else {
        console.log("[AUTH] Falha ao obter usuário:", message);
        setUser(null);
        setError(message || 'Erro ao obter usuário');
      }
    } catch (err) {
      console.error('[AUTH] Erro ao obter usuário:', err);
      setUser(null);
      setError('Erro ao carregar usuário');
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      console.log("[AUTH] Iniciando processo de logout...");
      const { success, message } = await signOut();
      
      if (success) {
        console.log("[AUTH] Logout realizado com sucesso, redirecionando para login");
        setUser(null);
        window.location.href = '/login'; // Forçar redirecionamento completo
      } else {
        console.log("[AUTH] Falha no logout:", message);
        setError(message || 'Erro ao realizar logout');
      }
    } catch (err) {
      console.error('[AUTH] Erro ao realizar logout:', err);
      setError('Erro ao realizar logout');
    }
  };

  // Carregar usuário inicial e configurar listener de autenticação
  useEffect(() => {
    // Função para carregar usuário e configurar refresh
    const loadUserAndSetupRefresh = async () => {
      console.log("[AUTH] Iniciando carregamento do usuário e configuração de refresh...");
      
      // Carregar usuário atual
      await refreshUser();
      
      // Configurar refresh automático de token
      console.log("[AUTH] Configurando refresh automático de token...");
      const cleanup = await setupSessionRefresh();
      cleanupRef.current = cleanup;
      
      // Configurar listener de alterações na autenticação
      console.log("[AUTH] Configurando listener de autenticação...");
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log(`[AUTH] Evento de autenticação: ${event}, session exists: ${!!session}`);
          
          if (event === 'SIGNED_IN' && session) {
            console.log("[AUTH] Usuário conectado:", { id: session.user.id, email: session.user.email });
            setUser(session.user);
            setError(null);
          } else if (event === 'SIGNED_OUT') {
            console.log("[AUTH] Usuário desconectado");
            setUser(null);
          } else if (event === 'USER_UPDATED' && session) {
            console.log("[AUTH] Usuário atualizado:", { id: session.user.id });
            setUser(session.user);
          } else if (event === 'TOKEN_REFRESHED' && session) {
            console.log("[AUTH] Token atualizado");
            setUser(session.user);
          }
        }
      );
      
      // Atualizar loading ao final
      console.log("[AUTH] Configuração inicial concluída");
      setLoading(false);
      
      // Limpar listener ao desmontar
      return () => {
        console.log("[AUTH] Desmontando provider, limpando listeners");
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