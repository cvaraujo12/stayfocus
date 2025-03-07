'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/supabase/client';

type AuthStatus = 'loading' | 'success' | 'error';

interface AuthState {
  status: AuthStatus;
  message: string;
  details?: string;
}

/**
 * Página de callback para autenticação OAuth
 * Esta página é chamada após o login com provedores como GitHub e Google
 */
export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authState, setAuthState] = useState<AuthState>({
    status: 'loading',
    message: 'Processando autenticação...'
  });

  useEffect(() => {
    // Processa o callback de autenticação
    const handleAuthCallback = async () => {
      try {
        // Obtém os parâmetros da URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = searchParams;
        
        // Verifica se há um código de erro na URL
        const error = hashParams.get('error') || queryParams.get('error');
        const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');
        
        if (error) {
          console.error('Erro na autenticação:', error, errorDescription);
          setAuthState({
            status: 'error',
            message: 'Erro na autenticação',
            details: errorDescription || error
          });
          
          // Redireciona para a página de login após alguns segundos
          setTimeout(() => {
            router.push(`/login?error=${encodeURIComponent(errorDescription || error)}`);
          }, 2000);
          
          return;
        }

        // Verifica se há um código de acesso na URL (para OAuth)
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        // Se tiver tokens na URL, configura a sessão
        if (accessToken && refreshToken) {
          setAuthState({
            status: 'loading',
            message: 'Configurando sessão...'
          });
          
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (sessionError) {
            throw sessionError;
          }
        }

        // Obtém a sessão atual
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Verifica se há um redirecionamento específico
          const redirectTo = queryParams.get('redirect_to') || '/';
          
          setAuthState({
            status: 'success',
            message: 'Autenticação realizada com sucesso!',
            details: 'Você será redirecionado em instantes...'
          });
          
          // Redireciona para a página especificada ou para a página inicial
          setTimeout(() => {
            router.push(redirectTo);
          }, 1000);
        } else {
          // Se não houver sessão, algo deu errado
          setAuthState({
            status: 'error',
            message: 'Falha na autenticação',
            details: 'Não foi possível completar a autenticação. Tente novamente.'
          });
          
          // Redireciona para a página de login após alguns segundos
          setTimeout(() => {
            router.push('/login?error=session_not_found');
          }, 2000);
        }
      } catch (error) {
        console.error('Erro ao processar callback de autenticação:', error);
        setAuthState({
          status: 'error',
          message: 'Erro ao processar autenticação',
          details: 'Ocorreu um erro inesperado. Tente novamente.'
        });
        
        // Redireciona para a página de login após alguns segundos
        setTimeout(() => {
          router.push('/login?error=callback_error');
        }, 2000);
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className={`text-2xl font-bold text-center mb-4 ${
          authState.status === 'error' ? 'text-red-600' :
          authState.status === 'success' ? 'text-green-600' :
          'text-gray-900'
        }`}>
          {authState.status === 'loading' && 'Autenticando...'}
          {authState.status === 'success' && 'Autenticação Concluída'}
          {authState.status === 'error' && 'Erro na Autenticação'}
        </h1>
        
        <div className="flex justify-center mb-4">
          {authState.status === 'loading' && (
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          )}
          
          {authState.status === 'success' && (
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          
          {authState.status === 'error' && (
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>
        
        <div className="text-center space-y-2">
          <p className={`font-medium ${
            authState.status === 'error' ? 'text-red-600' :
            authState.status === 'success' ? 'text-green-600' :
            'text-gray-900'
          }`}>
            {authState.message}
          </p>
          
          {authState.details && (
            <p className="text-sm text-gray-600">
              {authState.details}
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 