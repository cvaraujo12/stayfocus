'use client'

import { AuthButton } from '@/app/components/auth/AuthButton'

import { useSupabase } from '@/app/hooks/useSupabase'

export default function LoginPage() {
  const { status, loading } = useSupabase()

  return (
    <main 
      className="min-h-screen flex items-center justify-center p-4 bg-perfil-light/50 transition-colors duration-300"
      role="main"
      aria-labelledby="login-title"
      aria-busy={loading || status === 'authenticating'}
    >
      <div 
        className={`w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-sm border border-perfil-light transition-all duration-300 ${(loading || status === 'authenticating') ? 'opacity-75 scale-[0.99]' : 'opacity-100 scale-100'}`}
        aria-live="polite"
      >
        <div className="flex flex-col items-center space-y-4">
          <h1 
            id="login-title"
            className="text-2xl font-semibold text-center text-perfil-primary focus:outline-none focus:ring-2 focus:ring-perfil-primary focus:ring-offset-2 rounded-lg p-2"
            tabIndex={0}
          >
            Bem-vindo ao Painel ND
          </h1>
          <p 
            className="text-center text-perfil-secondary max-w-sm mx-auto leading-relaxed"
            aria-label="Descrição do Painel ND"
          >
            Um espaço seguro e organizado para seu desenvolvimento pessoal, com foco em simplicidade e bem-estar
          </p>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-perfil-light" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-perfil-secondary font-medium">
                Entrar com
              </span>
            </div>
          </div>

          <div 
            className="flex justify-center gap-4"
            role="group"
            aria-label="Opções de login"
          >
            <AuthButton />
          </div>
        </div>

        <p 
          className="text-xs text-center text-perfil-secondary max-w-sm mx-auto mt-8 leading-relaxed"
          role="contentinfo"
        >
          Ao continuar, você concorda com nossos{' '}
          <a 
            href="#" 
            className="text-perfil-primary hover:text-perfil-secondary underline transition-colors focus:outline-none focus:ring-2 focus:ring-perfil-primary focus:ring-offset-2 rounded"
            aria-label="Ler os Termos de Serviço (abre em nova janela)"
            target="_blank"
            rel="noopener noreferrer"
          >
            Termos de Serviço
          </a>{' '}
          e{' '}
          <a 
            href="#" 
            className="text-perfil-primary hover:text-perfil-secondary underline transition-colors focus:outline-none focus:ring-2 focus:ring-perfil-primary focus:ring-offset-2 rounded"
            aria-label="Ler a Política de Privacidade (abre em nova janela)"
            target="_blank"
            rel="noopener noreferrer"
          >
            Política de Privacidade
          </a>
          .
        </p>
      </div>
    </main>
  )
}
