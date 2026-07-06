'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import WorkoutHistory, { type WorkoutLogRecord } from '@/components/WorkoutHistory'
import { computeStreak, localDateKey } from '@/lib/workout-notes'

export default function WorkoutsClient({ logs }: { logs: WorkoutLogRecord[] }) {
  // Day math happens in the browser — the client's calendar, not the server's.
  const [stats, setStats] = useState<{ week: number; streak: number; todayLogged: boolean } | null>(null)
  useEffect(() => {
    const dates = logs.map(l => l.logged_date)
    const weekAgo = localDateKey(new Date(Date.now() - 6 * 86_400_000))
    setStats({
      week: dates.filter(d => d >= weekAgo).length,
      streak: computeStreak(dates),
      todayLogged: dates.includes(localDateKey()),
    })
  }, [logs])

  return (
    <main className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] pb-24 lg:pb-8 lg:pl-52">
      <div className="px-5 pt-8 pb-6 max-w-2xl mx-auto w-full">
        <p className="text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono mb-2">Workouts</p>
        <h1 className="font-display text-3xl leading-none mb-6">Your training log.</h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-2xl p-4">
            <p className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-widest">This week</p>
            <p className="text-2xl font-bold text-[var(--c-text)] mt-1">{stats?.week ?? '–'}</p>
            <p className="text-[10px] text-[var(--c-text4)] mt-0.5">workouts</p>
          </div>
          <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-2xl p-4">
            <p className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-widest">Streak</p>
            <p className="text-2xl font-bold text-[var(--c-accent-text)] mt-1">{stats?.streak ?? '–'}</p>
            <p className="text-[10px] text-[var(--c-text4)] mt-0.5">days</p>
          </div>
          <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-2xl p-4">
            <p className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-widest">Total</p>
            <p className="text-2xl font-bold text-[var(--c-text)] mt-1">{logs.length}</p>
            <p className="text-[10px] text-[var(--c-text4)] mt-0.5">logged</p>
          </div>
        </div>

        {/* CTA when today is still open */}
        {stats && !stats.todayLogged && (
          <Link
            href="/program?log=split"
            className="flex items-center justify-center gap-2 bg-[#b0e455] text-[#0f1a0c] py-3.5 rounded-2xl text-sm font-semibold hover:bg-[#c9f070] transition mb-2"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            Log today&apos;s workout
          </Link>
        )}

        {logs.length > 0 ? (
          <WorkoutHistory logs={logs} limit={60} heading={null} />
        ) : (
          <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-2xl p-8 text-center mt-4">
            <p className="text-sm text-[var(--c-text3)] leading-relaxed">
              No workouts yet.<br />Your first logged session will show up here.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
