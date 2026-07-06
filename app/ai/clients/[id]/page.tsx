import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/ai-supabase'
import { fetchClientContext } from '@/lib/client-context'
import { timeAgo } from '@/lib/format'
import { parseWorkoutLog, setsSummary, computeStreak } from '@/lib/workout-notes'
import ReportBuilder from './ReportBuilder'
import IntakeView from './IntakeView'

export const dynamic = 'force-dynamic'

type WeightPoint = { at: string; kg: number }

// Weight series = stat updates + weekly check-in weights, oldest first.
function weightSeries(
  stats: Array<{ created_at: string; weight_kg: number | null }>,
  checkins: Array<Record<string, unknown>>,
): WeightPoint[] {
  const pts: WeightPoint[] = []
  for (const s of stats) if (s.weight_kg != null) pts.push({ at: s.created_at, kg: Number(s.weight_kg) })
  for (const c of checkins)
    if (c.weight_kg != null) pts.push({ at: String(c.created_at), kg: Number(c.weight_kg) })
  return pts.sort((a, b) => a.at.localeCompare(b.at))
}

function Sparkline({ points }: { points: WeightPoint[] }) {
  if (points.length < 2) return null
  const kgs = points.map((p) => p.kg)
  const min = Math.min(...kgs)
  const max = Math.max(...kgs)
  const span = max - min || 1
  const W = 240
  const H = 48
  const coords = points
    .map((p, i) => `${(i / (points.length - 1)) * W},${H - 6 - ((p.kg - min) / span) * (H - 12)}`)
    .join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 h-12 w-full" preserveAspectRatio="none" aria-hidden>
      <polyline points={coords} fill="none" stroke="#a3e635" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-zinc-100">{value}</div>
      {sub && <div className="mt-0.5 text-[11px] text-zinc-500">{sub}</div>}
    </div>
  )
}

export default async function ClientPage({ params }: { params: { id: string } }) {
  const supabase = createServiceClient()
  const ctx = await fetchClientContext(supabase, params.id)
  if (!ctx) notFound()

  const [{ data: reports }, { data: stats }, { data: workoutRows }, { data: meals }] = await Promise.all([
    supabase
      .from('reports')
      .select('id, week_label, status, created_at')
      .eq('member_id', params.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('stat_updates')
      .select('created_at, weight_kg')
      .eq('member_id', params.id)
      .order('created_at', { ascending: true })
      .limit(200),
    supabase
      .from('workout_logs')
      .select('id, logged_date, notes')
      .eq('member_id', params.id)
      .order('logged_date', { ascending: false })
      .limit(30),
    supabase
      .from('meal_logs')
      .select('id, photo_url, note, created_at')
      .eq('member_id', params.id)
      .order('created_at', { ascending: false })
      .limit(60),
  ])

  const workouts = (workoutRows ?? []).map((w) => ({
    id: w.id as string,
    date: w.logged_date as string,
    exercises: parseWorkoutLog(w.notes as Record<string, unknown> | null).exercises,
  }))

  // This-week adherence + per-day activity log (workouts and meals merged)
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString().split('T')[0]
  const workoutsThisWeek = workouts.filter((w) => w.date >= weekAgo).length
  const mealsThisWeek = (meals ?? []).filter((m) => String(m.created_at) >= weekAgo).length
  const streak = computeStreak(workouts.map((w) => w.date))

  type DayEntry = { workout: (typeof workouts)[number] | null; meals: NonNullable<typeof meals> }
  const days = new Map<string, DayEntry>()
  const dayOf = (iso: string) => iso.split('T')[0]
  for (const w of workouts) {
    const d = days.get(w.date) ?? { workout: null, meals: [] }
    d.workout = w
    days.set(w.date, d)
  }
  for (const m of meals ?? []) {
    const key = dayOf(String(m.created_at))
    const d = days.get(key) ?? { workout: null, meals: [] }
    d.meals.push(m)
    days.set(key, d)
  }
  const dailyLog = Array.from(days.entries()).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 10)

  const p = ctx.profile
  const c = ctx.latestCheckin
  const series = weightSeries((stats ?? []) as Array<{ created_at: string; weight_kg: number | null }>, ctx.recentCheckins)
  const latest = series[series.length - 1] ?? null
  const startKg = p.starting_weight_kg != null ? Number(p.starting_weight_kg) : null
  const delta = latest && startKg != null ? latest.kg - startKg : null

  const facts = [
    p.age && `${p.age}y`,
    p.height_cm && `${p.height_cm}cm`,
    p.location,
    p.occupation,
  ].filter(Boolean)

  const ratings: Array<[string, unknown]> = c
    ? [
        ['Sleep', c.rating_sleep],
        ['Energy', c.rating_energy],
        ['Strength', c.rating_strength],
        ['Stress', c.rating_stress],
        ['Workouts', c.rating_workout_adherence],
        ['Nutrition', c.rating_nutrition_adherence],
      ]
    : []

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <Link href="/" className="text-xs text-zinc-500 transition hover:text-zinc-300">← Clients</Link>

      <header className="mt-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-medium text-zinc-100">{p.first_name || 'Unnamed'}</h1>
          {p.tier === 'vip' && (
            <span className="rounded-full border border-lime-500/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-lime-400">VIP</span>
          )}
        </div>
        <p className="mt-1 text-xs text-zinc-500">
          {facts.join(' · ')}
          {p.target_date ? ` · target ${String(p.target_date)}` : ''}
        </p>
      </header>

      {/* Vital stats */}
      <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Weight"
          value={latest ? `${latest.kg.toFixed(1)} kg` : startKg != null ? `${startKg.toFixed(1)} kg` : '—'}
          sub={
            delta != null
              ? `${delta > 0 ? '+' : ''}${delta.toFixed(1)} kg since start`
              : startKg != null && !latest
                ? 'starting weight'
                : undefined
          }
        />
        <Stat
          label="Body fat"
          value={p.starting_body_fat_pct != null ? `${p.starting_body_fat_pct}%` : '—'}
          sub="at intake"
        />
        <Stat label="Morale" value={c?.morale != null ? `${c.morale}/10` : '—'} sub="latest check-in" />
        <Stat label="Check-in" value={c ? timeAgo(String(c.created_at)) : 'none'} sub={c ? undefined : 'not yet'} />
      </div>

      {/* This week */}
      <div className="mb-3 grid grid-cols-3 gap-3">
        <Stat
          label="Workouts"
          value={String(workoutsThisWeek)}
          sub={p.training_frequency_per_week ? `target ${p.training_frequency_per_week}/wk` : 'this week'}
        />
        <Stat label="Meals logged" value={String(mealsThisWeek)} sub="this week" />
        <Stat label="Streak" value={streak > 0 ? `${streak}d` : '—'} sub="consecutive days" />
      </div>

      {/* Weight trend */}
      {series.length >= 2 && (
        <div className="mb-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-baseline justify-between">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500">Weight trend</div>
            <div className="text-[11px] text-zinc-500">{series.length} entries</div>
          </div>
          <Sparkline points={series} />
        </div>
      )}

      {/* Goal + OKR */}
      <div className="mb-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <div className="mb-2 text-[10px] uppercase tracking-wider text-zinc-500">Goal</div>
        <p className="text-sm text-zinc-200">{(p.mirror_goal as string) || '—'}</p>
        {ctx.okr && (
          <div className="mt-3 border-t border-zinc-800 pt-3">
            <p className="text-xs text-zinc-300"><span className="text-lime-400">OKR:</span> {ctx.okr.objective}</p>
            <ul className="mt-1 space-y-0.5">
              {ctx.okr.key_results?.map((kr, i) => (
                <li key={i} className="text-xs text-zinc-500">· {kr}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Latest check-in detail */}
      {c && (
        <div className="mb-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="mb-3 flex items-baseline justify-between">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500">Latest check-in</div>
            <div className="text-[11px] text-zinc-500">{timeAgo(String(c.created_at))}</div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {ratings.map(([label, v]) => (
              <div key={label} className="rounded-lg bg-zinc-900 px-2 py-1.5 text-center">
                <div className="text-[10px] text-zinc-500">{label}</div>
                <div className="text-sm font-semibold text-zinc-200">{v != null ? String(v) : '–'}</div>
              </div>
            ))}
          </div>
          {c.went_off_plan === true && (
            <p className="mt-3 text-xs text-amber-400">Off-plan: {String(c.went_off_plan_details ?? 'yes')}</p>
          )}
          {c.program_changes_needed === true && (
            <p className="mt-1 text-xs text-amber-400">Wants program changes: {String(c.program_changes_details ?? 'yes')}</p>
          )}
          {[
            ['Proud of', c.proud_of],
            ['Wants to improve', c.improve],
            ['Comments', c.comments],
          ]
            .filter(([, v]) => v)
            .map(([label, v]) => (
              <p key={String(label)} className="mt-2 text-xs leading-relaxed text-zinc-400">
                <span className="text-zinc-500">{String(label)}:</span> {String(v)}
              </p>
            ))}
        </div>
      )}

      {/* Daily log — workouts and meals, day by day */}
      {dailyLog.length > 0 && (
        <div className="mb-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="mb-3 text-[10px] uppercase tracking-wider text-zinc-500">Daily log</div>
          <div className="space-y-4">
            {dailyLog.map(([date, d]) => (
              <div key={date}>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-xs font-medium text-zinc-300">
                    {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-[10px] text-zinc-600">
                    {[d.workout && 'workout', d.meals.length > 0 && `${d.meals.length} meal${d.meals.length !== 1 ? 's' : ''}`]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </div>
                {d.workout && d.workout.exercises.length > 0 && (
                  <div className="mb-2 space-y-0.5 rounded-lg bg-zinc-900 px-3 py-2">
                    {d.workout.exercises.map((ex, i) => (
                      <div key={i} className="flex justify-between gap-3 text-[11px]">
                        <span className="min-w-0 truncate text-zinc-400">{ex.move}</span>
                        <span className="shrink-0 font-mono text-zinc-500">{setsSummary(ex.sets)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {d.meals.length > 0 && (
                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {d.meals.map((m) => (
                      <a key={m.id as string} href={m.photo_url as string} target="_blank" rel="noopener noreferrer" className="shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={m.photo_url as string} alt={(m.note as string) ?? 'Meal'} className="h-14 w-14 rounded-lg object-cover" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Intake form (collapsible) */}
      <div className="mb-8">
        <IntakeView profile={p} />
      </div>

      {/* Reports — demoted to the bottom */}
      <ReportBuilder memberId={params.id} clientName={p.first_name || 'Client'} />

      {reports && reports.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-medium text-zinc-300">Reports</h2>
          <div className="space-y-2">
            {reports.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                <div className="text-sm text-zinc-300">{r.week_label || 'Untitled'}</div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                  r.status === 'sent' ? 'border border-lime-500/40 text-lime-400' : 'border border-zinc-700 text-zinc-500'
                }`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
