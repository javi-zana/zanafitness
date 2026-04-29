import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Paths that require login only
  const authPaths = ['/profile', '/onboarding']
  // Paths that require login AND active subscription
  const memberPaths = ['/dashboard', '/workout', '/nutrition', '/progress', '/guidance', '/stats', '/program', '/messages', '/community', '/schedule', '/coach']

  const needsAuth = authPaths.some(p => pathname.startsWith(p))
  const needsMembership = memberPaths.some(p => pathname.startsWith(p))

  // Not logged in → /login
  if (!user && (needsAuth || needsMembership)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Coaches always get through
  const COACH_EMAILS = ['me@javilorenzana.com', 'bea.ongg@gmail.com']
  const isCoach = COACH_EMAILS.includes(user?.email ?? '')

  // Logged in but needs active subscription → check profile (coaches skip this)
  if (user && needsMembership && !isCoach) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('status, role')
      .eq('id', user.id)
      .single()

    const hasAccess = profile?.status === 'active' || profile?.role === 'coach'
    if (!hasAccess) {
      const url = request.nextUrl.clone()
      url.pathname = '/system'
      url.searchParams.set('access', 'required')
      return NextResponse.redirect(url)
    }
  }

  // Already logged in → skip /login
  if (user && pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/stats'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
