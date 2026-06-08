import { NextRequest, NextResponse } from 'next/server'
import {
  AI_SESSION_COOKIE,
  SESSION_TTL_MS,
  checkPassword,
  createSessionToken,
  getAiSecret,
} from '@/lib/ai-auth'

export async function POST(req: NextRequest) {
  const secret = getAiSecret()
  if (!secret) {
    return NextResponse.json({ error: 'Tool not configured' }, { status: 500 })
  }

  const { password } = await req.json().catch(() => ({ password: '' }))
  if (typeof password !== 'string' || password.length === 0) {
    return NextResponse.json({ error: 'Password required' }, { status: 400 })
  }

  if (!checkPassword(password, secret)) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  const token = await createSessionToken(secret)
  const res = NextResponse.json({ ok: true })
  res.cookies.set(AI_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: req.nextUrl.protocol === 'https:',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
  })
  return res
}
