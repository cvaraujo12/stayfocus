import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Verificando a sessão
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const hasSession = !!session;
  
  // Rotas públicas que não requerem autenticação
  const publicRoutes = ['/login', '/signup', '/recuperar-senha']
  const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route))
  const isHomeRoute = req.nextUrl.pathname === '/'

  console.log(`[MIDDLEWARE] URL=${req.nextUrl.pathname}, Sessão=${hasSession}, Rota pública=${isPublicRoute}, Home=${isHomeRoute}`);
  
  if (session) {
    console.log(`[MIDDLEWARE] Usuário autenticado (ID: ${session.user.id.slice(0, 8)}...)`);
    
    // Verificar se a sessão tem um token válido
    if (session.access_token) {
      console.log(`[MIDDLEWARE] Token de acesso presente e válido`);
    } else {
      console.log(`[MIDDLEWARE] Alerta: Token de acesso ausente ou inválido`);
    }
  }

  // Se não estiver autenticado e tentar acessar uma rota protegida
  if (!hasSession && !isPublicRoute) {
    console.log('[MIDDLEWARE] Redirecionando para /login (usuário não autenticado)');
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Se estiver autenticado e tentar acessar uma rota pública
  if (hasSession && isPublicRoute) {
    console.log('[MIDDLEWARE] Redirecionando para / (usuário já autenticado)');
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Permitir a continuação normal da requisição
  console.log(`[MIDDLEWARE] Permitindo acesso à rota solicitada: ${req.nextUrl.pathname}`);
  return res
}

// Configurar quais rotas o middleware deve ser executado
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|_vercel).*)'],
} 