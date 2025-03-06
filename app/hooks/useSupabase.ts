import { createClient } from '@/app/lib/supabase/client'
import { useCallback, useEffect, useState } from 'react'
import { AuthError, SupabaseClient, User } from '@supabase/supabase-js'

type AuthState = {
  user: User | null
  loading: boolean
  error: AuthError | null
  status: 'idle' | 'authenticating' | 'authenticated' | 'error'
}

export function useSupabase() {
  const [supabase] = useState(() => createClient())
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    status: 'idle'
  })

  // Atualizar estado da autenticação
  const updateAuthState = useCallback(({
    user = authState.user,
    loading = false,
    error = null,
    status = authState.status
  }: Partial<AuthState>) => {
    setAuthState({
      user,
      loading,
      error,
      status
    })
  }, [authState.user])

  // Verificar sessão atual
  const checkSession = useCallback(async () => {
    try {
      updateAuthState({ loading: true, status: 'authenticating', error: null })
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) throw error
      updateAuthState({ 
        user, 
        status: user ? 'authenticated' : 'idle',
        loading: false,
        error: null
      })
    } catch (error) {
      updateAuthState({ error: error as AuthError, status: 'error' })
    }
  }, [supabase.auth, updateAuthState])

  // Escutar mudanças na autenticação
  useEffect(() => {
    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        updateAuthState({
          user: session?.user ?? null,
          loading: false,
          status: session?.user ? 'authenticated' : 'idle'
        })

        // Se o usuário acabou de se autenticar, atualizar o perfil
        if (event === 'SIGNED_IN') {
          await checkSession()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth, checkSession, updateAuthState])

  // Login com provedor OAuth
  const signIn = async (provider: 'google' | 'github') => {
    try {
      updateAuthState({ 
        loading: true, 
        error: null,
        status: 'authenticating',
        user: null
      })
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })

      if (error) throw error
      return { data }
    } catch (error) {
      const authError = error as AuthError
      updateAuthState({ 
        error: authError, 
        status: 'error',
        loading: false,
        user: null
      })
      return { error: authError }
    } finally {
      if (!authState.error) {
        updateAuthState({ 
          loading: false, 
          status: authState.user ? 'authenticated' : 'idle',
          error: null
        })
      }
    }
  }

  // Logout
  const signOut = async () => {
    try {
      updateAuthState({ 
        loading: true, 
        error: null,
        status: 'authenticating',
        user: null
      })
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error
      return { data: true }
    } catch (error) {
      const authError = error as AuthError
      updateAuthState({ 
        error: authError, 
        status: 'error',
        loading: false,
        user: null
      })
      return { error: authError }
    } finally {
      if (!authState.error) {
        updateAuthState({ 
          loading: false, 
          status: authState.user ? 'authenticated' : 'idle',
          error: null
        })
      }
    }
  }

  // Obter token de acesso atual
  const getAccessToken = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return { data: session?.access_token }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  return {
    supabase,
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    status: authState.status,
    signIn,
    signOut,
    getAccessToken,
    refreshSession: checkSession,
    isAuthenticated: !!authState.user
  }
}