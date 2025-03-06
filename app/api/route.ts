import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'API está funcionando!' })
}

export const dynamic = 'force-dynamic' 