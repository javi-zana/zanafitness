import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { AI_SESSION_COOKIE, getAiSecret, verifySessionToken } from '@/lib/ai-auth'

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  const pathname = request.nextUrl.pathname

  // ── ai.zanafitness.com — password-gated internal tool ─────────────────────
  // Fully separate from the member app. The subdomain serves the app/ai/* route
  // group; everything but the login screen requires a valid session cookie.
  if (host.startsWith('ai.')) {
    const isPublic = pathname === '/login' || pathname === '/api/login'
    const authed =
      isPublic ||
      (await verifySessionToken(request.cookies.get(AI_SESSION_COOKIE)?.value, getAiSecret()))

    if (!authed) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
      }
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.search = ''
      return NextResponse.redirect(url)
    }

    // Serve from app/ai/* while keeping clean subdomain URLs (/, /login, ...).
    const target = request.nextUrl.clone()
    target.pathname = `/ai${pathname === '/' ? '' : pathname}`
    return NextResponse.rewrite(target)
  }

  // The /ai/* route group is reachable ONLY via the ai. subdomain.
  if (pathname.startsWith('/ai')) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.search = ''
    return NextResponse.redirect(url)
  }

  // Main-app API routes keep their original behavior (no auth middleware).
  if (pathname.startsWith('/api')) {
    return NextResponse.next({ request })
  }

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

  const searchParams = request.nextUrl.searchParams

  // Supabase auth errors redirect to the site root — catch and forward to login
  if (pathname === '/' && searchParams.get('error')) {
    const errorCode = searchParams.get('error_code')
    const message = errorCode === 'otp_expired'
      ? 'This link has expired. Please request a new one.'
      : 'Authentication failed. Please try again.'
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = ''
    url.searchParams.set('error', message)
    return NextResponse.redirect(url)
  }

  // Paths that require login only
  const authPaths = ['/profile', '/onboarding']
  // Paths that require login AND active subscription
  const memberPaths = ['/dashboard', '/reports', '/workout', '/meals', '/nutrition', '/progress', '/guidance', '/program', '/schedule', '/coach', '/calls', '/checkin', '/classroom']

  const needsAuth = authPaths.some(p => pathname.startsWith(p))
  const needsMembership = memberPaths.some(p => pathname.startsWith(p))

  // Not logged in → /
  if (!user && (needsAuth || needsMembership)) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Coaches always get through
  const COACH_EMAILS = ['me@javilorenzana.com']
  const isCoach = COACH_EMAILS.includes(user?.email ?? '')

  // Logged in but needs active subscription → check profile (coaches skip this)
  // Uses service role to bypass RLS — profile lookup must never be blocked by policies
  if (user && needsMembership && !isCoach) {
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { data: profile } = await serviceClient
      .from('profiles')
      .select('status, role, onboarded_at')
      .eq('id', user.id)
      .single()

    const hasAccess = profile?.status === 'active' || profile?.role === 'coach' || profile?.role === 'member'
    if (!hasAccess) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      url.searchParams.set('error', 'no_access')
      return NextResponse.redirect(url)
    }

    // Members with no intake yet must finish onboarding before entering the app
    if (profile?.role === 'member' && !profile?.onboarded_at) {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      url.search = ''
      return NextResponse.redirect(url)
    }
  }

  // Already logged in → skip login screens (unless showing a no-access message)
  if (user && (pathname === '/' || pathname === '/login') && !request.nextUrl.searchParams.has('error')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
    // Note: api/ is intentionally NOT excluded — the ai. subdomain needs its
    // /api/login to pass through middleware. Main-app /api requests are short-
    // circuited inside the middleware body (return next() before any auth work).
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
