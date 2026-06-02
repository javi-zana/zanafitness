import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'me@javilorenzana.com'

const VALID_STATUSES = ['accepted', 'call_booked', 'waiting', 'won', 'lost', 'rejected'] as const
type PipelineStatus = typeof VALID_STATUSES[number]

function admin() {
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

  const { applicationId, status } = await req.json()
  if (!applicationId || !VALID_STATUSES.includes(status as PipelineStatus)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const db = admin()
  const { error } = await db
    .from('applications')
    .update({ status, responded_at: new Date().toISOString() })
    .eq('id', applicationId)

  if (error) {
    console.error('[move-application] DB error:', error)
    return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
  }

  return NextResponse.json({ success: true, status })
}
