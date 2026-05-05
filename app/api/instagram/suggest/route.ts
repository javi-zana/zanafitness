import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

const ADMIN_EMAIL = 'me@javilorenzana.com'

const SYSTEM = `Ghostwrite 2 DM replies for Javi, a fitness coach. Leads want body recomposition (lose fat, build muscle).

Voice: lowercase, short, direct, casual "bro" energy, mirror their length, zero fluff.
Goal: qualify (goal? timeline? tried anything?) then convert to 15-min call. One question at a time. Never pitch before qualifying.

Reply ONLY in this format:
A: <reply>
B: <reply>`

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { messages } = await req.json()
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'No messages' }, { status: 400 })
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 160,
      system: SYSTEM,
      messages: messages.slice(-4),
    }),
  })

  const json = await res.json()
  if (!res.ok) {
    console.error('[ig/suggest] Claude error:', json)
    return NextResponse.json({ error: 'AI failed' }, { status: 502 })
  }

  const text = (json.content?.[0]?.text ?? '').trim()
  const aMatch = text.match(/A:\s*([\s\S]+?)(?=\nB:|$)/)
  const bMatch = text.match(/B:\s*([\s\S]+)/)
  const suggestions = [aMatch?.[1]?.trim(), bMatch?.[1]?.trim()].filter(Boolean)
  return NextResponse.json({ suggestions })
}
