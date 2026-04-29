'use client'

import Script from 'next/script'
import BottomNav from '@/components/BottomNav'

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL ?? ''

export default function ScheduleClient() {
  return (
    <div className="min-h-screen bg-[#0b0e14] text-white flex flex-col">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <p className="text-[10px] text-white/30 tracking-widest uppercase font-mono">Zana</p>
        <h1 className="text-xl font-semibold tracking-tight mt-0.5">Schedule</h1>
        <p className="text-xs text-white/30 mt-1">Book your bi-weekly coaching call below.</p>
      </div>

      <div className="flex-1 pb-20">
        {CALENDLY_URL ? (
          <>
            <Script
              src="https://assets.calendly.com/assets/external/widget.js"
              strategy="afterInteractive"
            />
            <div
              className="calendly-inline-widget w-full"
              data-url={`${CALENDLY_URL}?background_color=0b0e14&text_color=ffffff&primary_color=AFCBFF`}
              style={{ minWidth: '320px', height: '680px' }}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center px-8">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 text-white/20">
                <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-sm text-white/30">Scheduling coming soon.</p>
            <p className="text-xs text-white/20 mt-1">
              Set <span className="font-mono text-white/30">NEXT_PUBLIC_CALENDLY_URL</span> to enable booking.
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
