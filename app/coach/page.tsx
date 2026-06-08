import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import CoachClient, { type MemberWithIntake } from './CoachClient'

export default async function CoachPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: profile } = await admin
    .from('profiles')
    .select('first_name, role, email, avatar_color, avatar_url')
    .eq('id', user.id)
    .single()

  const COACH_EMAILS = ['me@javilorenzana.com']
  const isWhitelisted = COACH_EMAILS.includes(user.email ?? '')
  if (!profile && !isWhitelisted) redirect('/login')
  if (profile && !['coach', 'head_coach'].includes(profile.role ?? '') && !isWhitelisted) {
    redirect('/login')
  }

  const profileRole = profile?.role ?? null
  const isValidCoachRole = profileRole === 'coach' || profileRole === 'head_coach'
  const role = isValidCoachRole ? profileRole : (isWhitelisted ? 'head_coach' : 'coach')
  const isHeadCoach = role === 'head_coach'

  // Members visible to this coach
  let memberIds: string[] = []
  if (isHeadCoach) {
    const { data: allMemberProfiles } = await admin.from('profiles').select('id').eq('role', 'member')
    memberIds = (allMemberProfiles ?? []).map(m => m.id)
  } else {
    const { data: assignments } = await admin
      .from('coach_assignments').select('member_id').eq('coach_id', user.id)
    memberIds = (assignments ?? []).map(a => a.member_id)
  }

  // Load member profiles
  const { data: members } = memberIds.length
    ? await admin.from('profiles').select(`
        id, first_name, email, role, weight_unit, avatar_url, avatar_color,
        gender, age, height_cm, location, occupation, work_schedule,
        starting_weight_kg, starting_body_fat_pct, waist_cm, chest_cm, hips_cm,
        mirror_goal, target_date, why_motivation, success_vision,
        training_years, training_frequency_per_week, training_current_state, training_access, training_equipment, training_injuries,
        diet_typical_day, diet_meals_per_day, diet_who_cooks, diet_restrictions, diet_dislikes, diet_alcohol_frequency, diet_supplements, diet_eating_out_frequency,
        lifestyle_sleep_hours, lifestyle_sleep_quality, lifestyle_stress_level, lifestyle_travel_frequency, lifestyle_energy_level,
        intake_notes, onboarded_at
      `).in('id', memberIds)
    : { data: [] }

  const { data: snoozeRows } = await supabase.from('attention_snoozes').select('member_id, snoozed_at')
  const snoozeMap = Object.fromEntries(
    (snoozeRows ?? []).map(s => [s.member_id as string, s.snoozed_at as string])
  )

  return (
    <CoachClient
      userId={user.id}
      userEmail={user.email ?? ''}
      userRole={role}
      firstName={profile?.first_name ?? null}
      avatarColor={profile?.avatar_color ?? '#b0e455'}
      avatarUrl={profile?.avatar_url ?? null}
      members={(members ?? []) as MemberWithIntake[]}
      snoozeMap={snoozeMap}
    />
  )
}
