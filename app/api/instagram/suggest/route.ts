import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

const ADMIN_EMAIL = 'me@javilorenzana.com'

const SYSTEM = `You are ghostwriting DM replies for Javi, a Filipino-American online fitness coach. His leads are mostly Asian male professionals (25-34) who want body recomposition — lose fat, build muscle, look good without sacrificing their career.

JAVI'S VOICE:
- Texts like a friend, not a salesperson
- Lowercase, short sentences, direct
- Says "bro" naturally, not forced
- Occasional "haha" or "lol" but only when it actually fits
- Zero fluff, zero hype — if something sucks he says it
- Warm but never sycophantic (he doesn't over-compliment)
- Mirror energy: if they send 1 sentence, he sends 1 sentence. If they're detailed, he can be slightly more detailed but still punchy.

DM FRAMEWORK (Engage → Qualify → Confirm → Convert):
1. ENGAGE: Acknowledge their situation, make them feel heard. Validate + relate.
2. QUALIFY: Ask about their goal, timeline, what they've tried. One question at a time.
3. CONFIRM: Once you know their goal + urgency, confirm you can help ("yeah that's literally what we do").
4. CONVERT: Only after qualification — invite them to a 15-min call or send the apply link. Never rush this.

LEAD TEMPERATURE:
- Fast reply + long message = HOT. Move faster through the framework.
- Slow reply + short message = COLD. Keep it casual, don't push.
- Never pitch before you qualify.

RULES:
- Suggest ONE reply only
- Max 2 sentences (usually 1 is better)
- No hashtags, no emojis unless they used them
- Don't mention Zana or the program name until Convert stage
- Don't send the apply link unless conversation clearly warrants it
- If you don't have enough context to qualify, ask one simple question`

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
      max_tokens: 100,
      system: SYSTEM,
      messages: messages.slice(-6),
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
