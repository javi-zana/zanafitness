import type { SupabaseClient } from '@supabase/supabase-js'

// Assemble everything we know about a client to (a) show on the client page and
// (b) feed the report generator. Read via the service-role client.

const PROFILE_FIELDS = [
  'id', 'first_name', 'email', 'tier',
  'gender', 'age', 'height_cm', 'location', 'occupation', 'work_schedule',
  'starting_weight_kg', 'starting_body_fat_pct',
  'mirror_goal', 'target_date', 'why_motivation', 'success_vision',
  'training_years', 'training_frequency_per_week', 'training_current_state',
  'training_access', 'training_equipment', 'training_injuries',
  'diet_typical_day', 'diet_meals_per_day', 'diet_who_cooks', 'diet_restrictions',
  'diet_dislikes', 'diet_alcohol_frequency', 'diet_supplements', 'diet_eating_out_frequency',
  'lifestyle_sleep_hours', 'lifestyle_sleep_quality', 'lifestyle_stress_level', 'lifestyle_travel_frequency',
].join(', ')

export type OkrContent = { type: 'okr'; objective: string; key_results: string[] }

export type ClientContext = {
  profile: Record<string, unknown> & { id: string; first_name: string | null; email: string | null }
  okr: OkrContent | null
  latestCheckin: Record<string, unknown> | null
  recentCheckins: Record<string, unknown>[]
  notes: { body: string; created_at: string }[]
  lastReportWeek: string | null
}

export async function fetchClientContext(
  supabase: SupabaseClient,
  memberId: string,
): Promise<ClientContext | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select(PROFILE_FIELDS)
    .eq('id', memberId)
    .single()

  if (!profile) return null

  const [{ data: okrRow }, { data: checkins }, { data: notes }, { data: lastReport }] =
    await Promise.all([
      supabase
        .from('program_sections')
        .select('content_json')
        .eq('member_id', memberId)
        .eq('section', 'okr')
        .maybeSingle(),
      supabase
        .from('weekly_checkins')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })
        .limit(4),
      supabase
        .from('coach_notes')
        .select('body, created_at')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('reports')
        .select('week_label')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

  const okrJson = okrRow?.content_json as OkrContent | null
  const okr = okrJson?.type === 'okr' ? okrJson : null
  const recentCheckins = (checkins ?? []) as Record<string, unknown>[]

  return {
    profile: profile as unknown as ClientContext['profile'],
    okr,
    latestCheckin: recentCheckins[0] ?? null,
    recentCheckins,
    notes: (notes ?? []) as { body: string; created_at: string }[],
    lastReportWeek: (lastReport?.week_label as string) ?? null,
  }
}

// Compact, human-readable summary of the context for the generation prompt.
export function contextToPromptText(ctx: ClientContext): string {
  const p = ctx.profile
  const lines: string[] = []
  const add = (label: string, v: unknown) => {
    if (v !== null && v !== undefined && String(v).trim() !== '') lines.push(`${label}: ${v}`)
  }

  lines.push('## CLIENT')
  add('Name', p.first_name)
  add('Tier', p.tier)
  add('Age', p.age)
  add('Gender', p.gender)
  add('Occupation', p.occupation)
  add('Work schedule', p.work_schedule)

  lines.push('\n## GOALS')
  add('Mirror goal (what they want to look like)', p.mirror_goal)
  add('Target date', p.target_date)
  add('Why / motivation', p.why_motivation)
  add('Vision of success', p.success_vision)
  if (ctx.okr) {
    lines.push(`Current OKR objective: ${ctx.okr.objective}`)
    ctx.okr.key_results?.forEach((kr, i) => lines.push(`  KR${i + 1}: ${kr}`))
  }

  lines.push('\n## INTAKE')
  add('Training experience', p.training_years)
  add('Training frequency/wk', p.training_frequency_per_week)
  add('Current training', p.training_current_state)
  add('Equipment/access', p.training_equipment || p.training_access)
  add('Injuries', p.training_injuries)
  add('Typical day of eating', p.diet_typical_day)
  add('Meals/day', p.diet_meals_per_day)
  add('Who cooks', p.diet_who_cooks)
  add('Dietary restrictions', p.diet_restrictions)
  add('Dislikes', p.diet_dislikes)
  add('Alcohol', p.diet_alcohol_frequency)
  add('Eating out', p.diet_eating_out_frequency)
  add('Sleep hours', p.lifestyle_sleep_hours)
  add('Sleep quality', p.lifestyle_sleep_quality)
  add('Stress (1-10)', p.lifestyle_stress_level)
  add('Travel', p.lifestyle_travel_frequency)

  const c = ctx.latestCheckin
  if (c) {
    lines.push('\n## LATEST WEEKLY CHECK-IN')
    add('Morale (1-10)', c.morale)
    add('Weight (kg)', c.weight_kg)
    add('Sleep rating', c.rating_sleep)
    add('Energy', c.rating_energy)
    add('Strength', c.rating_strength)
    add('Stress', c.rating_stress)
    add('Workout adherence', c.rating_workout_adherence)
    add('Nutrition adherence', c.rating_nutrition_adherence)
    add('Wants program changes', c.program_changes_needed ? `yes — ${c.program_changes_details ?? ''}` : 'no')
    add('Went off-plan', c.went_off_plan ? `yes — ${c.went_off_plan_details ?? ''}` : 'no')
    add('Proud of', c.proud_of)
    add('Wants to improve', c.improve)
    add('Comments', c.comments)
  }

  if (ctx.notes.length) {
    lines.push('\n## RECENT COACH NOTES (newest first)')
    ctx.notes.forEach((n) => lines.push(`- (${n.created_at.split('T')[0]}) ${n.body}`))
  }

  if (ctx.lastReportWeek) lines.push(`\nLast report covered: ${ctx.lastReportWeek}`)

  return lines.join('\n')
}
