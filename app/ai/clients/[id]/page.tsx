import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/ai-supabase'
import { fetchClientContext } from '@/lib/client-context'
import ReportBuilder from './ReportBuilder'
import Notebook from './Notebook'
import IntakeView from './IntakeView'

export const dynamic = 'force-dynamic'

export default async function ClientPage({ params }: { params: { id: string } }) {
  const supabase = createServiceClient()
  const ctx = await fetchClientContext(supabase, params.id)
  if (!ctx) notFound()

  const [{ data: reports }, { data: allNotes }] = await Promise.all([
    supabase
      .from('reports')
      .select('id, week_label, status, created_at')
      .eq('member_id', params.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('coach_notes')
      .select('id, body, created_at')
      .eq('member_id', params.id)
      .order('created_at', { ascending: false }),
  ])

  const p = ctx.profile
  const c = ctx.latestCheckin

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/" className="text-xs text-zinc-500 transition hover:text-zinc-300">← Clients</Link>

      <header className="mt-4 mb-8">
        <h1 className="text-2xl font-medium text-zinc-100">{p.first_name || 'Unnamed'}</h1>
        <p className="text-xs text-zinc-500">{p.email}{p.tier === 'vip' ? ' · VIP' : ''}</p>
      </header>

      {/* Context snapshot */}
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="mb-2 text-[10px] uppercase tracking-wider text-zinc-500">Goal</div>
          <p className="text-sm text-zinc-200">{(p.mirror_goal as string) || '—'}</p>
          {ctx.okr && (
            <p className="mt-2 text-xs text-zinc-400"><span className="text-lime-400">OKR:</span> {ctx.okr.objective}</p>
          )}
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="mb-2 text-[10px] uppercase tracking-wider text-zinc-500">Latest check-in</div>
          {c ? (
            <p className="text-sm text-zinc-300">
              Morale {String(c.morale ?? '–')}/10 · Sleep {String(c.rating_sleep ?? '–')} · Energy {String(c.rating_energy ?? '–')} · Nutrition {String(c.rating_nutrition_adherence ?? '–')} · Workouts {String(c.rating_workout_adherence ?? '–')}
            </p>
          ) : (
            <p className="text-sm text-zinc-500">No check-ins yet.</p>
          )}
        </div>
      </div>

      {/* Intake form (collapsible) */}
      <div className="mb-4">
        <IntakeView profile={p} />
      </div>

      {/* Meeting notes notebook */}
      <div className="mb-8">
        <Notebook memberId={params.id} initialNotes={(allNotes ?? []) as { id: string; body: string; created_at: string }[]} />
      </div>

      {/* Report generator */}
      <ReportBuilder memberId={params.id} clientName={p.first_name || 'Client'} />

      {/* Existing reports */}
      {reports && reports.length > 0 && (
        <section className="mt-10">
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
