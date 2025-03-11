"use client";

import { useAuth } from '@/app/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PainelLayout } from './components/layout/PainelLayout';
import { wasRecentlyRedirected } from './login/redirect';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [recentRedirect, setRecentRedirect] = useState<boolean | null>(null);
  
  // Verificar se houve redirecionamento recente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const wasRedirected = wasRecentlyRedirected();
      setRecentRedirect(wasRedirected);
      console.log("[HOME] Verificação de redirecionamento recente:", wasRedirected);
    }
  }, []);
  
  useEffect(() => {
    console.log("[HOME] Estado de autenticação na página inicial:", { 
      userExists: !!user, 
      userId: user?.id, 
      loading,
      userEmail: user?.email,
      recentRedirect
    });
    
    if (!loading && !user) {
      // Se não houve redirecionamento recente, redirecionar para login
      if (!recentRedirect) {
        console.log("[HOME] Usuário não autenticado, redirecionando para /login");
        window.location.href = '/login';
      } else {
        console.log("[HOME] Detectado possível loop de redirecionamento, aguardando...");
        // Limpar flag de redirecionamento recente para evitar loop
        sessionStorage.removeItem('auth_redirect');
      }
    } else if (!loading && user) {
      console.log("[HOME] Usuário autenticado:", { 
        id: user.id, 
        email: user.email 
      });
      // Limpar flag de redirecionamento ao carregar página com usuário válido
      sessionStorage.removeItem('auth_redirect');
    }
  }, [loading, user, router, recentRedirect]);
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando seu painel...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Verificando autenticação...</p>
          {recentRedirect && (
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
              Aguarde enquanto verificamos seus dados de acesso...
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <PainelLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Dashboard
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Tarefas Pendentes
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Você tem 0 tarefas pendentes para hoje
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Próximos Blocos de Tempo
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Nenhum bloco de tempo programado
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Humor
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Registre como você está se sentindo hoje
            </p>
          </div>
        </div>
      </div>
    </PainelLayout>
  )
}
