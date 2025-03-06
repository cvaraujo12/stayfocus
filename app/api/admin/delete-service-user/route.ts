import { NextResponse } from 'next/server'
import { deleteServiceUser } from '@/app/lib/supabase/admin'

export async function POST() {
  try {
    const result = await deleteServiceUser()
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Usuário de serviço deletado com sucesso' },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 