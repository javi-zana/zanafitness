import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// One-time endpoint: imports ManyChat WARM-tagged contacts into ig_conversations
// POST with JSON array: [{ id: "12345", name: "First Last" }, ...]

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-import-secret')
  if (secret !== process.env.META_VERIFY_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const contacts: { id: string; name: string }[] = await req.json()
  if (!Array.isArray(contacts) || contacts.length === 0) {
    return NextResponse.json({ error: 'Expected non-empty array' }, { status: 400 })
  }

  const db = adminDb()
  const rows = contacts.map(c => ({
    id: String(c.id),
    display_name: c.name ?? null,
    last_message_body: 'hey thanks for messaging!! btw...',
    last_message_at: new Date().toISOString(),
    status: 'open',
  }))

  const { error, count } = await db
    .from('ig_conversations')
    .upsert(rows, { onConflict: 'id', ignoreDuplicates: true })
    .select('id')

  if (error) {
    console.error('[import-warm] error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, imported: count })
}
