import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { fetchActivities } from '@/utils/activities'
import StatsClient from './StatsClient'

export default async function TrackPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, activities] = await Promise.all([
    supabase.from('profiles').select('first_name').eq('id', user.id).single(),
    fetchActivities(supabase, [user.id], 50),
  ])

  return (
    <StatsClient
      userId={user.id}
      firstName={profile?.first_name ?? null}
      initialActivities={activities}
    />
  )
}
