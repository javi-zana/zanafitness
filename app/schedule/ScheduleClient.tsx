'use client'

import Script from 'next/script'
import BottomNav from '@/components/BottomNav'

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL ?? ''

export default function ScheduleClient() {
  return (
    <div className="min-h-screen bg-[#0f1a0c] text-[#edf5e2] flex flex-col">
      <div className="px-5 pt-12 pb-4">
        <p className="text-xs text-[#edf5e2]/30 tracking-wider uppercase mb-0.5">Zana</p>
        <h1 className="text-xl font-bold tracking-tight">Schedule</h1>
        <p className="text-sm text-[#edf5e2]/40 mt-1">Book your bi-weekly coaching call below.</p>
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
              data-url={`${CALENDLY_URL}?background_color=0f1a0c&text_color=edf5e2&primary_color=b0e455`}
              style={{ minWidth: '320px', height: '680px' }}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center px-8">
            <div className="w-12 h-12 rounded-full bg-[#b0e455]/8 border border-[#b0e455]/12 flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 text-[#edf5e2]/25">
                <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-sm text-[#edf5e2]/30">Scheduling coming soon.</p>
            <p className="text-xs text-[#edf5e2]/20 mt-1">
              Set <code className="text-[#edf5e2]/35">NEXT_PUBLIC_CALENDLY_URL</code> to enable booking.
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
