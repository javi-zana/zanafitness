'use client'

import { useState } from 'react'
import Link from 'next/link'
import { OkrCard, type OkrContent } from '@/components/OkrCard'

const LINKS = [
  {
    href: '/program',
    label: 'Program',
    desc: 'Your plan & key results',
    icon: 'M9 12h6M9 16h6M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2M9 4a2 2 0 002 2h2a2 2 0 002-2M9 4a2 2 0 012-2h2a2 2 0 012 2',
  },
  {
    href: '/knowledge',
    label: 'Curriculum',
    desc: 'The system, explained',
    icon: 'M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z',
  },
  {
    href: '/calls',
    label: 'Calls',
    desc: 'Book & view your calls',
    icon: 'M3 9h18M8 3v4M16 3v4 M3 7a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2z',
  },
  {
    href: '/checkin',
    label: 'Weekly check-in',
    desc: 'Submit this week',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  },
]

export default function DashboardClient({
  firstName,
  avatarUrl,
  avatarColor,
  referralCode,
  okr,
}: {
  firstName: string | null
  avatarUrl: string | null
  avatarColor: string
  referralCode: string | null
  okr: object | null
}) {
  const okrContent: OkrContent | null = (() => {
    const c = okr as { type?: string } | null
    return c?.type === 'okr' ? (c as OkrContent) : null
  })()
  const [referralCopied, setReferralCopied] = useState(false)
  const initials = (firstName ?? 'M').charAt(0).toUpperCase()

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

        {okrContent && <OkrCard okr={okrContent} showEmpty={false} />}

        {/* This week's report */}
        <Link
          href="/program"
          className="block bg-[#b0e455]/8 border border-[#b0e455]/40 hover:border-[#b0e455] hover:bg-[#b0e455]/12 rounded-2xl p-4 transition group"
        >
          <p className="text-[10px] text-[var(--c-accent-text)] tracking-widest uppercase font-mono mb-1">This week</p>
          <p className="text-sm font-semibold">Your latest report</p>
          <p className="text-[11px] text-[var(--c-text3)] mt-0.5">
            Weekly reports from Javi will show up here.
          </p>
        </Link>

        {/* Sections */}
        <div className="grid grid-cols-2 gap-3">
          {LINKS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-2xl p-4 hover:bg-[var(--c-hover)] transition flex items-center gap-3"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5 text-[var(--c-text3)] shrink-0">
                <path d={item.icon} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{item.label}</p>
                <p className="text-[11px] text-[var(--c-text4)] truncate">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>

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
