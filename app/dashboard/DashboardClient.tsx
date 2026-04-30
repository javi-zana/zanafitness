'use client'

import Link from 'next/link'
import BottomNav from '@/components/BottomNav'

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
  unreadCount: number
  latestAnnouncement: { id: string; title: string; created_at: string } | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDisplay(kg: number, unit: 'kg' | 'lb') {
  return unit === 'lb' ? +(kg * 2.20462).toFixed(1) : +kg.toFixed(1)
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Morning'
  if (h < 17) return 'Afternoon'
  return 'Evening'
}

function relTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function annRelTime(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

function confidenceLabel(v: number) {
  if (v <= 3) return 'Low'
  if (v <= 5) return 'Mid'
  if (v <= 8) return 'High'
  return 'Peak'
}

function confidenceColor(v: number): string {
  if (v <= 3) return '#f87171'
  if (v <= 5) return '#fbbf24'
  if (v <= 8) return '#86efac'
  return '#b0e455'
}

// ─── WeekStrip ────────────────────────────────────────────────────────────────

function WeekStrip({ stats }: { stats: StatUpdate[] }) {
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

  const loggedSet = new Set(stats.map(s => {
    const d = new Date(s.created_at)
    d.setHours(0, 0, 0, 0)
    return d.toDateString()
  }))

  const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  return (
    <div className="bg-[#162212] rounded-2xl p-4 lg:p-6 border border-[#b0e455]/8">
      <p className="text-[10px] lg:text-xs text-[#edf5e2]/30 tracking-wider uppercase mb-3 lg:mb-5">This Week</p>
      <div className="flex justify-between">
        {weekDays.map((day, i) => {
          const isToday = day.toDateString() === todayStr
          const hasLog = loggedSet.has(day.toDateString())
          const isPast = day < today

          return (
            <div key={i} className="flex flex-col items-center gap-1.5 lg:gap-2">
              <span className={`text-[10px] lg:text-xs font-medium uppercase ${
                isToday ? 'text-[#b0e455]' : isPast ? 'text-[#edf5e2]/30' : 'text-[#edf5e2]/15'
              }`}>
                {DAY_LABELS[i]}
              </span>
              <div className={`w-8 h-8 lg:w-11 lg:h-11 rounded-full flex items-center justify-center text-sm lg:text-base font-semibold ${
                isToday
                  ? 'bg-[#b0e455] text-[#0f1a0c]'
                  : isPast
                  ? 'text-[#edf5e2]/45'
                  : 'text-[#edf5e2]/15'
              }`}>
                {day.getDate()}
              </div>
              <div className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full ${hasLog ? 'bg-[#b0e455]' : 'bg-transparent'}`} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── ConfidenceRing ───────────────────────────────────────────────────────────

function ConfidenceRing({ value }: { value: number }) {
  const r = 28
  const circ = 2 * Math.PI * r
  const progress = (value / 10) * circ
  const color = confidenceColor(value)

  return (
    <div className="relative w-[72px] h-[72px] flex items-center justify-center">
      <svg viewBox="0 0 72 72" className="absolute inset-0 w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeOpacity="0.12" strokeWidth="5" />
        <circle
          cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${progress} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="flex flex-col items-center relative z-10">
        <span className="text-xl font-bold leading-none" style={{ color }}>{value}</span>
        <span className="text-[9px] text-[#edf5e2]/30 font-medium leading-none mt-0.5">/10</span>
      </div>
    </div>
  )
}

// ─── MiniSparkline ────────────────────────────────────────────────────────────

function MiniSparkline({ stats, unit }: { stats: StatUpdate[]; unit: 'kg' | 'lb' }) {
  const pts = [...stats]
    .reverse()
    .filter(s => s.weight_kg != null)
    .map(s => toDisplay(s.weight_kg!, unit))
    .slice(-8)

  if (pts.length < 2) return null

  const W = 80, H = 32
  const min = Math.min(...pts), max = Math.max(...pts)
  const range = max - min || 1
  const coords = pts.map((w, i) => ({
    x: (i / (pts.length - 1)) * W,
    y: H - ((w - min) / range) * (H - 8) - 4,
  }))
  const polyline = coords.map(c => `${c.x},${c.y}`).join(' ')
  const delta = pts[pts.length - 1] - pts[0]
  const color = delta <= 0 ? '#b0e455' : '#f87171'

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: 80, height: 32 }} className="opacity-80">
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={coords[coords.length - 1].x} cy={coords[coords.length - 1].y} r="2.5" fill={color} />
    </svg>
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
  unreadCount,
  latestAnnouncement,
}: Props) {
  const name = firstName ?? 'there'
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

  return (
    <div className="min-h-screen bg-[#0f1a0c] text-[#edf5e2] flex flex-col lg:pl-72">

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-3 lg:px-10 lg:pt-10 lg:pb-5 lg:border-b lg:border-[#b0e455]/8">
        <div>
          <p className="text-xs text-[#edf5e2]/30 tracking-wider uppercase mb-0.5 lg:text-sm">Zana</p>
          <h1 className="text-2xl font-bold tracking-tight lg:text-4xl">
            {greeting()}, {name}.
          </h1>
        </div>
        <Link href="/profile">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-10 h-10 lg:w-14 lg:h-14 rounded-full object-cover border-2 active:scale-95 transition-transform"
              style={{ borderColor: avatarColor + '50' }}
            />
          ) : (
            <div
              className="w-10 h-10 lg:w-14 lg:h-14 rounded-full flex items-center justify-center text-sm lg:text-lg font-bold border-2 transition-transform active:scale-95"
              style={{ color: avatarColor, borderColor: avatarColor + '50', backgroundColor: avatarColor + '18' }}
            >
              {initials}
            </div>
          )}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-24 space-y-4 pt-2 lg:px-10 lg:max-w-4xl lg:pt-8 lg:pb-10 lg:space-y-6">

        {/* Latest announcement */}
        {latestAnnouncement && (
          <Link href="/community" className="block bg-[#b0e455]/8 border border-[#b0e455]/20 rounded-2xl p-4 hover:border-[#b0e455]/35 active:scale-[0.99] transition-all">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#b0e455]/15 flex items-center justify-center shrink-0 mt-0.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="#b0e455" strokeWidth="2" className="w-4 h-4">
                  <path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-[#b0e455] font-semibold uppercase tracking-wider mb-1">Announcement</p>
                <p className="text-sm font-semibold text-[#edf5e2]/90 leading-snug line-clamp-2">
                  {latestAnnouncement.title}
                </p>
                <p className="text-xs text-[#edf5e2]/30 mt-1">{annRelTime(latestAnnouncement.created_at)}</p>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-[#edf5e2]/20 shrink-0 mt-1">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </Link>
        )}

        {/* Week strip */}
        <WeekStrip stats={recentStats} />

        {/* Progress card */}
        {latest ? (
          <div className="bg-[#162212] rounded-2xl p-5 lg:p-8 border border-[#b0e455]/10">
            <div className="flex items-start justify-between mb-4 lg:mb-6">
              <div>
                <p className="text-xs lg:text-sm font-medium text-[#edf5e2]/40">Latest check-in</p>
                <p className="text-xs text-[#edf5e2]/25 mt-0.5">{relTime(latest.created_at)}</p>
              </div>
              {fitnessGoal && (
                <span className="text-[10px] lg:text-xs bg-[#b0e455]/10 border border-[#b0e455]/20 text-[#b0e455] px-2.5 py-1 rounded-full font-medium">
                  {fitnessGoal}
                </span>
              )}
            </div>

            <div className="flex items-center gap-5 lg:gap-10">
              {latestWeight !== null && (
                <div>
                  <p className="text-[10px] lg:text-xs text-[#edf5e2]/35 uppercase tracking-wider mb-1">Weight</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl lg:text-5xl font-bold tracking-tight">{latestWeight}</span>
                    <span className="text-sm lg:text-base text-[#edf5e2]/40">{weightUnit}</span>
                  </div>
                  {weightDelta !== null && (
                    <p className="text-xs lg:text-sm mt-1 font-medium" style={{ color: weightDelta <= 0 ? '#86efac' : '#f87171' }}>
                      {weightDelta > 0 ? '+' : ''}{weightDelta.toFixed(1)} {weightUnit}
                    </p>
                  )}
                </div>
              )}

              {latest.confidence !== null && (
                <div className="ml-2">
                  <p className="text-[10px] lg:text-xs text-[#edf5e2]/35 uppercase tracking-wider mb-2">Confidence</p>
                  <ConfidenceRing value={latest.confidence} />
                  <p className="text-xs mt-1.5 font-medium text-center" style={{ color: confidenceColor(latest.confidence) }}>
                    {confidenceLabel(latest.confidence)}
                  </p>
                </div>
              )}

              <div className="ml-auto self-end pb-1">
                <MiniSparkline stats={recentStats} unit={weightUnit} />
              </div>
            </div>

            {latest.milestone_text && (
              <div className="mt-4 lg:mt-6 pt-4 lg:pt-6 border-t border-[#b0e455]/8">
                <p className="text-xs lg:text-sm text-[#edf5e2]/45 italic leading-relaxed">
                  "{latest.milestone_text}"
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#162212] rounded-2xl p-6 border border-[#b0e455]/15 text-center">
            <div className="w-12 h-12 rounded-full bg-[#b0e455]/10 border border-[#b0e455]/20 flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="#b0e455" strokeWidth="1.5" className="w-6 h-6">
                <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-[#edf5e2]/80 mb-1">No check-ins yet</p>
            <p className="text-xs text-[#edf5e2]/35 mb-5">Log your first update to start tracking progress.</p>
            <Link
              href="/stats"
              className="inline-block bg-[#b0e455] text-[#0f1a0c] text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#c9f070] transition-colors"
            >
              Log First Update
            </Link>
          </div>
        )}

        {/* Check-in nudge */}
        {needsUpdate && latest && (
          <Link href="/stats" className="block bg-[#b0e455]/8 border border-[#b0e455]/20 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#b0e455]/15 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="#b0e455" strokeWidth="2" className="w-4 h-4">
                  <path d="M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#b0e455]">Time to check in</p>
                <p className="text-xs text-[#edf5e2]/40">
                  {daysSinceLast === 1 ? '1 day' : `${daysSinceLast} days`} since your last update
                </p>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-[#edf5e2]/25 shrink-0">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </Link>
        )}

        {/* Quick actions */}
        <div>
          <p className="text-[10px] lg:text-xs text-[#edf5e2]/30 tracking-wider uppercase mb-3">Quick Actions</p>
          <div className="grid grid-cols-2 gap-3 lg:gap-4">

            <Link href="/stats" className="bg-[#1c2e16] border border-[#b0e455]/8 rounded-2xl p-4 flex flex-col gap-3 hover:border-[#b0e455]/25 active:scale-[0.98] transition-all">
              <div className="w-9 h-9 rounded-xl bg-[#b0e455]/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="#b0e455" strokeWidth="2" className="w-5 h-5">
                  <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold">Log Update</p>
                <p className="text-xs text-[#edf5e2]/35 mt-0.5">Weight & confidence</p>
              </div>
            </Link>

            <Link href="/program" className="bg-[#1c2e16] border border-[#b0e455]/8 rounded-2xl p-4 flex flex-col gap-3 hover:border-[#b0e455]/25 active:scale-[0.98] transition-all">
              <div className="w-9 h-9 rounded-xl bg-[#b0e455]/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="#b0e455" strokeWidth="2" className="w-5 h-5">
                  <path d="M9 12h6M9 16h6M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2M9 4a2 2 0 002 2h2a2 2 0 002-2M9 4a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold">My Program</p>
                <p className="text-xs text-[#edf5e2]/35 mt-0.5">Training & nutrition</p>
              </div>
            </Link>

            <Link
              href="/messages"
              className="bg-[#1c2e16] border border-[#b0e455]/8 rounded-2xl p-4 flex flex-col gap-3 hover:border-[#b0e455]/25 active:scale-[0.98] transition-all relative"
            >
              {unreadCount > 0 && (
                <span className="absolute top-3 right-3 min-w-[20px] h-5 rounded-full bg-[#b0e455] text-[#0f1a0c] text-[10px] font-bold flex items-center justify-center px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              <div className="w-9 h-9 rounded-xl bg-[#b0e455]/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="#b0e455" strokeWidth="2" className="w-5 h-5">
                  <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold">Messages</p>
                <p className="text-xs text-[#edf5e2]/35 mt-0.5">
                  {!hasThread ? 'Not activated yet' : unreadCount > 0 ? `${unreadCount} new` : 'Chat with coach'}
                </p>
              </div>
            </Link>

            <Link href="/schedule" className="bg-[#1c2e16] border border-[#b0e455]/8 rounded-2xl p-4 flex flex-col gap-3 hover:border-[#b0e455]/25 active:scale-[0.98] transition-all">
              <div className="w-9 h-9 rounded-xl bg-[#b0e455]/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="#b0e455" strokeWidth="2" className="w-5 h-5">
                  <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold">Schedule</p>
                <p className="text-xs text-[#edf5e2]/35 mt-0.5">Book coaching call</p>
              </div>
            </Link>

          </div>
        </div>

        {/* Recent history */}
        {recentStats.length > 1 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] text-[#edf5e2]/30 tracking-wider uppercase">Recent</p>
              <Link href="/stats" className="text-xs text-[#b0e455] font-medium">See all</Link>
            </div>
            <div className="space-y-2">
              {recentStats.slice(1, 4).map(s => {
                const d = new Date(s.created_at)
                const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                return (
                  <div key={s.id} className="flex items-center gap-4 bg-[#162212] rounded-xl px-4 py-3 border border-[#b0e455]/6">
                    <p className="text-xs text-[#edf5e2]/30 w-14 shrink-0 font-medium">{formatted}</p>
                    {s.weight_kg !== null && (
                      <p className="text-sm font-semibold">{toDisplay(s.weight_kg, weightUnit)} {weightUnit}</p>
                    )}
                    {s.confidence !== null && (
                      <p className="text-sm font-semibold ml-auto" style={{ color: confidenceColor(s.confidence) }}>
                        {s.confidence}/10
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Community */}
        <Link href="/community" className="block bg-[#162212] border border-[#b0e455]/8 rounded-2xl p-4 hover:border-[#b0e455]/20 active:scale-[0.99] transition-all">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#b0e455]/10 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="#b0e455" strokeWidth="2" className="w-5 h-5">
                <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Community</p>
              <p className="text-xs text-[#edf5e2]/35 mt-0.5">Announcements & posts</p>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-[#edf5e2]/20 shrink-0">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </Link>

      </div>

      <BottomNav />
    </div>
  )
}
