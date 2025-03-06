import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'As variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórias.'
  )
}

const isClient = typeof window !== 'undefined'
const isProd = process.env.NODE_ENV === 'production'

// Função auxiliar para lidar com cookies de forma segura
const handleCookies = {
  get: (name: string): string => {
    if (!isClient) return ''
    try {
      return document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${name}=`))
        ?.split('=')[1] || ''
    } catch (error) {
      console.warn(`Erro ao ler cookie ${name}:`, error)
      return ''
    }
  },
  set: (name: string, value: string, options: { maxAge?: number; path?: string }): void => {
    if (!isClient) return
    try {
      let cookie = `${name}=${value}`
      if (options.maxAge) cookie += `; Max-Age=${options.maxAge}`
      if (options.path) cookie += `; Path=${options.path}`
      cookie += `; SameSite=Lax`
      if (isProd) cookie += `; Secure`
      document.cookie = cookie
    } catch (error) {
      console.warn(`Erro ao definir cookie ${name}:`, error)
    }
  },
  remove: (name: string, options?: { path?: string }): void => {
    if (!isClient) return
    try {
      let cookie = `${name}=; Max-Age=0`
      if (options?.path) cookie += `; Path=${options.path}`
      cookie += `; SameSite=Lax`
      if (isProd) cookie += `; Secure`
      document.cookie = cookie
    } catch (error) {
      console.warn(`Erro ao remover cookie ${name}:`, error)
    }
  }
}

export const createClient = () => {
  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get: handleCookies.get,
        set: handleCookies.set,
        remove: handleCookies.remove
      },
      auth: {
        persistSession: true,
        storageKey: 'sb-auth-token',
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        debug: process.env.NODE_ENV === 'development'
      }
    }
  )
}