import Link from 'next/link'
import { createServiceClient } from '@/lib/ai-supabase'
import { timeAgo, daysSince } from '@/lib/format'

export const dynamic = 'force-dynamic'

// Visual of the latest Roadrunner client sweep (dm_signals, pushed from
// push_sweep.py on Javi's Mac). Mirrors the CLI board: needs reply → nudge →
// all caught up, plus next calls.

type Row = {
  client_name: string
  member_id: string | null
  chat_id: string | null
  last_message_at: string | null
  last_sender: string | null
  last_text: string | null
  draft_type: string | null
  needs_attention: boolean
  unread_count: number | null
  next_call: string | null
  swept_at: string
}

function Card({ r }: { r: Row }) {
  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-100">{r.client_name}</span>
            {(r.unread_count ?? 0) > 0 && (
              <span className="rounded-full bg-lime-400 px-1.5 py-0.5 text-[10px] font-bold text-lime-950">
                {r.unread_count}
              </span>
            )}
          </div>
          {r.last_text && (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-400">
              {r.last_sender === 'coach' ? 'you: ' : ''}
              {r.last_text}
            </p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <div className="text-[11px] text-zinc-600">{r.last_message_at ? timeAgo(r.last_message_at) : '—'}</div>
          {r.next_call && !r.next_call.startsWith('unscheduled') && (
            <div className="mt-1 text-[10px] text-zinc-500">call {r.next_call}</div>
          )}
        </div>
      </div>
    </>
  )
  const cls = 'block rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3'
  return r.member_id ? (
    <Link href={`/clients/${r.member_id}`} className={`${cls} transition hover:border-zinc-700 hover:bg-zinc-900`}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  )
}

export default async function SweepPage() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('dm_signals')
    .select('*')
    .order('last_message_at', { ascending: false, nullsFirst: false })

  const rows = (data ?? []) as Row[]
  const lastSweep = rows.map((r) => r.swept_at).sort().pop() ?? null
  const staleDays = daysSince(lastSweep)

  const needsReply = rows.filter((r) => r.needs_attention && r.draft_type === 'reply')
  const nudge = rows.filter((r) => r.needs_attention && r.draft_type !== 'reply')
  const ok = rows.filter((r) => !r.needs_attention)

  const groups: Array<[string, string, Row[]]> = [
    ['Needs reply', 'client spoke last', needsReply],
    ['Quiet — nudge', 'no interaction 4d+', nudge],
    ['All caught up', '', ok],
  ]

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8">
        <Link href="/" className="text-xs text-zinc-500 transition hover:text-zinc-300">← Back</Link>
        <div className="mt-2 flex items-baseline justify-between">
          <h1 className="text-lg font-medium text-zinc-100">Client sweep</h1>
          {lastSweep && (
            <span className={`text-[11px] ${(staleDays ?? 0) >= 2 ? 'text-amber-500' : 'text-zinc-500'}`}>
              synced {timeAgo(lastSweep)}
            </span>
          )}
        </div>
      </header>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-10 text-center">
          <p className="text-sm text-zinc-400">No sweep data yet.</p>
          <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-zinc-600">
            Run <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-zinc-400">python3 clients/bin/push_sweep.py</code> in
            the roadrunner repo (with BEEPER_TOKEN + SWEEP_INGEST_SECRET set) and this board fills in.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map(([title, sub, list]) =>
            list.length === 0 ? null : (
              <section key={title}>
                <div className="mb-3 flex items-baseline justify-between">
                  <h2 className="text-sm font-medium text-zinc-100">
                    {title}
                    {sub && <span className="ml-2 text-[11px] font-normal text-zinc-600">{sub}</span>}
                  </h2>
                  <span className="text-xs text-zinc-500">{list.length}</span>
                </div>
                <div className="space-y-2">
                  {list.map((r) => (
                    <Card key={r.client_name} r={r} />
                  ))}
                </div>
              </section>
            ),
          )}
        </div>
      )}
    </main>
  )
}
