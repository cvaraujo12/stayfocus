import { useAuth } from '@/app/providers/AuthProvider';
import { Header } from './Header';
import { Footer } from './Footer';
import { SyncStatus } from '../SyncStatus';
import { Sidebar } from './Sidebar';

interface PainelLayoutProps {
  children: React.ReactNode;
}

export function PainelLayout({ children }: PainelLayoutProps) {
  const { session, loading } = useAuth();

  // Mostra loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redireciona se não estiver autenticado
  if (!session) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Acesso Restrito
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Você precisa estar logado para acessar esta área
        </p>
        <a
          href="/login"
          className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Fazer Login
        </a>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4">
          {children}
          <Footer />
        </main>
        <SyncStatus />
      </div>
    </div>
  );
} 