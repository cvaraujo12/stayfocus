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
 * - Página inicial: quando autenticado e tentando acessar páginas de auth
 */
export function useAuthRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const redirectedRef = useRef(false);
  
  useEffect(() => {
    // Evitar redirecionamentos adicionais
    if (redirectedRef.current) return;
    
    // Só faz o redirecionamento quando terminamos de verificar o estado de autenticação
    if (!loading) {
      const isAuth = !!user;
      const isAuthPath = isAuthRoute(pathname || '');
      
      // Se está autenticado mas está em uma rota de auth, redireciona para página inicial
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
    }
  }, [loading, user, pathname, router]);
  
  return { user, loading };
} 