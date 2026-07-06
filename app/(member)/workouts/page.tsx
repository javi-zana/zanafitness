import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import WorkoutsClient from './WorkoutsClient'

export default async function WorkoutsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: logs } = await supabase
    .from('workout_logs')
    .select('id, logged_date, notes')
    .eq('member_id', user.id)
    .order('logged_date', { ascending: false })
    .limit(120)

  return (
    <WorkoutsClient
      logs={(logs ?? []) as { id: string; logged_date: string; notes: Record<string, unknown> | string | null }[]}
    />
  )
}
