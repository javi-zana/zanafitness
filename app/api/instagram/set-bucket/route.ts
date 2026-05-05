import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'me@javilorenzana.com'
const VALID_BUCKETS = ['new', 'interviewing', 'favorites', 'not_ready', 'declined']

function adminDb() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { conversationId, bucket } = await req.json()
  if (!conversationId || !VALID_BUCKETS.includes(bucket)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const db = adminDb()
  await db.from('ig_conversations').update({ bucket }).eq('id', conversationId)
  return NextResponse.json({ ok: true })
}
