import { createServiceUser } from '@/app/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const { user, error } = await createServiceUser()

    if (error) {
      console.error('Erro ao criar usuário de serviço:', error)
      return NextResponse.json(
        { error: 'Erro ao criar usuário de serviço' },
        { status: 500 }
      )
    }

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('Erro na rota de criação de usuário de serviço:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 