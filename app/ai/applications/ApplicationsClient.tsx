'use client'

import { useState } from 'react'

export type Application = {
  id: string
  created_at: string
  status: string
  responded_at: string | null
  first_name: string | null
  email: string | null
  phone: string | null
  instagram: string | null
  age: string | number | null
  location: string | null
  work: string | null
  mirror_goal: string | null
  what_stopped: string | null
  training_history: string | null
  training_looks: string | null
  coach_history: string | null
  commitment: number | null
  investment_fit: string | null
  investment_why: string | null
  why_now: string | null
}

// Collapsed pipeline: everything maps to New / Accepted / Rejected.
// Legacy statuses (call_booked, waiting, won, ...) fold into Accepted.
function bucket(status: string): 'new' | 'accepted' | 'rejected' {
  if (status === 'pending') return 'new'
  if (['rejected', 'declined', 'closed', 'lost'].includes(status)) return 'rejected'
  return 'accepted'
}

function igHandle(raw: string | null): string | null {
  if (!raw) return null
  const h = raw.trim().replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/.*$/, '')
  return h || null
}

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 60) return `${Math.max(mins, 0)}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const DM_SNIPPET =
  "just accepted your application 🤝 sent you an email with the link to book your call — check your inbox (and spam folder just in case)"

const QA: Array<[keyof Application, string]> = [
  ['mirror_goal', 'Mirror goal'],
  ['what_stopped', "What's stopped them"],
  ['training_history', 'Training history'],
  ['training_looks', 'What training looks like'],
  ['coach_history', 'Coach history'],
  ['commitment', 'Commitment (1–10)'],
  ['investment_fit', 'Investment fit'],
  ['investment_why', 'Investment why'],
  ['why_now', 'Why now'],
]

function Card({ app, onAction }: { app: Application; onAction: (id: string, action: 'accept' | 'reject') => Promise<boolean> }) {
  const [expanded, setExpanded] = useState(false)
  const [confirming, setConfirming] = useState<null | 'accept' | 'reject'>(null)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const b = bucket(app.status)
  const ig = igHandle(app.instagram)

  async function act(action: 'accept' | 'reject') {
    if (confirming !== action) {
      setConfirming(action)
      setTimeout(() => setConfirming((c) => (c === action ? null : c)), 4000)
      return
    }
    setConfirming(null)
    setBusy(true)
    await onAction(app.id, action)
    setBusy(false)
  }

  function copySnippet() {
    navigator.clipboard.writeText(DM_SNIPPET)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-4">
      {/* header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-medium text-zinc-100">{app.first_name || 'Unnamed'}</div>
          <div className="truncate text-xs text-zinc-500">
            {[app.age, app.location, app.work].filter(Boolean).join(' · ') || app.email}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-[11px] text-zinc-600">{timeAgo(app.created_at)}</div>
          {ig && (
            <a
              href={`https://instagram.com/${ig}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block rounded-full border border-zinc-700 px-2.5 py-0.5 text-[11px] text-zinc-300 transition hover:border-lime-500/40 hover:text-lime-400"
            >
              @{ig} ↗
            </a>
          )}
        </div>
      </div>

      {/* preview / full answers */}
      {app.mirror_goal && !expanded && (
        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-zinc-400">{app.mirror_goal}</p>
      )}
      {expanded && (
        <dl className="mt-3 space-y-3">
          {QA.map(([key, label]) => {
            const val = app[key]
            if (val === null || val === undefined || val === '') return null
            return (
              <div key={key}>
                <dt className="text-[11px] uppercase tracking-wider text-zinc-600">{label}</dt>
                <dd className="mt-0.5 whitespace-pre-wrap text-xs leading-relaxed text-zinc-300">{String(val)}</dd>
              </div>
            )
          })}
          <div>
            <dt className="text-[11px] uppercase tracking-wider text-zinc-600">Contact</dt>
            <dd className="mt-0.5 text-xs text-zinc-300">
              {[app.email, app.phone].filter(Boolean).join(' · ')}
            </dd>
          </div>
        </dl>
      )}

      {/* actions */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="rounded-full border border-zinc-800 px-3 py-1 text-[11px] text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-200"
        >
          {expanded ? 'Collapse' : 'Read application'}
        </button>

        {b === 'new' && (
          <>
            <button
              disabled={busy}
              onClick={() => act('accept')}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold transition disabled:opacity-50 ${
                confirming === 'accept'
                  ? 'bg-lime-400 text-lime-950'
                  : 'border border-lime-500/40 text-lime-400 hover:bg-lime-500/10'
              }`}
            >
              {busy ? '…' : confirming === 'accept' ? 'Confirm — send email' : 'Accept'}
            </button>
            <button
              disabled={busy}
              onClick={() => act('reject')}
              className={`rounded-full px-3 py-1 text-[11px] transition disabled:opacity-50 ${
                confirming === 'reject'
                  ? 'bg-red-400 font-semibold text-red-950'
                  : 'border border-zinc-800 text-zinc-500 hover:border-red-500/40 hover:text-red-400'
              }`}
            >
              {confirming === 'reject' ? 'Confirm reject' : 'Reject'}
            </button>
          </>
        )}

        {b === 'accepted' && (
          <button
            onClick={copySnippet}
            className="rounded-full border border-zinc-800 px-3 py-1 text-[11px] text-zinc-400 transition hover:border-lime-500/40 hover:text-lime-400"
          >
            {copied ? 'Copied ✓' : 'Copy DM snippet'}
          </button>
        )}
      </div>
    </div>
  )
}

export default function ApplicationsClient({ initial }: { initial: Application[] }) {
  const [apps, setApps] = useState(initial)
  const [error, setError] = useState<string | null>(null)

  async function onAction(id: string, action: 'accept' | 'reject'): Promise<boolean> {
    setError(null)
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(json.error || 'Something went wrong')
      return false
    }
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status: json.status } : a)))
    return true
  }

  const groups: Array<['New' | 'Accepted' | 'Rejected', Application[]]> = [
    ['New', apps.filter((a) => bucket(a.status) === 'new')],
    ['Accepted', apps.filter((a) => bucket(a.status) === 'accepted')],
    ['Rejected', apps.filter((a) => bucket(a.status) === 'rejected')],
  ]

  return (
    <div className="space-y-8">
      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs text-red-400">{error}</p>
      )}
      {groups.map(([label, list]) =>
        label !== 'New' && list.length === 0 ? null : (
          <section key={label}>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-sm font-medium text-zinc-100">{label}</h2>
              <span className="text-xs text-zinc-500">{list.length}</span>
            </div>
            <div className="space-y-2">
              {list.map((a) => (
                <Card key={a.id} app={a} onAction={onAction} />
              ))}
              {list.length === 0 && (
                <p className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-6 text-center text-xs text-zinc-500">
                  No new applications.
                </p>
              )}
            </div>
          </section>
        ),
      )}
    </div>
  )
}
