"use client";

import { useAuth } from '@/app/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PainelLayout } from './components/layout/PainelLayout';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    console.log("Estado de autenticação na página inicial:", { user, loading });
    if (!loading && !user) {
      console.log("Usuário não autenticado, redirecionando para /login");
      router.push('/login');
    } else if (!loading && user) {
      console.log("Usuário autenticado:", user);
    }
  }, [loading, user, router]);
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return null;
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
