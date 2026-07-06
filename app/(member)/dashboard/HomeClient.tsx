'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import { OkrCard, type OkrContent } from '@/components/OkrCard'
import { useTheme } from '@/app/providers'
import MealLog, { type MealItem } from './MealLog'
import TodayWorkout from './TodayWorkout'

type ReportItem = { id: string; weekLabel: string; objective: string; sentAt: string | null }

function fmtDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function HomeClient({
  firstName,
  avatarUrl,
  avatarColor,
  referralCode,
  okr,
  reports,
  todayMeals,
  workoutDates,
}: {
  firstName: string | null
  avatarUrl: string | null
  avatarColor: string
  referralCode: string | null
  okr: object | null
  reports: ReportItem[]
  todayMeals: MealItem[]
  workoutDates: string[]
}) {
  const { theme } = useTheme()
  const okrContent: OkrContent | null = (() => {
    const c = okr as { type?: string } | null
    return c?.type === 'okr' ? (c as OkrContent) : null
  })()
  const [copied, setCopied] = useState(false)
  const initials = (firstName ?? 'M').charAt(0).toUpperCase()
  const [latest, ...older] = reports

  // Keep the Cal booking popup in sync with the active theme.
  useEffect(() => {
    let attempts = 0
    const apply = () => {
      const cal = (window as unknown as { Cal?: { ns?: Record<string, (action: string, config: Record<string, unknown>) => void> } }).Cal
      if (cal?.ns?.members) {
        cal.ns.members('ui', { theme, layout: 'month_view', hideEventTypeDetails: false })
      } else if (attempts < 30) {
        attempts++
        setTimeout(apply, 100)
      }
    }
    apply()
  }, [theme])

  function copyReferral() {
    if (!referralCode) return
    navigator.clipboard.writeText(`${window.location.origin}/?ref=${referralCode}`).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <main className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] pb-24 lg:pb-8 lg:pl-52">
      <div className="px-5 pt-8 pb-6 max-w-2xl mx-auto w-full space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono mb-2">Home</p>
            <h1 className="font-display text-3xl leading-none">Hey{firstName ? `, ${firstName}` : ''}.</h1>
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

        {/* Today's daily job: workout + meal */}
        <TodayWorkout dates={workoutDates} />
        <MealLog initialMeals={todayMeals} />

        {okrContent && <OkrCard okr={okrContent} showEmpty={false} />}

        {/* This week's brief */}
        {latest ? (
          <Link
            href={`/reports/${latest.id}`}
            className="block bg-[#b0e455]/8 border border-[#b0e455]/40 hover:border-[#b0e455] hover:bg-[#b0e455]/12 rounded-2xl p-5 transition group"
          >
            <p className="text-[10px] text-[var(--c-accent-text)] tracking-widest uppercase font-mono mb-2">This week · {latest.weekLabel}</p>
            <p className="font-display text-xl leading-snug">{latest.objective || 'Your weekly brief'}</p>
            <p className="text-[11px] text-[var(--c-text3)] mt-2 group-hover:translate-x-0.5 transition-transform">Read your brief →</p>
          </Link>
        ) : (
          <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-2xl p-6 text-center">
            <p className="text-sm text-[var(--c-text3)] leading-relaxed">
              No reports yet.<br />Your weekly brief from Javi will show up here.
            </p>
          </div>
        )}

        {/* Actions: book a call + weekly check-in */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            data-cal-link="zanafitness/members"
            data-cal-namespace="members"
            data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
            className="bg-[var(--c-card)] border border-[var(--c-border)] hover:bg-[var(--c-hover)] rounded-2xl p-4 transition flex items-center gap-3 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#b0e455]/15 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="#b0e455" strokeWidth="1.8" className="w-5 h-5">
                <rect x="3" y="5" width="18" height="16" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 9h18M8 3v4M16 3v4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Book a call</p>
              <p className="text-[11px] text-[var(--c-text3)] mt-0.5">Schedule time with Javi</p>
            </div>
            <span className="text-[var(--c-text4)] text-sm transition-transform group-hover:translate-x-0.5">→</span>
          </button>

          <Link
            href="/checkin"
            className="bg-[var(--c-card)] border border-[var(--c-border)] hover:bg-[var(--c-hover)] rounded-2xl p-4 transition flex items-center gap-3 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#b0e455]/15 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="#b0e455" strokeWidth="1.8" className="w-5 h-5">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Weekly check-in</p>
              <p className="text-[11px] text-[var(--c-text3)] mt-0.5">Submit how your week went</p>
            </div>
            <span className="text-[var(--c-text4)] text-sm transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        </div>

        {/* Past reports */}
        {older.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono">Past briefs</p>
            {older.map((r) => (
              <Link
                key={r.id}
                href={`/reports/${r.id}`}
                className="flex items-center justify-between bg-[var(--c-card)] border border-[var(--c-border)] rounded-2xl px-4 py-3 hover:bg-[var(--c-hover)] transition"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{r.objective || 'Weekly brief'}</p>
                  <p className="text-[11px] text-[var(--c-text4)]">{r.weekLabel || fmtDate(r.sentAt)}</p>
                </div>
                <span className="text-[var(--c-text4)] text-sm">→</span>
              </Link>
            ))}
          </div>
        )}

        {/* Referral */}
        {referralCode && (
          <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-2xl p-4">
            <p className="text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono mb-2">Refer a Friend</p>
            <p className="text-xs text-[var(--c-text3)] leading-relaxed mb-3">Send your code. Earn rewards when they join.</p>
            <div className="flex items-center gap-2 bg-[var(--c-bg)] border border-[var(--c-border)] rounded-lg px-3 py-2.5">
              <p className="flex-1 text-sm font-mono font-bold text-[var(--c-text)] truncate">{referralCode}</p>
              <button
                type="button"
                onClick={copyReferral}
                className="text-[10px] font-mono tracking-widest uppercase text-[var(--c-accent-text)] hover:opacity-75 transition"
              >
                {copied ? 'Copied' : 'Copy link'}
              </button>
            </div>
          </div>
        )}
      </div>

      <Script id="cal-embed-init" strategy="afterInteractive">{`
        (function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if(typeof namespace === "string"){cal.ns[namespace] = cal.ns[namespace] || api;p(cal.ns[namespace], ar);p(cal, ["initNamespace", namespace]);} else p(cal, ar); return;} p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
        Cal("init", "members", {origin:"https://app.cal.com"});
        Cal.ns.members("ui", {"hideEventTypeDetails":false,"layout":"month_view"});
      `}</Script>
    </main>
  )
}
