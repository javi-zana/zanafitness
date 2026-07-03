import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkPassword } from '@/lib/ai-auth'

// Receives Roadrunner's sweep.py --json output (pushed by push_sweep.py on
// Javi's Mac) and upserts one dm_signals row per client. Auth is a shared
// secret — this endpoint is on the public domain because the ai.* cookie wall
// can't be satisfied by a curl from a cron job.

type SweepClient = {
  name?: string
  chat_id?: string
  status?: string
  next_call?: string
  needs_attention?: boolean
  draft_type?: string
  waiting_on_javi?: boolean
  last_text?: string
  days_since_last?: number | null
  unread?: number
  empty?: boolean
  error?: string
  thread?: Array<{ who: string; ts: string; text: string }>
}

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

export async function POST(req: NextRequest) {
  const secret = process.env.SWEEP_INGEST_SECRET ?? ''
  const auth = req.headers.get('authorization') ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!secret || !checkPassword(token, secret)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const clients: SweepClient[] = Array.isArray(body?.clients) ? body.clients : []
  if (clients.length === 0) {
    return NextResponse.json({ error: 'no clients in payload' }, { status: 400 })
  }

  const db = admin()
  const { data: profiles } = await db.from('profiles').select('id, first_name').eq('role', 'member')

  // Match dossier name -> profile by first token, case-insensitive; ambiguous
  // or missing -> null (row still stored, shown as DM-only in the dashboard).
  function matchMember(name: string): string | null {
    const first = name.trim().split(/\s+/)[0]?.toLowerCase()
    if (!first) return null
    const hits = (profiles ?? []).filter((p) => (p.first_name ?? '').trim().toLowerCase() === first)
    return hits.length === 1 ? hits[0].id : null
  }

  const now = Date.now()
  const rows = clients
    .filter((c) => c.name && !c.error)
    .map((c) => {
      const lastThreadMsg = c.thread?.length ? c.thread[c.thread.length - 1] : null
      const lastAt = lastThreadMsg?.ts
        ? new Date(lastThreadMsg.ts).toISOString()
        : c.days_since_last != null
          ? new Date(now - c.days_since_last * 86_400_000).toISOString()
          : null
      return {
        client_name: c.name as string,
        member_id: matchMember(c.name as string),
        chat_id: c.chat_id ?? null,
        last_message_at: lastAt,
        last_sender: lastThreadMsg ? (lastThreadMsg.who === 'javi' ? 'coach' : 'client') : null,
        last_text: (c.last_text ?? '').slice(0, 500) || null,
        draft_type: c.needs_attention && (c.draft_type === 'reply' || c.draft_type === 'nudge') ? c.draft_type : null,
        needs_attention: Boolean(c.needs_attention),
        unread_count: c.unread ?? null,
        next_call: c.next_call || null,
        swept_at: new Date().toISOString(),
      }
    })

  const { error } = await db.from('dm_signals').upsert(rows, { onConflict: 'client_name' })
  if (error) {
    console.error('[sweep-ingest] upsert error:', error)
    return NextResponse.json({ error: 'upsert failed' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    upserted: rows.length,
    matched: rows.filter((r) => r.member_id).length,
    skipped: clients.length - rows.length,
  })
}
