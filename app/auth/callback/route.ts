import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorCode = searchParams.get('error_code')
  const next = searchParams.get('next') ?? '/dashboard'

  // Supabase redirected here with an error (e.g. otp_expired)
  if (error) {
    const message = errorCode === 'otp_expired'
      ? 'Your login link expired. Please request a new one.'
      : 'Login failed. Please try again.'
    const url = new URL('/login', origin)
    url.searchParams.set('error', message)
    return NextResponse.redirect(url)
  }

  if (code) {
    const supabase = await createClient()
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (!exchangeError) {
      const type = searchParams.get('type')
      if (data.session && type === 'recovery') {
        return NextResponse.redirect(`${origin}/reset-password`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  const url = new URL('/login', origin)
  url.searchParams.set('error', 'Login failed. Please try again.')
  return NextResponse.redirect(url)
}
