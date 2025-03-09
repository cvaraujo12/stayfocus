'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn, signInWithGitHub, signInWithGoogle } from '@/supabase/auth';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Função para lidar com o login com email e senha
  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const result = await signIn(email, password);
      
      if (result.success) {
        setMessage('Login realizado com sucesso!');
        // Redireciona para a página inicial após login bem-sucedido
        setTimeout(() => router.push('/'), 1000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Erro ao fazer login. Tente novamente.');
      console.error('Erro no login:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para lidar com o login com GitHub
  const handleGitHubLogin = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  // Função para lidar com o login com Google
  const handleGoogleLogin = async () => {
    setLoading(true);
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
      setLoading(false);
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
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <LogIn className="w-4 h-4" />
                {loading ? 'Entrando...' : 'Entrar'}
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