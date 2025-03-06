import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/app/lib/supabase/admin'

export async function GET() {
  try {
    // Buscar perfil de teste
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('username', 'teste')
      .single()

    if (profileError) throw profileError

    // Buscar rotinas do usuário
    const { data: routines, error: routinesError } = await supabaseAdmin
      .from('daily_routines')
      .select('*')
      .eq('user_id', profile.id)

    if (routinesError) throw routinesError

    // Buscar medicamentos do usuário
    const { data: medications, error: medicationsError } = await supabaseAdmin
      .from('medications')
      .select('*')
      .eq('user_id', profile.id)

    if (medicationsError) throw medicationsError

    return NextResponse.json({
      message: 'Dados recuperados com sucesso',
      data: {
        profile,
        routines,
        medications
      }
    })
  } catch (error) {
    console.error('Erro ao recuperar dados:', error)
    return NextResponse.json(
      {
        message: 'Erro ao recuperar dados',
        error
      },
      { status: 500 }
    )
  }
} 