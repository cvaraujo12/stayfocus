import { useSupabase } from './useSupabase'
import { useCallback, useEffect, useState } from 'react'
import { Database } from '../types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export function useProfile() {
  const { supabase, user } = useSupabase()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar perfil
  const fetchProfile = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      setProfile(data)
    } catch (err) {
      setError('Erro ao carregar perfil')
      console.error('Erro ao carregar perfil:', err)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  // Atualizar perfil
  const updateProfile = async (updates: ProfileUpdate) => {
    if (!user) return { error: new Error('Usuário não autenticado') }

    try {
      setError(null)
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      return { data }
    } catch (err) {
      const message = 'Erro ao atualizar perfil'
      setError(message)
      console.error(message, err)
      return { error: err as Error }
    }
  }

  // Atualizar preferências
  const updatePreferences = async (preferences: Record<string, any>) => {
    if (!profile) return { error: new Error('Perfil não encontrado') }

    const currentPreferences = profile.preferences as Record<string, any> || {}
    const updatedPreferences = { ...currentPreferences, ...preferences }

    return updateProfile({ preferences: updatedPreferences })
  }

  // Carregar perfil ao montar o componente ou quando o usuário mudar
  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return {
    profile,
    loading,
    error,
    updateProfile,
    updatePreferences,
    refreshProfile: fetchProfile
  }
}
