import Link from 'next/link'
import { createServiceClient } from '@/lib/ai-supabase'
import { timeAgo, daysSince } from '@/lib/format'
import LogoutButton from './LogoutButton'

export const dynamic = 'force-dynamic'

// Silence threshold: contact rhythm says 4-5 quiet days → coach reaches out.
const SILENT_AFTER_DAYS = 5

type Signal = { lastActivity: string | null; weightKg: number | null }

type DmSignal = {
  client_name: string
  member_id: string | null
  last_message_at: string | null
  last_sender: string | null
  draft_type: string | null
  needs_attention: boolean
  swept_at: string
}

export default async function AiHome() {
  const supabase = createServiceClient()
  const [{ data: clients }, { count: pendingApps }, { data: checkins }, { data: stats }, { data: dmSignals }, { data: workouts }, { data: meals }] =
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
      supabase
        .from('dm_signals')
        .select('client_name, member_id, last_message_at, last_sender, draft_type, needs_attention, swept_at'),
      supabase
        .from('workout_logs')
        .select('member_id, created_at')
        .order('created_at', { ascending: false })
        .limit(300),
      supabase
        .from('meal_logs')
        .select('member_id, created_at')
        .order('created_at', { ascending: false })
        .limit(300),
    ])

  // One pass over all rows, newest first: first row seen per member sets
  // lastActivity; first row with a weight sets weightKg.
  const rows = [
    ...(checkins ?? []),
    ...(stats ?? []),
    ...(workouts ?? []).map((w) => ({ ...w, weight_kg: null })),
    ...(meals ?? []).map((m) => ({ ...m, weight_kg: null })),
  ].sort((a, b) => b.created_at.localeCompare(a.created_at))
  const signals = new Map<string, Signal>()
  for (const row of rows) {
    const id = row.member_id as string
    const s = signals.get(id) ?? { lastActivity: null, weightKg: null }
    s.lastActivity ??= row.created_at
    if (s.weightKg === null && row.weight_kg != null) s.weightKg = Number(row.weight_kg)
    signals.set(id, s)
  }

  const dms = (dmSignals ?? []) as DmSignal[]
  const dmByMember = new Map(dms.filter((d) => d.member_id).map((d) => [d.member_id as string, d]))

  const list = (clients ?? []).map((c) => {
    const s = signals.get(c.id) ?? { lastActivity: null, weightKg: null }
    const dm = dmByMember.get(c.id) ?? null
    // True last contact = newest of portal activity and DM activity.
    const lastContact =
      [s.lastActivity, dm?.last_message_at].filter(Boolean).sort().pop() ?? null
    const silentDays = daysSince(lastContact)
    const needsReply = dm?.draft_type === 'reply'
    return {
      ...c,
      ...s,
      dm,
      lastContact,
      needsReply,
      needsAttention:
        needsReply || lastContact === null || (silentDays !== null && silentDays >= SILENT_AFTER_DAYS),
      silentDays,
    }
  })
  // Needs-reply first, then other attention (stalest on top), then by recency.
  list.sort((a, b) => {
    if (a.needsReply !== b.needsReply) return a.needsReply ? -1 : 1
    if (a.needsAttention !== b.needsAttention) return a.needsAttention ? -1 : 1
    return (b.lastContact ?? '').localeCompare(a.lastContact ?? '')
  })

  const attention = list.filter((c) => c.needsAttention).length
  const dmOnly = dms.filter((d) => !d.member_id)
  const lastSweep = dms.map((d) => d.swept_at).sort().pop() ?? null
  const sweepStaleDays = daysSince(lastSweep)

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
                {c.dm?.last_message_at ? `DM ${timeAgo(c.dm.last_message_at)} · ` : ''}
                {c.lastActivity ? `app ${timeAgo(c.lastActivity)}` : 'no app activity'}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              {c.needsReply ? (
                <span className="rounded-full border border-lime-500/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-lime-400">
                  needs reply
                </span>
              ) : c.needsAttention ? (
                <span className="rounded-full border border-amber-500/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-amber-400">
                  {c.lastContact ? `silent ${c.silentDays}d` : 'new'}
                </span>
              ) : null}
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

      {/* Swept in Roadrunner but not matched to a portal profile */}
      {dmOnly.length > 0 && (
        <div className="mt-8">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-sm font-medium text-zinc-400">DM only</h2>
            <span className="text-xs text-zinc-600">no portal profile</span>
          </div>
          <div className="space-y-2">
            {dmOnly.map((d) => (
              <div
                key={d.client_name}
                className="flex items-center justify-between rounded-xl border border-zinc-800/60 bg-zinc-900/30 px-5 py-3"
              >
                <div>
                  <div className="text-sm text-zinc-300">{d.client_name}</div>
                  <div className="mt-0.5 text-xs text-zinc-600">
                    {d.last_message_at ? `DM ${timeAgo(d.last_message_at)}` : '—'}
                  </div>
                </div>
                {d.draft_type === 'reply' ? (
                  <span className="rounded-full border border-lime-500/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-lime-400">
                    needs reply
                  </span>
                ) : d.needs_attention ? (
                  <span className="rounded-full border border-amber-500/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-amber-400">
                    nudge
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      <Link
        href="/sweep"
        className={`mt-8 block text-center text-[11px] transition hover:text-zinc-300 ${
          lastSweep && (sweepStaleDays ?? 0) >= 2 ? 'text-amber-500' : 'text-zinc-600'
        }`}
      >
        {lastSweep
          ? `DM sweep synced ${timeAgo(lastSweep)}${(sweepStaleDays ?? 0) >= 2 ? ' — run a sweep to refresh' : ''} · view board →`
          : 'DM sweep: no data yet · view board →'}
      </Link>
    </main>
  )
}
