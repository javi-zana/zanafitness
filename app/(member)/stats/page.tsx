import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import StatsClient from './StatsClient'

export default async function StatsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  const [
    { data: profile },
    { data: stats },
    { data: progressPhotos },
    { data: todayWorkout },
    { data: todayCalorie },
    { data: foodSection },
  ] = await Promise.all([
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
    supabase
      .from('progress_photos')
      .select('id, photo_url, photo_type, taken_at, created_at')
      .eq('member_id', user.id)
      .order('created_at', { ascending: true }),
    supabase
      .from('workout_logs')
      .select('logged_date')
      .eq('member_id', user.id)
      .eq('logged_date', today)
      .maybeSingle(),
    supabase
      .from('calorie_logs')
      .select('calories_eaten')
      .eq('member_id', user.id)
      .eq('logged_date', today)
      .maybeSingle(),
    supabase
      .from('program_sections')
      .select('content_json')
      .eq('member_id', user.id)
      .eq('section', 'food')
      .maybeSingle(),
  ])

  const calorieTarget = (() => {
    try {
      const j = foodSection?.content_json as { type?: string; calorie_target?: number } | null
      return j?.type === 'bmr' ? (j.calorie_target ?? null) : null
    } catch { return null }
  })()

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
      initialProgressPhotos={progressPhotos ?? []}
      todayWorkoutLogged={!!todayWorkout}
      todayCalories={todayCalorie?.calories_eaten ?? null}
      calorieTarget={calorieTarget}
    />
  )
}
