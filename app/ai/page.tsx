import Link from 'next/link'
import { createServiceClient } from '@/lib/ai-supabase'
import { timeAgo, daysSince } from '@/lib/format'
import LogoutButton from './LogoutButton'

export const dynamic = 'force-dynamic'

// Silence threshold: contact rhythm says 4-5 quiet days → coach reaches out.
const SILENT_AFTER_DAYS = 5

type Signal = { lastActivity: string | null; weightKg: number | null }

export default async function AiHome() {
  const supabase = createServiceClient()
  const [{ data: clients }, { count: pendingApps }, { data: checkins }, { data: stats }] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('id, first_name, email, tier')
        .eq('role', 'member')
        .order('first_name', { ascending: true }),
      supabase
        .from('applications')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
      // ponytail: small roster — grab recent rows and reduce in JS, no group-by
      supabase
        .from('weekly_checkins')
        .select('member_id, created_at, weight_kg')
        .order('created_at', { ascending: false })
        .limit(300),
      supabase
        .from('stat_updates')
        .select('member_id, created_at, weight_kg')
        .order('created_at', { ascending: false })
        .limit(300),
    ])

  // One pass over all rows, newest first: first row seen per member sets
  // lastActivity; first row with a weight sets weightKg.
  const rows = [...(checkins ?? []), ...(stats ?? [])].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  )
  const signals = new Map<string, Signal>()
  for (const row of rows) {
    const id = row.member_id as string
    const s = signals.get(id) ?? { lastActivity: null, weightKg: null }
    s.lastActivity ??= row.created_at
    if (s.weightKg === null && row.weight_kg != null) s.weightKg = Number(row.weight_kg)
    signals.set(id, s)
  }

  const list = (clients ?? []).map((c) => {
    const s = signals.get(c.id) ?? { lastActivity: null, weightKg: null }
    const silentDays = daysSince(s.lastActivity)
    return {
      ...c,
      ...s,
      needsAttention: s.lastActivity === null || (silentDays !== null && silentDays >= SILENT_AFTER_DAYS),
      silentDays,
    }
  })
  // Needs-attention first (stalest on top), then active ones by recency.
  list.sort((a, b) => {
    if (a.needsAttention !== b.needsAttention) return a.needsAttention ? -1 : 1
    return (b.lastActivity ?? '').localeCompare(a.lastActivity ?? '')
  })

  const attention = list.filter((c) => c.needsAttention).length

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 flex items-center justify-between sm:mb-10">
        <div>
          <div className="text-sm font-semibold tracking-[0.2em] text-lime-400">ZANA</div>
          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">internal tool</div>
        </div>
        <LogoutButton />
      </header>

      <Link
        href="/applications"
        className="mb-8 flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-4 transition hover:border-zinc-700 hover:bg-zinc-900"
      >
        <div className="text-sm font-medium text-zinc-100">Applications</div>
        <div className="flex items-center gap-3">
          {(pendingApps ?? 0) > 0 && (
            <span className="rounded-full bg-lime-400 px-2 py-0.5 text-[11px] font-bold text-lime-950">
              {pendingApps} new
            </span>
          )}
          <span className="text-zinc-600">→</span>
        </div>
      </Link>

      <div className="mb-3 flex items-baseline justify-between">
        <h1 className="text-lg font-medium text-zinc-100">Clients</h1>
        <span className="text-xs text-zinc-500">
          {attention > 0 ? `${attention} need attention · ` : ''}
          {list.length}
        </span>
      </div>

      <div className="space-y-2">
        {list.map((c) => (
          <Link
            key={c.id}
            href={`/clients/${c.id}`}
            className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-4 transition hover:border-zinc-700 hover:bg-zinc-900"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-zinc-100">{c.first_name || 'Unnamed'}</span>
                {c.tier === 'vip' && (
                  <span className="rounded-full border border-lime-500/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-lime-400">
                    VIP
                  </span>
                )}
              </div>
              <div className="mt-0.5 truncate text-xs text-zinc-500">
                {c.weightKg != null ? `${c.weightKg.toFixed(1)} kg · ` : ''}
                {c.lastActivity ? `active ${timeAgo(c.lastActivity)}` : 'no activity yet'}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              {c.needsAttention && (
                <span className="rounded-full border border-amber-500/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-amber-400">
                  {c.lastActivity ? `silent ${c.silentDays}d` : 'new'}
                </span>
              )}
              <span className="text-zinc-600">→</span>
            </div>
          </Link>
        ))}
        {list.length === 0 && (
          <p className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-8 text-center text-sm text-zinc-500">
            No clients found.
          </p>
        )}
      </div>
    </main>
  )
}
