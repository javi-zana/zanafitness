'use client'

import Link from 'next/link'
import BottomNav from '@/components/BottomNav'

type StatUpdate = {
  id: string
  weight_kg: number | null
  confidence: number | null
  milestone_text: string | null
  created_at: string
}

type Props = {
  firstName: string | null
  avatarColor: string
  fitnessGoal: string | null
  weightUnit: 'kg' | 'lb'
  recentStats: StatUpdate[]
  hasThread: boolean
  unreadCount: number
}

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

function MiniSparkline({ stats, unit }: { stats: StatUpdate[]; unit: 'kg' | 'lb' }) {
  const pts = [...stats]
    .reverse()
    .filter(s => s.weight_kg != null)
    .map(s => toDisplay(s.weight_kg!, unit))
    .slice(-8)

  if (pts.length < 2) return null

  const W = 72, H = 28
  const min = Math.min(...pts), max = Math.max(...pts)
  const range = max - min || 1
  const coords = pts.map((w, i) => ({
    x: (i / (pts.length - 1)) * W,
    y: H - ((w - min) / range) * (H - 6) - 3,
  }))
  const polyline = coords.map(c => `${c.x},${c.y}`).join(' ')
  const delta = pts[pts.length - 1] - pts[0]
  const color = delta <= 0 ? '#b0e455' : '#f87171'

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: 72, height: 28 }} className="opacity-80">
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle
        cx={coords[coords.length - 1].x}
        cy={coords[coords.length - 1].y}
        r="2.5"
        fill={color}
      />
    </svg>
  )
}

export default function DashboardClient({
  firstName,
  avatarColor,
  fitnessGoal,
  weightUnit,
  recentStats,
  hasThread,
  unreadCount,
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
    <div className="min-h-screen bg-[#0f1a0c] text-[#edf5e2] flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-3">
        <div>
          <p className="text-xs text-[#edf5e2]/30 tracking-wider uppercase mb-0.5">Zana</p>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting()}, {name}.
          </h1>
        </div>
        <Link href="/profile">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-transform active:scale-95"
            style={{
              color: avatarColor,
              borderColor: avatarColor + '50',
              backgroundColor: avatarColor + '18',
            }}
          >
            {initials}
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-24 space-y-4 pt-2">

        {/* Progress card */}
        {latest ? (
          <div className="bg-[#162212] rounded-2xl p-5 border border-[#b0e455]/10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-medium text-[#edf5e2]/40">Latest check-in</p>
                <p className="text-xs text-[#edf5e2]/25 mt-0.5">{relTime(latest.created_at)}</p>
              </div>
              {fitnessGoal && (
                <span className="text-[10px] bg-[#b0e455]/10 border border-[#b0e455]/20 text-[#b0e455] px-2.5 py-1 rounded-full font-medium">
                  {fitnessGoal}
                </span>
              )}
            </div>

            <div className="flex items-end gap-5">
              {latestWeight !== null && (
                <div>
                  <p className="text-[10px] text-[#edf5e2]/35 uppercase tracking-wider mb-1">Weight</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold tracking-tight">{latestWeight}</span>
                    <span className="text-sm text-[#edf5e2]/40">{weightUnit}</span>
                  </div>
                  {weightDelta !== null && (
                    <p className="text-xs mt-1 font-medium" style={{ color: weightDelta <= 0 ? '#86efac' : '#f87171' }}>
                      {weightDelta > 0 ? '+' : ''}{weightDelta.toFixed(1)} {weightUnit}
                    </p>
                  )}
                </div>
              )}

              {latest.confidence !== null && (
                <div>
                  <p className="text-[10px] text-[#edf5e2]/35 uppercase tracking-wider mb-1">Confidence</p>
                  <div className="flex items-baseline gap-1">
                    <span
                      className="text-3xl font-bold tracking-tight"
                      style={{ color: confidenceColor(latest.confidence) }}
                    >
                      {latest.confidence}
                    </span>
                    <span className="text-sm text-[#edf5e2]/40">/10</span>
                  </div>
                  <p className="text-xs mt-1 font-medium" style={{ color: confidenceColor(latest.confidence) }}>
                    {confidenceLabel(latest.confidence)}
                  </p>
                </div>
              )}

              <div className="ml-auto pb-1">
                <MiniSparkline stats={recentStats} unit={weightUnit} />
              </div>
            </div>

            {latest.milestone_text && (
              <div className="mt-4 pt-4 border-t border-[#b0e455]/8">
                <p className="text-xs text-[#edf5e2]/45 italic leading-relaxed">
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
          <p className="text-[10px] text-[#edf5e2]/30 tracking-wider uppercase mb-3">Quick Actions</p>
          <div className="grid grid-cols-2 gap-3">

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
