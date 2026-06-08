import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Member submits a weekly check-in. Uses the member's own session so the
// "member submits own checkin" RLS policy (member_id = auth.uid()) applies.
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const b = await req.json().catch(() => ({}))

  const clampRating = (v: unknown): number | null => {
    const n = Number(v)
    return Number.isFinite(n) && n >= 1 && n <= 10 ? Math.round(n) : null
  }

  const row = {
    member_id: user.id,
    week_label: typeof b.weekLabel === 'string' ? b.weekLabel : null,
    morale: clampRating(b.morale),
    program_changes_needed: typeof b.programChangesNeeded === 'boolean' ? b.programChangesNeeded : null,
    program_changes_details: b.programChangesDetails || null,
    rating_sleep: clampRating(b.sleep),
    rating_energy: clampRating(b.energy),
    rating_strength: clampRating(b.strength),
    rating_stress: clampRating(b.stress),
    rating_workout_adherence: clampRating(b.workoutAdherence),
    rating_nutrition_adherence: clampRating(b.nutritionAdherence),
    weight_kg: b.weightKg !== '' && b.weightKg != null && Number.isFinite(Number(b.weightKg)) ? Number(b.weightKg) : null,
    went_off_plan: typeof b.wentOffPlan === 'boolean' ? b.wentOffPlan : null,
    went_off_plan_details: b.wentOffPlanDetails || null,
    proud_of: b.proudOf || null,
    improve: b.improve || null,
    comments: b.comments || null,
  }

  const { error } = await supabase.from('weekly_checkins').insert(row)
  if (error) {
    console.error('[api/checkin] insert error:', error)
    return NextResponse.json({ error: 'Could not save your check-in' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
