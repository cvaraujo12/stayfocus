import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Rotas que não requerem autenticação
const publicRoutes = ['/auth/login', '/auth/callback']

// Verifica se a rota atual é pública
const isPublicRoute = (pathname: string) => {
  return publicRoutes.some(route => pathname.startsWith(route))
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Garantir que os cookies são seguros em produção
          if (process.env.NODE_ENV === 'production') {
            options.secure = true
          }
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          // Garantir que os cookies são seguros em produção
          if (process.env.NODE_ENV === 'production') {
            options.secure = true
          }
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const pathname = request.nextUrl.pathname

  // Se o usuário não estiver autenticado
  if (!session) {
    // Em rotas protegidas, redireciona para login
    if (!isPublicRoute(pathname)) {
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  } else {
    // Se estiver autenticado e tentar acessar páginas de auth
    if (pathname.startsWith('/auth')) {
      // Verifica se há uma URL de redirecionamento
      const nextUrl = request.nextUrl.searchParams.get('next')
      if (nextUrl && !nextUrl.startsWith('/auth')) {
        return NextResponse.redirect(new URL(nextUrl, request.url))
      }
      // Se não houver, redireciona para home
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api|.*\..*).*)'
  ]
}