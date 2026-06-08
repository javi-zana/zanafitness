'use client'

import { useState } from 'react'
import Link from 'next/link'
import { OkrCard, type OkrContent } from '@/components/OkrCard'

type ReportItem = { id: string; weekLabel: string; objective: string; sentAt: string | null }

function fmtDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ReportsHomeClient({
  firstName,
  avatarUrl,
  avatarColor,
  referralCode,
  okr,
  reports,
}: {
  firstName: string | null
  avatarUrl: string | null
  avatarColor: string
  referralCode: string | null
  okr: object | null
  reports: ReportItem[]
}) {
  const okrContent: OkrContent | null = (() => {
    const c = okr as { type?: string } | null
    return c?.type === 'okr' ? (c as OkrContent) : null
  })()
  const [copied, setCopied] = useState(false)
  const initials = (firstName ?? 'M').charAt(0).toUpperCase()
  const [latest, ...older] = reports

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
            <p className="text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono mb-2">Reports</p>
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
    </main>
  )
}
