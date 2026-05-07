'use client'

import Script from 'next/script'
import { useTheme } from '@/app/providers'

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL ?? 'https://calendly.com/me-javilorenzana/30-minute-check-in'

export default function ScheduleClient() {
  const { theme } = useTheme()
  const calendlyParams = theme === 'dark'
    ? 'background_color=111111&text_color=ffffff&primary_color=b0e455'
    : 'background_color=ffffff&text_color=1c1c1e&primary_color=b0e455'

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] flex flex-col lg:pl-52">
      <div className="px-5 pt-12 pb-4 lg:px-10 lg:pt-10 lg:pb-5 lg:border-b lg:border-[var(--c-border)]">
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Schedule</h1>
        <p className="text-xs text-[var(--c-text4)] mt-0.5">Book your bi-weekly coaching call below.</p>
      </div>

      <div className="flex-1 pb-20 lg:px-5 lg:max-w-3xl">
        {CALENDLY_URL ? (
          <>
            <Script
              src="https://assets.calendly.com/assets/external/widget.js"
              strategy="afterInteractive"
            />
            <div
              className="calendly-inline-widget w-full"
              data-url={`${CALENDLY_URL}?${calendlyParams}`}
              style={{ minWidth: '320px', height: '680px' }}
            />
          </>
        ) : (
          <div className="px-5 pb-8 space-y-4 pt-2">
            <div className="bg-[var(--c-card)] rounded-2xl border border-[var(--c-border)] p-5 space-y-4">
              <p className="text-xs font-semibold text-[var(--c-accent-text)] uppercase tracking-wider">What happens on a coaching call</p>
              {[
                { label: 'Progress review', desc: 'We go through your stats, what changed, and what your numbers mean.' },
                { label: 'Program adjustments', desc: 'Your training or nutrition plan gets updated based on how the last weeks went.' },
                { label: 'Mindset check-in', desc: 'Honest conversation about what\'s working, what isn\'t, and how you\'re feeling.' },
                { label: 'Next steps', desc: 'Clear focus areas for the coming weeks so you always know what to do.' },
              ].map(item => (
                <div key={item.label} className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#b0e455] mt-2 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="text-xs text-[var(--c-text3)] mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-[var(--c-card)] rounded-2xl border border-[var(--c-border)] p-5">
              <p className="text-sm font-semibold mb-2">How often are calls?</p>
              <p className="text-sm text-[var(--c-text3)] leading-relaxed">
                Bi-weekly - every two weeks. Calls are 30-45 minutes and happen over video. They're the engine of the whole system.
              </p>
            </div>
            <div className="bg-[#b0e455]/6 border border-[var(--c-border2)] rounded-2xl p-4 text-center">
              <p className="text-xs text-[var(--c-accent-text)] font-medium mb-1">Booking coming soon</p>
              <p className="text-xs text-[var(--c-text3)]">Your coach will activate scheduling when you're fully onboarded.</p>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
