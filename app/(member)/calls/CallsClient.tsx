'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import { useTheme } from '@/app/providers'

export default function CallsClient() {
  const { theme } = useTheme()

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

  return (
    <main className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] pb-24 lg:pb-8 lg:pl-52">
      <div className="px-5 pt-8 pb-6 max-w-2xl mx-auto w-full space-y-6">
        <div>
          <p className="text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono mb-2">Calls</p>
          <h1 className="font-display text-3xl leading-none">Your calls</h1>
        </div>

        {/* Book a call */}
        <button
          type="button"
          data-cal-link="zanafitness/members"
          data-cal-namespace="members"
          data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
          className="w-full bg-[#b0e455]/8 border border-[#b0e455]/40 hover:border-[#b0e455] hover:bg-[#b0e455]/12 rounded-2xl p-4 transition flex items-center gap-3 text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#b0e455]/20 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="#b0e455" strokeWidth="1.8" className="w-5 h-5">
              <rect x="3" y="5" width="18" height="16" rx="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 9h18M8 3v4M16 3v4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Book a call</p>
            <p className="text-[11px] text-[var(--c-text3)] mt-0.5">Schedule your next check-in with Javi</p>
          </div>
          <span className="text-[var(--c-accent-text)] text-sm transition-transform group-hover:translate-x-0.5">→</span>
        </button>

        {/* Upcoming (placeholder until calls data is wired) */}
        <div className="space-y-3">
          <p className="text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono">Upcoming</p>
          <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-2xl p-6 text-center">
            <p className="text-sm text-[var(--c-text3)] leading-relaxed">No calls scheduled yet.</p>
          </div>
        </div>

        <Script id="cal-embed-init" strategy="afterInteractive">{`
          (function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if(typeof namespace === "string"){cal.ns[namespace] = cal.ns[namespace] || api;p(cal.ns[namespace], ar);p(cal, ["initNamespace", namespace]);} else p(cal, ar); return;} p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
          Cal("init", "members", {origin:"https://app.cal.com"});
          Cal.ns.members("ui", {"hideEventTypeDetails":false,"layout":"month_view"});
        `}</Script>
      </div>
    </main>
  )
}
