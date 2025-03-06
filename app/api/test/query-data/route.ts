import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/app/lib/supabase/admin'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.rpc('query_test_data')

    if (error) throw error

    return NextResponse.json({
      message: 'Dados recuperados com sucesso',
      data: data[0].result
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