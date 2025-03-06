import { useSupabase } from './useSupabase'
import { useCallback, useEffect, useState } from 'react'
import { Database } from '../types/database'

type Medication = Database['public']['Tables']['medications']['Row']
type MedicationInsert = Database['public']['Tables']['medications']['Insert']
type MedicationUpdate = Database['public']['Tables']['medications']['Update']
type MedicationLog = Database['public']['Tables']['medication_logs']['Row']

export function useMedications() {
  const { supabase, user } = useSupabase()
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar medicamentos
  const fetchMedications = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('name')

      if (error) throw error

      setMedications(data || [])
    } catch (err) {
      setError('Erro ao carregar medicamentos')
      console.error('Erro ao carregar medicamentos:', err)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  // Adicionar medicamento
  const addMedication = async (medication: Omit<MedicationInsert, 'user_id'>) => {
    if (!user) return { error: new Error('Usuário não autenticado') }

    try {
      setError(null)
      const { data, error } = await supabase
        .from('medications')
        .insert([{ ...medication, user_id: user.id }])
        .select()
        .single()

      if (error) throw error

      setMedications(prev => [...prev, data])
      return { data }
    } catch (err) {
      const message = 'Erro ao adicionar medicamento'
      setError(message)
      console.error(message, err)
      return { error: err as Error }
    }
  }

  // Atualizar medicamento
  const updateMedication = async (id: string, updates: MedicationUpdate) => {
    try {
      setError(null)
      const { data, error } = await supabase
        .from('medications')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setMedications(prev => prev.map(medication => 
        medication.id === id ? data : medication
      ))
      return { data }
    } catch (err) {
      const message = 'Erro ao atualizar medicamento'
      setError(message)
      console.error(message, err)
      return { error: err as Error }
    }
  }

  // Registrar medicamento tomado
  const logMedication = async (medicationId: string, notes?: string) => {
    try {
      setError(null)
      const { data, error } = await supabase
        .from('medication_logs')
        .insert([{
          medication_id: medicationId,
          notes
        }])
        .select()
        .single()

      if (error) throw error

      return { data }
    } catch (err) {
      const message = 'Erro ao registrar medicamento'
      setError(message)
      console.error(message, err)
      return { error: err as Error }
    }
  }

  // Obter registros de medicamentos para um período
  const getLogs = async (startDate: Date, endDate: Date) => {
    try {
      setError(null)
      const { data, error } = await supabase
        .from('medication_logs')
        .select(`
          *,
          medications (*)
        `)
        .gte('taken_at', startDate.toISOString())
        .lte('taken_at', endDate.toISOString())
        .order('taken_at', { ascending: false })

      if (error) throw error

      return { data: data as (MedicationLog & { medications: Medication })[] }
    } catch (err) {
      const message = 'Erro ao carregar registros'
      setError(message)
      console.error(message, err)
      return { error: err as Error }
    }
  }

  // Desativar medicamento (soft delete)
  const deactivateMedication = async (id: string) => {
    return updateMedication(id, { is_active: false })
  }

  // Obter próximos horários de medicamentos
  const getUpcomingMedications = () => {
    const now = new Date()
    const currentTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

    return medications
      .filter(med => med.time_of_day?.some(time => time > currentTime))
      .map(med => ({
        ...med,
        nextTime: med.time_of_day?.find(time => time > currentTime)
      }))
      .sort((a, b) => (a.nextTime || '') > (b.nextTime || '') ? 1 : -1)
  }

  // Carregar medicamentos ao montar o componente ou quando o usuário mudar
  useEffect(() => {
    fetchMedications()
  }, [fetchMedications])

  return {
    medications,
    loading,
    error,
    addMedication,
    updateMedication,
    deactivateMedication,
    logMedication,
    getLogs,
    getUpcomingMedications,
    refreshMedications: fetchMedications
  }
}
