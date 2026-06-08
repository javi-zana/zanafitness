import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.email !== 'me@javilorenzana.com') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const [
    { data: coaches, error: e1 },
    { data: members, error: e2 },
    { data: assignments, error: e3 },
  ] = await Promise.all([
    admin.from('profiles').select('id, email, first_name, role').in('role', ['coach', 'head_coach']),
    admin.from('profiles').select('id, email, first_name, role').eq('role', 'member'),
    admin.from('coach_assignments').select('member_id, coach_id'),
  ])

  if (e1 || e2 || e3) {
    console.error('[admin-data] query errors:', { e1, e2, e3 })
  }

  return NextResponse.json({ coaches, members, assignments, errors: { e1, e2, e3 } })
}
