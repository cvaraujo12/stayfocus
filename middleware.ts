import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Rotas públicas que não requerem autenticação
  const publicRoutes = ['/login', '/signup', '/recuperar-senha']
  const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route))

  console.log(`Middleware: URL=${req.nextUrl.pathname}, Sessão=${!!session}, Rota pública=${isPublicRoute}`);

  // Se não estiver autenticado e tentar acessar uma rota protegida
  if (!session && !isPublicRoute) {
    console.log('Middleware: Redirecionando para /login (usuário não autenticado)');
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Se estiver autenticado e tentar acessar uma rota pública
  if (session && isPublicRoute) {
    console.log('Middleware: Redirecionando para / (usuário já autenticado)');
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

// Configurar quais rotas o middleware deve ser executado
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
} 