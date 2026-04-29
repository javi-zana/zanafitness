import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import StatsClient from './StatsClient'

export default async function StatsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: stats }] = await Promise.all([
    supabase
      .from('profiles')
      .select('first_name, weight_unit')
      .eq('id', user.id)
      .single(),
    supabase
      .from('stat_updates')
      .select('id, weight_kg, confidence, milestone_text, created_at, stat_update_photos(id, storage_path)')
      .eq('member_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const lastUpdate = stats?.[0]?.created_at ?? null
  const daysSince = lastUpdate
    ? Math.floor((Date.now() - new Date(lastUpdate).getTime()) / 86_400_000)
    : Infinity
  const showNudge = daysSince >= 3

  return (
    <StatsClient
      userId={user.id}
      weightUnit={(profile?.weight_unit as 'kg' | 'lb') ?? 'kg'}
      initialStats={stats ?? []}
      showNudge={showNudge}
    />
  )
}
