'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ActivityCard, type ActivityWithDetails } from '@/components/ActivityCard'
import { useActivityRealtime } from '@/utils/use-activity-realtime'

function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0
  const set = new Set(dates)
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 60; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (set.has(key)) streak++
    else if (i > 0) break
  }
  return streak
}

const MILESTONES: { type: string; label: string; emoji: string }[] = [
  { type: 'first_log',      label: 'First log',      emoji: '🎯' },
  { type: 'streak_7',       label: '7-day streak',   emoji: '🔥' },
  { type: 'streak_30',      label: '30-day streak',  emoji: '⚡' },
  { type: 'first_workout',  label: 'First workout',  emoji: '🏋️' },
  { type: 'first_win',      label: 'First win',      emoji: '🏆' },
  { type: 'first_meal',     label: 'First meal log', emoji: '🍽️' },
]

export default function DashboardClient({
  userId,
  firstName,
  avatarUrl,
  avatarColor,
  activities,
  activeDates,
  milestones,
  referralCode,
  unreadCount,
}: {
  userId: string
  firstName: string | null
  avatarUrl: string | null
  avatarColor: string
  activities: ActivityWithDetails[]
  activeDates: string[]
  milestones: string[]
  referralCode: string | null
  unreadCount: number
}) {
  const [referralCopied, setReferralCopied] = useState(false)

  const { activities: liveActivities, mutate, remove } = useActivityRealtime({
    initial: activities,
    memberIds: [userId],
    authorMap: {},
  })

  // Derive streak from live activities so it stays in sync after posting
  const liveActiveDates = Array.from(new Set([
    ...activeDates,
    ...liveActivities.map(a => a.created_at.split('T')[0]),
  ]))
  const streak = computeStreak(liveActiveDates)
  const initials = (firstName ?? 'M').charAt(0).toUpperCase()
  const earned = new Set(milestones)

  function copyReferral() {
    if (!referralCode) return
    const url = `${window.location.origin}/?ref=${referralCode}`
    navigator.clipboard.writeText(url).then(() => {
      setReferralCopied(true)
      setTimeout(() => setReferralCopied(false), 1500)
    })
  }

  return (
    <main className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] pb-24 lg:pb-8 lg:pl-52">
      <div className="px-5 pt-8 pb-6 max-w-2xl mx-auto w-full space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono mb-2">Home</p>
            <h1 className="font-display text-3xl leading-none">
              Hey{firstName ? `, ${firstName}` : ''}.
            </h1>
          </div>
          <Link
            href="/profile"
            className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold shrink-0"
            style={{ backgroundColor: avatarColor, color: '#0f1a0c' }}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </Link>
        </div>

        {/* Streak + Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-2xl p-4">
            <p className="text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono mb-1">Active Streak</p>
            <p className="font-display text-3xl leading-none">{streak}</p>
            <p className="text-[10px] text-[var(--c-text4)] mt-1">{streak === 1 ? 'day' : 'days'}</p>
          </div>
          <Link
            href="/stats"
            className="bg-[#b0e455] text-[#0f1a0c] rounded-2xl p-4 flex flex-col justify-between hover:bg-[#c9f070] transition"
          >
            <p className="text-[10px] tracking-widest uppercase font-mono opacity-70">Log</p>
            <div>
              <p className="font-display text-2xl leading-none">+ Activity</p>
              <p className="text-[10px] opacity-70 mt-1">Workout · Win · Meal</p>
            </div>
          </Link>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/program" className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-2xl p-4 hover:bg-[var(--c-hover)] transition flex items-center gap-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5 text-[var(--c-text3)]">
              <path d="M9 12h6M9 16h6M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2M9 4a2 2 0 002 2h2a2 2 0 002-2M9 4a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-sm font-semibold">Program</p>
          </Link>
          <Link href="/messages" className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-2xl p-4 hover:bg-[var(--c-hover)] transition flex items-center gap-3 relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5 text-[var(--c-text3)]">
              <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-sm font-semibold">Messages</p>
            {unreadCount > 0 && (
              <span className="absolute top-3 right-3 w-2 h-2 bg-[#f87171] rounded-full" />
            )}
          </Link>
        </div>

        {/* Recent feed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono">Your Activity</p>
            {activities.length > 0 && (
              <Link href="/stats" className="text-[10px] text-[var(--c-accent-text)] tracking-widest uppercase font-mono hover:opacity-75 transition">
                View all →
              </Link>
            )}
          </div>
          {liveActivities.length === 0 ? (
            <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-2xl p-6 text-center">
              <p className="text-sm text-[var(--c-text3)] leading-relaxed">
                Nothing posted yet.<br />
                Hit <Link href="/stats" className="text-[var(--c-accent-text)] font-semibold">+ Activity</Link> to share your first update.
              </p>
            </div>
          ) : (
            liveActivities.slice(0, 5).map(a => (
              <ActivityCard
                key={a.id}
                activity={a}
                currentUserId={userId}
                onMutate={mutate}
                onDelete={remove}
              />
            ))
          )}
        </div>

        {/* Achievements */}
        {milestones.length > 0 && (
          <div>
            <p className="text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono mb-3">Achievements</p>
            <div className="grid grid-cols-3 gap-2">
              {MILESTONES.map(m => {
                const got = earned.has(m.type)
                return (
                  <div key={m.type} className={`rounded-2xl p-3 text-center border ${
                    got ? 'bg-[var(--c-card)] border-[var(--c-border)]' : 'bg-transparent border-[var(--c-border)] opacity-40'
                  }`}>
                    <p className="text-2xl mb-1">{m.emoji}</p>
                    <p className="text-[9px] uppercase tracking-wide font-mono text-[var(--c-text3)]">{m.label}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Referral */}
        {referralCode && (
          <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-2xl p-4">
            <p className="text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono mb-2">Refer a Friend</p>
            <p className="text-xs text-[var(--c-text3)] leading-relaxed mb-3">
              Send your code. Earn rewards when they join.
            </p>
            <div className="flex items-center gap-2 bg-[var(--c-bg)] border border-[var(--c-border)] rounded-lg px-3 py-2.5">
              <p className="flex-1 text-sm font-mono font-bold text-[var(--c-text)] truncate">{referralCode}</p>
              <button
                type="button"
                onClick={copyReferral}
                className="text-[10px] font-mono tracking-widest uppercase text-[var(--c-accent-text)] hover:opacity-75 transition"
              >
                {referralCopied ? 'Copied' : 'Copy link'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
