import { NextResponse } from 'next/server'
import { AI_SESSION_COOKIE } from '@/lib/ai-auth'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(AI_SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
  return res
}
