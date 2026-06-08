import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/ai-supabase'
import { fetchClientContext, contextToPromptText } from '@/lib/client-context'
import { CURRICULUM_INDEX, type ReportContent } from '@/lib/report-template'

const curriculumList = CURRICULUM_INDEX.map(
  (s) => `- ${s.section}: ${s.lessons.join(', ')}`,
).join('\n')

const SYSTEM = `You are Javi Lorenzana's coaching assistant. You draft his weekly client report — a one-page "Weekly Coaching Brief".

Javi's method: aesthetics-first body recomposition through sustainable lifestyle habits, NOT gym-rat intensity. PPL training, habits-based nutrition (NO macros, meal plans, or calorie counting). Priorities must be BEHAVIORS, not outcomes ("hit 10k steps daily", "lift 3x this week" — never "lose 2 lbs"). Keep the whole thing to one focused sheet.

Voice: direct, concrete, human. Action verbs. No corporate filler, no hype, no motivational-poster lines. Plain language — the letterhead carries the polish.

You'll be given the client's goals, intake, latest weekly check-in, recent coach notes, and Javi's rough focus for the week. Synthesize it. Ground the priorities in the actual check-in data (e.g. if sleep is rated low, address sleep). Where it fits, point them at a curriculum lesson.

Curriculum sections you can reference:
${curriculumList}

Return ONLY valid JSON — no markdown fences, no commentary. Exact shape:
{
  "objective": "the single headline focus for the week — short, punchy",
  "objective_subline": "one sentence of context under the objective",
  "coach_note": "a short, warm-but-direct personal note from Javi (2-4 sentences)",
  "priorities": [{ "title": "behavior to focus on", "detail": "one line of how/why" }],
  "levers": {
    "training":  { "sub": "short tag", "items": ["specific action", "..."] },
    "nutrition": { "sub": "short tag", "items": ["..."] },
    "lifestyle": { "sub": "short tag", "items": ["..."] }
  }
}
Rules: 2-5 priorities. Omit any lever that isn't relevant this week (don't pad). Every string must be real content — never a placeholder.`

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 500 })
  }

  const { memberId, focusNote, weekLabel } = await req.json().catch(() => ({}))
  if (!memberId) {
    return NextResponse.json({ error: 'memberId required' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const ctx = await fetchClientContext(supabase, memberId)
  if (!ctx) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  const userPrompt = [
    contextToPromptText(ctx),
    `\n## JAVI'S FOCUS FOR THIS WEEK\n${focusNote?.trim() || '(none given — infer the most important focus from the data above)'}`,
    `\nWeek this report covers: ${weekLabel || '(unspecified)'}`,
  ].join('\n')

  let res: Response
  try {
    res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        system: SYSTEM,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })
  } catch (e) {
    console.error('[ai/generate] fetch threw:', e)
    return NextResponse.json({ error: `Network error reaching Claude: ${e instanceof Error ? e.message : String(e)}` }, { status: 502 })
  }

  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    console.error('[ai/generate] Claude error:', res.status, json)
    const detail = json?.error?.message || JSON.stringify(json).slice(0, 300)
    return NextResponse.json({ error: `Claude API ${res.status}: ${detail}` }, { status: 502 })
  }

  const text: string = (json.content?.[0]?.text ?? '').trim()
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')

  let content: ReportContent
  try {
    content = JSON.parse(cleaned)
  } catch {
    console.error('[ai/generate] bad JSON:', text)
    return NextResponse.json({ error: 'AI returned malformed output — try again' }, { status: 502 })
  }

  return NextResponse.json({ content, clientName: ctx.profile.first_name ?? 'Client' })
}
