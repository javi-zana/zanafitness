'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { computeStreak, localDateKey } from '@/lib/workout-notes'

// "Today" is the CLIENT's calendar day — computed in the browser, never on the
// server (Vercel runs UTC; a 7am Manila render would call it yesterday).
export default function TodayWorkout({ dates }: { dates: string[] }) {
  const [state, setState] = useState<{ logged: boolean; streak: number } | null>(null)
  useEffect(() => {
    setState({ logged: dates.includes(localDateKey()), streak: computeStreak(dates) })
  }, [dates])

  if (state?.logged) {
    return (
      <Link
        href="/workouts"
        className="flex items-center gap-3 bg-[#b0e455]/8 border border-[#b0e455]/40 rounded-2xl p-4 transition hover:bg-[#b0e455]/12 group"
      >
        <div className="w-10 h-10 rounded-xl bg-[#b0e455] flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="#0f1a0c" strokeWidth="2.5" className="w-5 h-5">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--c-accent-text)]">Workout logged today</p>
          <p className="text-[11px] text-[var(--c-text3)] mt-0.5">
            {state.streak > 0 ? `${state.streak} day streak — keep it rolling` : 'Nice work'}
          </p>
        </div>
        <span className="text-[var(--c-text4)] text-sm transition-transform group-hover:translate-x-0.5">→</span>
      </Link>
    )
  }

  return (
    <Link
      href="/program?log=split"
      className="flex items-center gap-3 bg-[#b0e455] rounded-2xl p-4 transition hover:bg-[#c9f070] group"
    >
      <div className="w-10 h-10 rounded-xl bg-[#0f1a0c]/10 flex items-center justify-center shrink-0">
        <svg viewBox="0 0 24 24" fill="none" stroke="#0f1a0c" strokeWidth="2" className="w-5 h-5">
          <path d="M6 5v14M10 8l4 4-4 4M14 5v14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[#0f1a0c]">Log today&apos;s workout</p>
        <p className="text-[11px] text-[#0f1a0c]/70 mt-0.5">
          {state && state.streak > 0 ? `Don't break the ${state.streak} day streak` : 'Pick your session and go'}
        </p>
      </div>
      <span className="text-[#0f1a0c]/60 text-sm transition-transform group-hover:translate-x-0.5">→</span>
    </Link>
  )
}
