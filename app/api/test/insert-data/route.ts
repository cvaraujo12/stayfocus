import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/app/lib/supabase/admin'

export async function POST() {
  try {
    // Criar usuário no auth com um email único
    const timestamp = new Date().getTime()
    const email = `teste${timestamp}@stayfocus.app`
    
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: 'Teste@2024!',
      email_confirm: true
    })

    if (authError) throw authError

    // Inserir um perfil de teste
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authUser.user.id,
        username: `teste${timestamp}`,
        full_name: 'Usuário de Teste'
      })
      .select()
      .single()

    if (profileError) throw profileError

    // Inserir uma rotina de teste
    const { data: routine, error: routineError } = await supabaseAdmin
      .from('daily_routines')
      .insert({
        user_id: profile.id,
        title: 'Rotina de Teste',
        description: 'Uma rotina para testar a inserção de dados',
        start_time: '08:00:00',
        duration_minutes: 30
      })
      .select()
      .single()

    if (routineError) throw routineError

    // Inserir um medicamento de teste
    const { data: medication, error: medicationError } = await supabaseAdmin
      .from('medications')
      .insert({
        user_id: profile.id,
        name: 'Medicamento de Teste',
        dosage: '10mg',
        frequency: 'Diário',
        time_of_day: ['08:00:00', '20:00:00']
      })
      .select()
      .single()

    if (medicationError) throw medicationError

    return NextResponse.json({
      message: 'Dados de teste inseridos com sucesso',
      data: {
        authUser: authUser.user,
        profile,
        routine,
        medication
      }
    })
  } catch (error) {
    console.error('Erro ao inserir dados de teste:', error)
    return NextResponse.json(
      {
        message: 'Erro ao inserir dados de teste',
        error
      },
      { status: 500 }
    )
  }
} 