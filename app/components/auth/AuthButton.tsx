'use client'

import { useSupabase } from '@/app/hooks/useSupabase'
import { Github, LogOut, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

function AuthButtonBase({
  onClick,
  icon,
  children,
  ariaLabel,
  loading,
  disabled,
  provider,
}: {
  onClick?: () => Promise<void>
  icon?: React.ReactNode
  children: React.ReactNode
  ariaLabel: string
  loading?: boolean
  disabled?: boolean
  provider?: 'github' | 'google'
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <button
      onClick={async (e) => {
        e.preventDefault()
        if (onClick) {
          try {
            await onClick()
          } catch (error) {
            console.error('Erro na autenticação:', error)
          }
        }
      }}
      disabled={loading || disabled}
      className={`
        relative flex items-center justify-center gap-2 px-4 py-2
        text-sm font-medium rounded-lg transition-all duration-200
        bg-white border border-perfil-border
        text-perfil-primary hover:text-perfil-hover
        hover:bg-perfil-light/20 focus:outline-none
        focus:ring-2 focus:ring-perfil-focus focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${loading ? 'animate-pulse' : ''}
        ${isHovered ? 'scale-[1.02] shadow-md' : ''}
        ${provider === 'github' ? 'hover:bg-[#24292e]/10' : ''}
        ${provider === 'google' ? 'hover:bg-[#4285f4]/10' : ''}
      `}
      aria-label={ariaLabel}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
    >
      <span className="flex items-center gap-2">
        {icon}
        {children}
      </span>
    </button>
  )
}

function AuthError({ message }: { message: string }) {
  return (
    <div 
      className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg mt-2 border border-red-100 animate-fadeIn"
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span className="leading-relaxed">{message}</span>
    </div>
  )
}

export function AuthButton() {
  const { user, signIn, signOut, loading } = useSupabase()
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async (provider: 'github' | 'google') => {
    try {
      setError(null)
      const { error } = await signIn(provider)
      if (error) {
        setError('Ocorreu um erro durante a autenticação. Por favor, tente novamente.')
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado. Por favor, tente novamente.')
    }
  }

  const handleSignOut = async () => {
    try {
      setError(null)
      const { error } = await signOut()
      if (error) {
        setError('Ocorreu um erro ao sair. Por favor, tente novamente.')
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado. Por favor, tente novamente.')
    }
  }

  if (loading) {
    return (
      <div 
        className="space-y-2"
        role="status"
        aria-label="Carregando autenticação"
      >
        <AuthButtonBase 
          loading 
          ariaLabel="Carregando..." 
          disabled
        >
          <span className="inline-flex items-center">
            <svg 
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-perfil-primary" 
              fill="none" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Carregando...</span>
          </span>
        </AuthButtonBase>
      </div>
    )
  }

  if (user) {
    return (
      <div className="space-y-2">
        <AuthButtonBase
          onClick={handleSignOut}
          icon={<LogOut className="h-4 w-4" />}
          ariaLabel="Sair da conta"
        >
          Sair
        </AuthButtonBase>
        {error && <AuthError message={error} />}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div 
        className="flex flex-col sm:flex-row gap-3"
        role="group"
        aria-label="Opções de login"
      >
        <AuthButtonBase
          onClick={() => handleSignIn('github')}
          icon={<Github className="h-4 w-4" aria-hidden="true" />}
          ariaLabel="Entrar com GitHub"
          disabled={loading}
          provider="github"
        >
          Continuar com GitHub
        </AuthButtonBase>

        <AuthButtonBase
          onClick={() => handleSignIn('google')}
          icon={
            <Image
              src="/google-icon.svg"
              alt=""
              width={16}
              height={16}
              className="opacity-90"
              aria-hidden="true"
              priority
            />
          }
          ariaLabel="Entrar com Google"
          disabled={loading}
          provider="google"
        >
          Continuar com Google
        </AuthButtonBase>
      </div>
      {error && <AuthError message={error} />}
    </div>
  )
}
