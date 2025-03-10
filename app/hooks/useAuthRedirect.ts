"use client";

import { useAuth } from '@/app/providers/AuthProvider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { isAuthRoute } from '../lib/auth';

/**
 * Hook para redirecionamento baseado em autenticação
 * 
 * Redireciona para:
 * - Login: quando não autenticado e tentando acessar páginas protegidas
 * - Dashboard: quando autenticado e tentando acessar páginas de auth
 */
export function useAuthRedirect() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const redirectedRef = useRef(false);
  
  useEffect(() => {
    // Não faz nada enquanto estiver carregando
    if (loading) return;
    
    // Evita múltiplos redirecionamentos
    if (redirectedRef.current) return;
    
    const isAuth = !!session;
    const isAuthPath = isAuthRoute(pathname || '');
    
    // Se está autenticado mas está em uma rota de auth, redireciona para dashboard
    if (isAuth && isAuthPath) {
      redirectedRef.current = true;
      router.replace('/');
      return;
    }
    
    // Se não está autenticado e não está em uma rota de auth, redireciona para login
    if (!isAuth && !isAuthPath) {
      redirectedRef.current = true;
      router.replace('/login');
      return;
    }
  }, [session, loading, pathname, router]);
  
  return { session, loading };
} 