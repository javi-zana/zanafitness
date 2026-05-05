import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// One-time endpoint: fetches ig_username + profile_pic for all ig_conversations from ManyChat API
// POST with header: x-import-secret: <META_VERIFY_TOKEN>

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function getManyChat(subscriberId: string): Promise<{ ig_username?: string; profile_pic?: string; display_name?: string } | null> {
  const res = await fetch(`https://api.manychat.com/fb/subscriber/getInfo?subscriber_id=${subscriberId}`, {
    headers: { Authorization: `Bearer ${process.env.MANYCHAT_API_KEY}` },
  })
  if (!res.ok) return null
  const json = await res.json()
  const d = json?.data
  if (!d) return null
  return {
    ig_username: d.ig_username ?? undefined,
    profile_pic: d.profile_pic ?? undefined,
    display_name: d.first_name ?? d.name ?? undefined,
  }
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-import-secret')
  if (secret !== process.env.META_VERIFY_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = adminDb()

  const { data: convos, error } = await db
    .from('ig_conversations')
    .select('id, ig_username, profile_pic_url')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!convos || convos.length === 0) return NextResponse.json({ ok: true, updated: 0 })

  let updated = 0
  let failed = 0

  for (const c of convos) {
    const info = await getManyChat(c.id)
    if (!info) { failed++; continue }

    const patch: Record<string, string | null> = {}
    if (info.ig_username && !c.ig_username) patch.ig_username = info.ig_username
    if (info.profile_pic && !c.profile_pic_url) patch.profile_pic_url = info.profile_pic
    if (info.display_name) patch.display_name = info.display_name

    if (Object.keys(patch).length === 0) continue

    const { error: updateError } = await db
      .from('ig_conversations')
      .update(patch)
      .eq('id', c.id)

    if (updateError) { console.error('[backfill] update error:', c.id, updateError.message); failed++ }
    else updated++

    // Respect ManyChat rate limit (~10 req/s)
    await new Promise(r => setTimeout(r, 120))
  }

  return NextResponse.json({ ok: true, total: convos.length, updated, failed })
}
