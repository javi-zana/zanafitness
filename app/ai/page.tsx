import Link from 'next/link'
import { createServiceClient } from '@/lib/ai-supabase'
import LogoutButton from './LogoutButton'

export const dynamic = 'force-dynamic'

export default async function AiHome() {
  const supabase = createServiceClient()
  const { data: clients } = await supabase
    .from('profiles')
    .select('id, first_name, email, tier')
    .eq('role', 'member')
    .order('first_name', { ascending: true })

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold tracking-[0.2em] text-lime-400">ZANA</div>
          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">internal tool</div>
        </div>
        <LogoutButton />
      </header>

      <div className="mb-3 flex items-baseline justify-between">
        <h1 className="text-lg font-medium text-zinc-100">Clients</h1>
        <span className="text-xs text-zinc-500">{clients?.length ?? 0}</span>
      </div>

      <div className="space-y-2">
        {(clients ?? []).map((c) => (
          <Link
            key={c.id}
            href={`/clients/${c.id}`}
            className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-4 transition hover:border-zinc-700 hover:bg-zinc-900"
          >
            <div className="min-w-0">
              <div className="text-sm font-medium text-zinc-100">{c.first_name || 'Unnamed'}</div>
              <div className="truncate text-xs text-zinc-500">{c.email}</div>
            </div>
            <div className="flex items-center gap-3">
              {c.tier === 'vip' && (
                <span className="rounded-full border border-lime-500/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-lime-400">
                  VIP
                </span>
              )}
              <span className="text-zinc-600">→</span>
            </div>
          </Link>
        ))}
        {(!clients || clients.length === 0) && (
          <p className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-8 text-center text-sm text-zinc-500">
            No clients found.
          </p>
        )}
      </div>
    </main>
  )
}
