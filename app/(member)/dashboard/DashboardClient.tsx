'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from '@/app/providers'
import { createClient } from '@/utils/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

type StatUpdate = {
  id: string
  weight_kg: number | null
  confidence: number | null
  milestone_text: string | null
  created_at: string
}

type Props = {
  firstName: string | null
  avatarUrl: string | null
  avatarColor: string
  fitnessGoal: string | null
  weightUnit: 'kg' | 'lb'
  recentStats: StatUpdate[]
  hasThread: boolean
  threadId: string | null
  userId: string
  unreadCount: number
  workoutDates: string[]
  milestones: string[]
  referralCode: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDisplay(kg: number, unit: 'kg' | 'lb') {
  return unit === 'lb' ? +(kg * 2.20462).toFixed(1) : +kg.toFixed(1)
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function greetingSubtext(streak: number, daysSinceLast: number | null, fitnessGoal: string | null): string {
  if (streak >= 30) return "You're unstoppable. 30 days and counting."
  if (streak >= 14) return 'Two weeks strong. Keep the momentum going.'
  if (streak >= 7) return "A full week of showing up. That's the work."
  if (streak >= 3) return 'Three days in a row. Momentum is building.'
  if (streak >= 1) return "You showed up. That's the hardest part."
  if (daysSinceLast === null) return fitnessGoal ? `Goal: ${fitnessGoal}` : 'Ready to start your journey?'
  if (daysSinceLast >= 7) return "It's been a while. Today's a fresh start."
  if (daysSinceLast >= 3) return "Time to check back in. You've got this."
  return fitnessGoal ? `Goal: ${fitnessGoal}` : 'Stay consistent. Small steps add up.'
}

function relTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function confidenceLabel(v: number) {
  if (v <= 3) return 'Low'
  if (v <= 5) return 'Mid'
  if (v <= 8) return 'High'
  return 'Peak'
}

function confidenceColor(v: number, dark = false): string {
  if (v <= 3) return dark ? '#f87171' : '#dc2626'
  if (v <= 5) return dark ? '#fbbf24' : '#b45309'
  if (v <= 8) return dark ? '#86efac' : '#16a34a'
  return dark ? '#b0e455' : '#4d8f1a'
}

// ─── Streak ───────────────────────────────────────────────────────────────────

function computeStreak(dates: string[]): number {
  if (!dates.length) return 0
  const dateSet = new Set(dates)
  const toKey = (d: Date) => d.toISOString().split('T')[0]
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let check = new Date(today)
  if (!dateSet.has(toKey(check))) {
    check.setDate(check.getDate() - 1)
    if (!dateSet.has(toKey(check))) return 0
  }
  let streak = 0
  while (dateSet.has(toKey(check))) {
    streak++
    check.setDate(check.getDate() - 1)
  }
  return streak
}

// ─── WeekStrip ────────────────────────────────────────────────────────────────

function WeekStrip({ workoutDates }: { workoutDates: string[] }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toDateString()
  const dayOfWeek = today.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset)

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })

  const loggedSet = new Set(workoutDates.map(iso => {
    const d = new Date(iso)
    d.setHours(0, 0, 0, 0)
    return d.toDateString()
  }))

  const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  return (
    <div className="bg-[var(--c-card)] rounded-2xl p-4 shadow-sm border border-[var(--c-border)]">
      <p className="text-[10px] text-[var(--c-text4)] tracking-wider uppercase mb-3">This Week</p>
      <div className="flex justify-between">
        {weekDays.map((day, i) => {
          const isToday = day.toDateString() === todayStr
          const hasLog = loggedSet.has(day.toDateString())
          const isPast = day < today
          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span className={`text-[10px] font-medium uppercase ${
                isToday ? 'text-[var(--c-accent-text)]' : isPast ? 'text-[var(--c-text4)]' : 'text-[var(--c-text5)]'
              }`}>
                {DAY_LABELS[i]}
              </span>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                isToday ? 'bg-[#b0e455] text-[#0f1a0c]' : isPast ? 'text-[var(--c-text3)]' : 'text-[var(--c-text5)]'
              }`}>
                {day.getDate()}
              </div>
              <div className={`w-1.5 h-1.5 rounded-full ${hasLog ? 'bg-[#b0e455]' : 'bg-transparent'}`} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── ConfidenceRing ───────────────────────────────────────────────────────────

function ConfidenceRing({ value }: { value: number }) {
  const { theme } = useTheme()
  const r = 28
  const circ = 2 * Math.PI * r
  const progress = (value / 10) * circ
  const color = confidenceColor(value, theme === 'dark')
  return (
    <div className="relative w-[72px] h-[72px] flex items-center justify-center">
      <svg viewBox="0 0 72 72" className="absolute inset-0 w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeOpacity="0.12" strokeWidth="5" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${progress} ${circ}`} strokeLinecap="round" />
      </svg>
      <div className="flex flex-col items-center relative z-10">
        <span className="text-xl font-bold leading-none" style={{ color }}>{value}</span>
        <span className="text-[9px] text-[var(--c-text4)] font-medium leading-none mt-0.5">/10</span>
      </div>
    </div>
  )
}

// ─── MiniSparkline ────────────────────────────────────────────────────────────

function MiniSparkline({ stats, unit }: { stats: StatUpdate[]; unit: 'kg' | 'lb' }) {
  const { theme } = useTheme()
  const dark = theme === 'dark'
  const pts = [...stats].reverse().filter(s => s.weight_kg != null).map(s => toDisplay(s.weight_kg!, unit)).slice(-8)
  if (pts.length < 2) return null
  const W = 80, H = 32
  const min = Math.min(...pts), max = Math.max(...pts)
  const range = max - min || 1
  const coords = pts.map((w, i) => ({ x: (i / (pts.length - 1)) * W, y: H - ((w - min) / range) * (H - 8) - 4 }))
  const polyline = coords.map(c => `${c.x},${c.y}`).join(' ')
  const delta = pts[pts.length - 1] - pts[0]
  const color = delta <= 0 ? (dark ? '#b0e455' : '#16a34a') : '#f87171'
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: 80, height: 32 }} className="opacity-80">
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={coords[coords.length - 1].x} cy={coords[coords.length - 1].y} r="2.5" fill={color} />
    </svg>
  )
}

// ─── Badges ───────────────────────────────────────────────────────────────────

const MILESTONE_DEF: Record<string, { label: string; iconPath: string; lightColor: string; darkColor: string }> = {
  first_workout: { label: 'First Workout', iconPath: 'M6.5 6.5h11M6.5 17.5h11M8 12h8', lightColor: '#4d8f1a', darkColor: '#b0e455' },
  first_checkin: { label: 'First Check-in', iconPath: 'M18 20V10M12 20V4M6 20v-6', lightColor: '#16a34a', darkColor: '#86efac' },
  streak_3: { label: '3-Day Streak', iconPath: 'M13 10V3L4 14h7v7l9-11h-7z', lightColor: '#b45309', darkColor: '#fbbf24' },
  streak_7: { label: '7-Day Streak', iconPath: 'M13 10V3L4 14h7v7l9-11h-7z', lightColor: '#ea580c', darkColor: '#f97316' },
  streak_14: { label: '2-Week Streak', iconPath: 'M13 10V3L4 14h7v7l9-11h-7z', lightColor: '#dc2626', darkColor: '#ef4444' },
  streak_30: {
    label: '30-Day Streak',
    iconPath: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
    lightColor: '#4d8f1a', darkColor: '#b0e455',
  },
}

function BadgesSection({ milestones }: { milestones: string[] }) {
  const { theme } = useTheme()
  const dark = theme === 'dark'
  const earned = milestones.filter(m => MILESTONE_DEF[m])
  if (!earned.length) return null
  return (
    <div>
      <p className="text-[10px] text-[var(--c-text4)] tracking-wider uppercase mb-3">Achievements</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {earned.map(type => {
          const def = MILESTONE_DEF[type]
          const color = dark ? def.darkColor : def.lightColor
          return (
            <div key={type} className="shrink-0 flex flex-col items-center gap-1.5 bg-[var(--c-card)] shadow-sm border border-[var(--c-border)] rounded-2xl px-4 py-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: color + '18', border: `1px solid ${color}30` }}>
                <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" className="w-4 h-4">
                  <path d={def.iconPath} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-[9px] text-[var(--c-text3)] whitespace-nowrap font-medium">{def.label}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Referral ─────────────────────────────────────────────────────────────────

function ReferralCard({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const link = `https://zanafitness.com/system?ref=${code}`

  function copy() {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="bg-[var(--c-card)] shadow-sm border border-[var(--c-border)] rounded-2xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-xl bg-[#b0e455]/10 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="#b0e455" strokeWidth="1.8" className="w-4 h-4">
            <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold">Refer a friend</p>
          <p className="text-xs text-[var(--c-text4)]">Share your link. They get access, you get credit.</p>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-[var(--c-bg)] border border-[#b0e455]/10 rounded-xl px-3 py-2">
        <p className="text-xs text-[var(--c-text3)] flex-1 truncate font-mono">{link}</p>
        <button onClick={copy} className="shrink-0 text-[10px] font-semibold text-[var(--c-accent-text)] hover:opacity-75 transition">
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DashboardClient({
  firstName,
  avatarUrl,
  avatarColor,
  fitnessGoal,
  weightUnit,
  recentStats,
  hasThread,
  threadId,
  userId,
  unreadCount: initialUnread,
  workoutDates,
  milestones,
  referralCode,
}: Props) {
  const { theme } = useTheme()
  const dark = theme === 'dark'
  const [unreadCount, setUnreadCount] = useState(initialUnread)

  useEffect(() => {
    if (!threadId) return
    const supabase = createClient()
    const channel = supabase.channel('dashboard-unread')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new as { author_id: string; thread_id: string }
        if (msg.thread_id === threadId && msg.author_id !== userId) {
          setUnreadCount(c => c + 1)
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'message_reads' }, () => {
        setUnreadCount(0)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [threadId, userId]) // eslint-disable-line

  const name = firstName ?? 'there'
  const streak = computeStreak(workoutDates)
  const latest = recentStats[0] ?? null
  const daysSinceLast = latest
    ? Math.floor((Date.now() - new Date(latest.created_at).getTime()) / 86_400_000)
    : null
  const needsUpdate = daysSinceLast === null || daysSinceLast >= 3

  const initials = (firstName ?? '?').slice(0, 1).toUpperCase()
  const weightPts = recentStats.filter(s => s.weight_kg != null)
  const latestWeight = weightPts[0] ? toDisplay(weightPts[0].weight_kg!, weightUnit) : null
  const prevWeight = weightPts[1] ? toDisplay(weightPts[1].weight_kg!, weightUnit) : null
  const weightDelta = latestWeight !== null && prevWeight !== null ? latestWeight - prevWeight : null
  const subtext = greetingSubtext(streak, daysSinceLast, fitnessGoal)

  type QuickAction = { href: string; label: string; sub: string; color: string; badge?: string | null; icon: React.ReactNode }
  const QUICK_ACTIONS: QuickAction[] = [
    {
      href: '/stats',
      label: 'Log Update',
      sub: 'Weight & confidence',
      color: '#b0e455',
      icon: <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" strokeLinejoin="round" />,
    },
    {
      href: '/program',
      label: 'My Program',
      sub: 'Training & nutrition',
      color: '#60a5fa',
      icon: <path d="M9 12h6M9 16h6M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2M9 4a2 2 0 002 2h2a2 2 0 002-2M9 4a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />,
    },
    {
      href: '/messages',
      label: 'Messages',
      sub: !hasThread ? 'Not activated yet' : unreadCount > 0 ? `${unreadCount} new` : 'Chat with coach',
      color: '#c084fc',
      badge: unreadCount > 0 ? (unreadCount > 9 ? '9+' : String(unreadCount)) : null,
      icon: <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z" strokeLinecap="round" strokeLinejoin="round" />,
    },
    {
      href: '/schedule',
      label: 'Schedule',
      sub: 'Book a coaching call',
      color: '#fb923c',
      icon: (
        <>
          <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] flex flex-col lg:pl-52">
        <div className="flex-1 overflow-y-auto pb-28 lg:pb-10">

          {/* ── Gradient hero card ─────────────────────────────────────────────── */}
          <div
            className="relative mx-5 mt-14 lg:mt-6 lg:mx-10 rounded-3xl overflow-hidden p-6 lg:p-7"
            style={{ background: 'linear-gradient(145deg, #cbf14e 0%, #b0e455 45%, #87be2a 100%)' }}
          >
            {/* Radial glow */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(ellipse at 10% 90%, rgba(255,255,255,0.25) 0%, transparent 55%)' }} />

            {/* Top row */}
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm text-[#1a3300]/55 font-medium" suppressHydrationWarning>{greeting()},</p>
                <h1 className="text-3xl lg:text-4xl font-bold text-[#1a3300] tracking-tight leading-tight mt-0.5">{name}.</h1>
                <p className="text-xs text-[#1a3300]/55 mt-1.5 max-w-[210px] leading-relaxed">{subtext}</p>
              </div>
              <Link href="/profile" className="active:scale-95 transition-transform">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile"
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-white/45 shadow-md" />
                ) : (
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-base font-bold border-2 border-white/45 shadow-md"
                    style={{ backgroundColor: 'rgba(255,255,255,0.30)', color: '#1a3300' }}
                  >
                    {initials}
                  </div>
                )}
              </Link>
            </div>

            {/* Stat pills */}
            <div className="flex gap-2 mt-5 relative z-10 flex-wrap">
              <div className="bg-white/30 backdrop-blur-sm rounded-2xl px-3.5 py-2.5">
                <p className="text-[9px] text-[#1a3300]/50 font-semibold uppercase tracking-wider">Streak</p>
                <p className="text-xl font-bold text-[#1a3300] leading-none mt-0.5">{streak}</p>
                <p className="text-[9px] text-[#1a3300]/45 mt-0.5">{streak === 1 ? 'day' : 'days'}</p>
              </div>

              {latestWeight !== null && (
                <div className="bg-white/30 backdrop-blur-sm rounded-2xl px-3.5 py-2.5">
                  <p className="text-[9px] text-[#1a3300]/50 font-semibold uppercase tracking-wider">Weight</p>
                  <p className="text-xl font-bold text-[#1a3300] leading-none mt-0.5">{latestWeight}</p>
                  <p className="text-[9px] text-[#1a3300]/45 mt-0.5">{weightUnit}</p>
                </div>
              )}

              {latest?.confidence !== null && latest?.confidence !== undefined && (
                <div className="bg-white/30 backdrop-blur-sm rounded-2xl px-3.5 py-2.5">
                  <p className="text-[9px] text-[#1a3300]/50 font-semibold uppercase tracking-wider">Vibe</p>
                  <p className="text-xl font-bold text-[#1a3300] leading-none mt-0.5">{latest.confidence}</p>
                  <p className="text-[9px] text-[#1a3300]/45 mt-0.5">/10</p>
                </div>
              )}

              <div className="ml-auto flex items-end">
                <Link href="/stats"
                  className="bg-white/30 hover:bg-white/45 active:scale-95 transition-all rounded-2xl px-4 py-2.5 flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#1a3300" strokeWidth="2.5" className="w-3.5 h-3.5">
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                  </svg>
                  <span className="text-xs font-bold text-[#1a3300]">Log</span>
                </Link>
              </div>
            </div>
          </div>

          {/* ── Content ────────────────────────────────────────────────────────── */}
          <div className="px-5 lg:px-10 space-y-3 pt-4 pb-4">

            {/* Week strip */}
            <WeekStrip workoutDates={workoutDates} />

            {/* Check-in nudge */}
            {needsUpdate && (
              <Link href="/stats"
                className="block rounded-2xl p-4 active:scale-[0.99] transition-all overflow-hidden relative"
                style={{ background: 'linear-gradient(135deg, #162211 0%, #1e3515 100%)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#b0e455]/15 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#b0e455" strokeWidth="2" className="w-5 h-5">
                      <path d="M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#b0e455]">
                      {latest ? 'Time for a check-in' : 'Log your first update'}
                    </p>
                    <p className="text-xs text-white/45 mt-0.5">
                      {latest
                        ? <span suppressHydrationWarning>{daysSinceLast === 1 ? '1 day' : `${daysSinceLast} days`} since your last update</span>
                        : 'Track weight, confidence & progress photos'}
                    </p>
                  </div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4 opacity-25 shrink-0">
                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </Link>
            )}

            {/* Latest check-in detail (if recent) */}
            {latest && !needsUpdate && (
              <div className="bg-[var(--c-card)] shadow-sm rounded-2xl p-5 border border-[var(--c-border)]">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs font-semibold text-[var(--c-text3)]">Latest check-in</p>
                    <p className="text-xs text-[var(--c-text4)] mt-0.5" suppressHydrationWarning>{relTime(latest.created_at)}</p>
                  </div>
                  {fitnessGoal && (
                    <span className="text-[10px] bg-[var(--c-accent-text)]/10 border border-[var(--c-border2)] text-[var(--c-accent-text)] px-2.5 py-1 rounded-full font-semibold">
                      {fitnessGoal}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-5 lg:gap-8">
                  {latestWeight !== null && (
                    <div>
                      <p className="text-[10px] text-[var(--c-text4)] uppercase tracking-wider mb-1">Weight</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl lg:text-4xl font-bold tracking-tight">{latestWeight}</span>
                        <span className="text-sm text-[var(--c-text3)]">{weightUnit}</span>
                      </div>
                      {weightDelta !== null && (
                        <p className="text-xs mt-1 font-medium" style={{ color: weightDelta <= 0 ? (dark ? '#86efac' : '#16a34a') : '#f87171' }}>
                          {weightDelta > 0 ? '+' : ''}{weightDelta.toFixed(1)} {weightUnit}
                        </p>
                      )}
                    </div>
                  )}
                  {latest.confidence !== null && (
                    <div className="ml-2">
                      <p className="text-[10px] text-[var(--c-text4)] uppercase tracking-wider mb-2">Confidence</p>
                      <ConfidenceRing value={latest.confidence} />
                      <p className="text-xs mt-1.5 font-medium text-center" style={{ color: confidenceColor(latest.confidence, dark) }}>
                        {confidenceLabel(latest.confidence)}
                      </p>
                    </div>
                  )}
                  <div className="ml-auto self-end pb-1">
                    <MiniSparkline stats={recentStats} unit={weightUnit} />
                  </div>
                </div>
                {latest.milestone_text && (
                  <div className="mt-4 pt-4 border-t border-[var(--c-border)]">
                    <p className="text-xs text-[var(--c-text3)] italic leading-relaxed">"{latest.milestone_text}"</p>
                  </div>
                )}
              </div>
            )}

            {/* Quick actions — iOS list style */}
            <div>
              <p className="text-[10px] text-[var(--c-text4)] tracking-wider uppercase mb-3">Quick Actions</p>
              <div className="bg-[var(--c-card)] shadow-sm rounded-2xl overflow-hidden border border-[var(--c-border)]">
                {QUICK_ACTIONS.map((action, i) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className={`flex items-center gap-3.5 px-4 py-3.5 hover:bg-[var(--c-hover)] active:bg-[var(--c-hover)] transition-colors ${i > 0 ? 'border-t border-[var(--c-border)]' : ''}`}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: action.color + '18' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke={action.color} strokeWidth="2" className="w-5 h-5">
                        {action.icon}
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--c-text)]">{action.label}</p>
                      <p className="text-xs text-[var(--c-text4)] mt-0.5 truncate">{action.sub}</p>
                    </div>
                    {action.badge && (
                      <span className="min-w-[20px] h-5 rounded-full bg-[#b0e455] text-[#0f1a0c] text-[10px] font-bold flex items-center justify-center px-1 shrink-0">
                        {action.badge}
                      </span>
                    )}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-[var(--c-text5)] shrink-0">
                      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent history */}
            {recentStats.length > 1 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] text-[var(--c-text4)] tracking-wider uppercase">Recent</p>
                  <Link href="/stats" className="text-xs text-[var(--c-accent-text)] font-semibold">See all →</Link>
                </div>
                <div className="bg-[var(--c-card)] shadow-sm rounded-2xl overflow-hidden border border-[var(--c-border)]">
                  {recentStats.slice(1, 4).map((s, i) => {
                    const d = new Date(s.created_at)
                    const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    return (
                      <div key={s.id} className={`flex items-center gap-4 px-4 py-3 ${i > 0 ? 'border-t border-[var(--c-border)]' : ''}`}>
                        <p className="text-xs text-[var(--c-text4)] w-14 shrink-0 font-medium">{formatted}</p>
                        {s.weight_kg !== null && (
                          <p className="text-sm font-semibold">{toDisplay(s.weight_kg, weightUnit)} {weightUnit}</p>
                        )}
                        {s.confidence !== null && (
                          <p className="text-sm font-semibold ml-auto" style={{ color: confidenceColor(s.confidence, dark) }}>
                            {s.confidence}/10
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Badges */}
            <BadgesSection milestones={milestones} />

            {/* Referral */}
            {referralCode && <ReferralCard code={referralCode} />}

          </div>
        </div>
    </div>
  )
}
