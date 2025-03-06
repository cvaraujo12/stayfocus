import { useSupabase } from './useSupabase'
import { useCallback, useEffect, useState } from 'react'
import { Database } from '../types/database'

type DailyRoutine = Database['public']['Tables']['daily_routines']['Row']
type DailyRoutineInsert = Database['public']['Tables']['daily_routines']['Insert']
type DailyRoutineUpdate = Database['public']['Tables']['daily_routines']['Update']
type RoutineCompletion = Database['public']['Tables']['routine_completions']['Row']

export function useRoutines() {
  const { supabase, user } = useSupabase()
  const [routines, setRoutines] = useState<DailyRoutine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar rotinas
  const fetchRoutines = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('daily_routines')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('start_time', { ascending: true })

      if (error) throw error

      setRoutines(data || [])
    } catch (err) {
      setError('Erro ao carregar rotinas')
      console.error('Erro ao carregar rotinas:', err)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  // Adicionar rotina
  const addRoutine = async (routine: Omit<DailyRoutineInsert, 'user_id'>) => {
    if (!user) return { error: new Error('Usuário não autenticado') }

    try {
      setError(null)
      const { data, error } = await supabase
        .from('daily_routines')
        .insert([{ ...routine, user_id: user.id }])
        .select()
        .single()

      if (error) throw error

      setRoutines(prev => [...prev, data])
      return { data }
    } catch (err) {
      const message = 'Erro ao adicionar rotina'
      setError(message)
      console.error(message, err)
      return { error: err as Error }
    }
  }

  // Atualizar rotina
  const updateRoutine = async (id: string, updates: DailyRoutineUpdate) => {
    try {
      setError(null)
      const { data, error } = await supabase
        .from('daily_routines')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setRoutines(prev => prev.map(routine => 
        routine.id === id ? data : routine
      ))
      return { data }
    } catch (err) {
      const message = 'Erro ao atualizar rotina'
      setError(message)
      console.error(message, err)
      return { error: err as Error }
    }
  }

  // Marcar rotina como concluída
  const completeRoutine = async (routineId: string, notes?: string) => {
    try {
      setError(null)
      const { data, error } = await supabase
        .from('routine_completions')
        .insert([{
          routine_id: routineId,
          notes
        }])
        .select()
        .single()

      if (error) throw error

      return { data }
    } catch (err) {
      const message = 'Erro ao marcar rotina como concluída'
      setError(message)
      console.error(message, err)
      return { error: err as Error }
    }
  }

  // Obter conclusões de rotina para um período
  const getCompletions = async (startDate: Date, endDate: Date) => {
    try {
      setError(null)
      const { data, error } = await supabase
        .from('routine_completions')
        .select(`
          *,
          daily_routines (*)
        `)
        .gte('completed_at', startDate.toISOString())
        .lte('completed_at', endDate.toISOString())
        .order('completed_at', { ascending: false })

      if (error) throw error

      return { data: data as (RoutineCompletion & { daily_routines: DailyRoutine })[] }
    } catch (err) {
      const message = 'Erro ao carregar conclusões'
      setError(message)
      console.error(message, err)
      return { error: err as Error }
    }
  }

  // Desativar rotina (soft delete)
  const deactivateRoutine = async (id: string) => {
    return updateRoutine(id, { is_active: false })
  }

  // Carregar rotinas ao montar o componente ou quando o usuário mudar
  useEffect(() => {
    fetchRoutines()
  }, [fetchRoutines])

  return {
    routines,
    loading,
    error,
    addRoutine,
    updateRoutine,
    deactivateRoutine,
    completeRoutine,
    getCompletions,
    refreshRoutines: fetchRoutines
  }
}
