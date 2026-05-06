import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

function adminClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = adminClient()
  const { data: myProfile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if (myProfile?.role !== 'head_coach') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { thread_id, title } = await req.json()
  if (!thread_id || !title?.trim()) {
    return NextResponse.json({ error: 'thread_id and title required' }, { status: 400 })
  }

  const { error } = await admin.from('threads').update({ title: title.trim() }).eq('id', thread_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
