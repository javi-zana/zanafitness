import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { fetchActivities } from '@/utils/activities'
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

  // Load member profiles + activity feed (replaces legacy stat_updates / workout_logs / calorie_logs)
  const [{ data: members }, activities] = await Promise.all([
    memberIds.length
      ? admin.from('profiles').select(`
          id, first_name, email, role, weight_unit, avatar_url, avatar_color,
          gender, age, height_cm, location, occupation, work_schedule,
          starting_weight_kg, starting_body_fat_pct, waist_cm, chest_cm, hips_cm,
          mirror_goal, target_date, why_motivation, success_vision,
          training_years, training_frequency_per_week, training_current_state, training_access, training_equipment, training_injuries,
          diet_typical_day, diet_meals_per_day, diet_who_cooks, diet_restrictions, diet_dislikes, diet_alcohol_frequency, diet_supplements, diet_eating_out_frequency,
          lifestyle_sleep_hours, lifestyle_sleep_quality, lifestyle_stress_level, lifestyle_travel_frequency, lifestyle_energy_level,
          intake_notes, onboarded_at
        `).in('id', memberIds)
      : Promise.resolve({ data: [] }),
    memberIds.length ? fetchActivities(admin, memberIds, 100) : Promise.resolve([]),
  ])

  // ── Load all threads this coach participates in ──────────────────────────────
  const { data: myParticipations } = await admin
    .from('thread_participants')
    .select('thread_id')
    .eq('user_id', user.id)

  let allThreadIds = (myParticipations ?? []).map(p => p.thread_id as string)

  // Head coach also sees member threads even if not yet in participants
  if (isHeadCoach && memberIds.length > 0) {
    const { data: memberThreads } = await admin
      .from('threads').select('id').in('member_id', memberIds)
    const extra = (memberThreads ?? []).map(t => t.id as string)
    allThreadIds = Array.from(new Set([...allThreadIds, ...extra]))
  }

  const { data: threadsRaw } = allThreadIds.length
    ? await admin.from('threads')
        .select('id, member_id, thread_type, title, is_group, last_message_at')
        .in('id', allThreadIds)
    : { data: [] }

  // Load participants for all threads
  const { data: participantRows } = allThreadIds.length
    ? await admin.from('thread_participants').select('thread_id, user_id').in('thread_id', allThreadIds)
    : { data: [] }

  const participantUserIds = Array.from(new Set((participantRows ?? []).map(p => p.user_id as string)))
  const { data: participantProfiles } = participantUserIds.length
    ? await admin.from('profiles')
        .select('id, first_name, email, role, avatar_url, avatar_color')
        .in('id', participantUserIds)
    : { data: [] }

  const profileMap = Object.fromEntries((participantProfiles ?? []).map(p => [p.id as string, p]))

  const threads = (threadsRaw ?? []).map(t => ({
    id: t.id as string,
    member_id: t.member_id as string | null,
    thread_type: (t.thread_type ?? 'dm') as 'dm' | 'group_member' | 'coaches_group' | 'custom',
    title: t.title as string | null,
    is_group: t.is_group as boolean,
    last_message_at: t.last_message_at as string | null,
    participants: (participantRows ?? [])
      .filter(p => p.thread_id === t.id)
      .map(p => {
        const prof = profileMap[p.user_id as string]
        return {
          user_id: p.user_id as string,
          first_name: prof?.first_name ?? null,
          email: prof?.email ?? '',
          role: prof?.role ?? 'member',
          avatar_url: prof?.avatar_url ?? null,
          avatar_color: prof?.avatar_color ?? null,
        }
      }),
  }))

  // Last messages for thread previews
  const { data: lastMessages } = allThreadIds.length
    ? await admin.from('messages')
        .select('thread_id, body, created_at, author_id')
        .in('thread_id', allThreadIds)
        .order('created_at', { ascending: false })
        .limit(allThreadIds.length * 3)
    : { data: [] }

  // My read receipts
  const { data: myReads } = allThreadIds.length
    ? await supabase.from('message_reads')
        .select('thread_id, last_read_at')
        .eq('user_id', user.id)
        .in('thread_id', allThreadIds)
    : { data: [] }

  // All coach profiles (for new DM creation)
  const { data: coachProfiles } = await admin
    .from('profiles')
    .select('id, first_name, email, avatar_url, avatar_color, role')
    .in('role', ['coach', 'head_coach'])
    .neq('id', user.id)

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
      activities={activities}
      threads={threads}
      lastMessages={(lastMessages ?? []) as { thread_id: string; body: string; created_at: string; author_id: string }[]}
      myReads={(myReads ?? []) as { thread_id: string; last_read_at: string }[]}
      coachProfiles={(coachProfiles ?? []) as { id: string; first_name: string | null; email: string; avatar_url: string | null; avatar_color: string | null; role: string }[]}
      snoozeMap={snoozeMap}
    />
  )
}
