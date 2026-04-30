'use client'

import Script from 'next/script'
import BottomNav from '@/components/BottomNav'

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL ?? ''

export default function ScheduleClient() {
  return (
    <div className="min-h-screen bg-[#0f1a0c] text-[#edf5e2] flex flex-col lg:pl-64">
      <div className="px-5 pt-12 pb-4 lg:pt-8 lg:border-b lg:border-[#b0e455]/8">
        <p className="text-xs text-[#edf5e2]/30 tracking-wider uppercase mb-0.5">Zana</p>
        <h1 className="text-xl font-bold tracking-tight">Schedule</h1>
        <p className="text-sm text-[#edf5e2]/40 mt-1">Book your bi-weekly coaching call below.</p>
      </div>

      <div className="flex-1 pb-20 lg:max-w-2xl">
        {CALENDLY_URL ? (
          <>
            <Script
              src="https://assets.calendly.com/assets/external/widget.js"
              strategy="afterInteractive"
            />
            <div
              className="calendly-inline-widget w-full"
              data-url={`${CALENDLY_URL}?background_color=0f1a0c&text_color=edf5e2&primary_color=b0e455`}
              style={{ minWidth: '320px', height: '680px' }}
            />
          </>
        ) : (
          <div className="px-5 pb-8 space-y-4 pt-2">
            <div className="bg-[#162212] rounded-2xl border border-[#b0e455]/8 p-5 space-y-4">
              <p className="text-xs font-semibold text-[#b0e455] uppercase tracking-wider">What happens on a coaching call</p>
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
                    <p className="text-xs text-[#edf5e2]/40 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-[#162212] rounded-2xl border border-[#b0e455]/8 p-5">
              <p className="text-sm font-semibold mb-2">How often are calls?</p>
              <p className="text-sm text-[#edf5e2]/45 leading-relaxed">
                Bi-weekly — every two weeks. Calls are 30–45 minutes and happen over video. They're the engine of the whole system.
              </p>
            </div>
            <div className="bg-[#b0e455]/6 border border-[#b0e455]/15 rounded-2xl p-4 text-center">
              <p className="text-xs text-[#b0e455] font-medium mb-1">Booking coming soon</p>
              <p className="text-xs text-[#edf5e2]/40">Your coach will activate scheduling when you're fully onboarded.</p>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
