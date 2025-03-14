'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn, signInWithGitHub, signInWithGoogle } from '@/supabase/auth';
import { LogIn } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabase } from '@/supabase/client';
import { redirectToDashboard } from './redirect';

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Função para lidar com o login com email e senha
  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage('Autenticando...');

    try {
      const { success, message } = await signIn(email, password);
      
      if (success) {
        setMessage('Login realizado com sucesso!');
        await refreshUser(); // Atualiza o estado do usuário
        
        // Pequeno delay para garantir que o estado foi atualizado
        setTimeout(() => {
          redirectToDashboard();
        }, 500);
      } else {
        setError(message || 'Erro ao realizar login');
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      console.error('Erro no login:', err);
      setError('Ocorreu um erro ao tentar fazer login');
      setEmail('');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para lidar com o login com GitHub
  const handleGitHubLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await signInWithGitHub();
      
      if (!result.success) {
        setError(result.message);
      }
      // Não precisa redirecionar aqui, pois o OAuth fará isso automaticamente
    } catch (error) {
      setError('Erro ao fazer login com GitHub. Tente novamente.');
      console.error('Erro no login com GitHub:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para lidar com o login com Google
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await signInWithGoogle();
      
      if (!result.success) {
        setError(result.message);
      }
      // Não precisa redirecionar aqui, pois o OAuth fará isso automaticamente
    } catch (error) {
      setError('Erro ao fazer login com Google. Tente novamente.');
      console.error('Erro no login com Google:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
            StayFocus
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Faça login para acessar sua conta
          </p>
        </div>

        <div className="mt-8 space-y-6 bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded">
              {error}
            </div>
          )}
          
          {message && (
            <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-3 rounded">
              {message}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleEmailLogin} method="POST">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Senha
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <LogIn className="w-4 h-4" />
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
          </form>

          <div className="text-center">
            <a href="#" className="text-sm text-primary hover:text-primary/90">
              Esqueceu sua senha?
            </a>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Não tem uma conta?{' '}
            </span>
            <Link href="/signup" className="text-primary hover:text-primary/90">
              Registre-se
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 