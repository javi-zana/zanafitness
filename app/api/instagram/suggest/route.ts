import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

const ADMIN_EMAIL = 'me@javilorenzana.com'

const SYSTEM = `You are helping Javi, a fitness coach, reply to Instagram DMs from people who messaged him "BODY" wanting to get in shape.

Javi's texting style:
- Casual and genuine, like a friend not a salesperson
- Mostly lowercase, short sentences
- Occasionally "haha" or "lol" but not forced
- No fluff, gets to the point
- Warm but not sycophantic — he doesn't over-compliment

Goal: engage genuinely, understand what they're trying to change and why, build rapport before eventually sending them the apply link. Don't push the link until it feels natural.

Suggest ONE reply only. Keep it under 3 sentences. No hashtags. Match the energy of the conversation so far.`

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
      max_tokens: 200,
      system: SYSTEM,
      messages: messages.slice(-12), // last 12 turns for context
    }),
  })

  const json = await res.json()
  if (!res.ok) {
    console.error('[ig/suggest] Claude error:', json)
    return NextResponse.json({ error: 'AI failed' }, { status: 502 })
  }

  const suggestion = (json.content?.[0]?.text ?? '').trim()
  return NextResponse.json({ suggestion })
}
