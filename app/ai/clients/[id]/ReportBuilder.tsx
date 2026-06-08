'use client'

import { useEffect, useState } from 'react'
import { renderReportHtml, type ReportContent, type Lever } from '@/lib/report-template'

const inputCls =
  'w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-lime-500'

function mondayLabel(): string {
  const d = new Date()
  const day = d.getDay()
  const diff = (day === 0 ? 1 : 8 - day) % 7 // next Monday (or today if Monday)
  d.setDate(d.getDate() + diff)
  return `Week of ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
}

const LEVER_KEYS: { key: keyof ReportContent['levers']; label: string }[] = [
  { key: 'training', label: 'Training' },
  { key: 'nutrition', label: 'Nutrition' },
  { key: 'lifestyle', label: 'Lifestyle' },
]

export default function ReportBuilder({
  memberId,
  clientName,
}: {
  memberId: string
  clientName: string
}) {
  const [focusNote, setFocusNote] = useState('')
  const [weekLabel, setWeekLabel] = useState('')
  const [content, setContent] = useState<ReportContent | null>(null)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [sentUrl, setSentUrl] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => { setWeekLabel(mondayLabel()) }, [])

  async function generate() {
    setGenerating(true)
    setError('')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ memberId, focusNote, weekLabel }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setContent(data.content)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  async function save() {
    if (!content) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: savedId, memberId, weekLabel, content }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      setSavedId(data.id)
      setSentUrl(null)
      return data.id as string
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
      return null
    } finally {
      setSaving(false)
    }
  }

  async function send() {
    setError('')
    // Save first so we send exactly what's on screen.
    const id = await save()
    if (!id) return
    if (!confirm('Send this report to the client? They will get it by email.')) return
    setSending(true)
    try {
      const res = await fetch('/api/reports/send', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Send failed')
      setSentUrl(data.shareUrl ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Send failed')
    } finally {
      setSending(false)
    }
  }

  // ── content editing helpers ──────────────────────────────────────────────
  function patch(p: Partial<ReportContent>) {
    setContent((c) => (c ? { ...c, ...p } : c))
  }
  function patchPriority(i: number, field: 'title' | 'detail', v: string) {
    setContent((c) => {
      if (!c) return c
      const priorities = c.priorities.map((p, idx) => (idx === i ? { ...p, [field]: v } : p))
      return { ...c, priorities }
    })
  }
  function addPriority() {
    setContent((c) => (c ? { ...c, priorities: [...c.priorities, { title: '', detail: '' }] } : c))
  }
  function removePriority(i: number) {
    setContent((c) => (c ? { ...c, priorities: c.priorities.filter((_, idx) => idx !== i) } : c))
  }
  function patchLever(key: keyof ReportContent['levers'], field: keyof Lever, v: string) {
    setContent((c) => {
      if (!c) return c
      const existing = c.levers[key] ?? { sub: '', items: [] }
      const next: Lever =
        field === 'items'
          ? { ...existing, items: v.split('\n') }
          : { ...existing, sub: v }
      return { ...c, levers: { ...c.levers, [key]: next } }
    })
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
      <h2 className="mb-4 text-sm font-medium text-zinc-200">New weekly report</h2>

      {/* Inputs */}
      <div className="space-y-3">
        <input
          value={weekLabel}
          onChange={(e) => setWeekLabel(e.target.value)}
          placeholder="Week label"
          className={inputCls}
        />
        <textarea
          value={focusNote}
          onChange={(e) => setFocusNote(e.target.value)}
          placeholder="Your rough focus for this week (optional) — paste notes, what to push on, anything. The AI grounds the report in their data + this."
          rows={3}
          className={inputCls}
        />
        <button
          onClick={generate}
          disabled={generating}
          className="rounded-lg bg-lime-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-lime-400 disabled:opacity-40"
        >
          {generating ? 'Generating…' : content ? 'Regenerate' : 'Generate report'}
        </button>
      </div>

      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

      {content && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Editor */}
          <div className="space-y-4">
            <Field label="Objective">
              <input value={content.objective} onChange={(e) => patch({ objective: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Objective subline">
              <input value={content.objective_subline} onChange={(e) => patch({ objective_subline: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Coach note">
              <textarea value={content.coach_note ?? ''} onChange={(e) => patch({ coach_note: e.target.value })} rows={3} className={inputCls} />
            </Field>

            <Field label="Priorities">
              <div className="space-y-3">
                {content.priorities.map((p, i) => (
                  <div key={i} className="rounded-lg border border-zinc-800 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-500">#{i + 1}</span>
                      <button onClick={() => removePriority(i)} className="text-[10px] text-zinc-500 hover:text-red-400">Remove</button>
                    </div>
                    <input value={p.title} onChange={(e) => patchPriority(i, 'title', e.target.value)} placeholder="Title" className={`${inputCls} mb-2`} />
                    <input value={p.detail} onChange={(e) => patchPriority(i, 'detail', e.target.value)} placeholder="Detail" className={inputCls} />
                  </div>
                ))}
                <button onClick={addPriority} className="text-xs text-lime-400 hover:text-lime-300">+ Add priority</button>
              </div>
            </Field>

            {LEVER_KEYS.map(({ key, label }) => {
              const lv = content.levers[key]
              return (
                <Field key={key} label={label}>
                  <input
                    value={lv?.sub ?? ''}
                    onChange={(e) => patchLever(key, 'sub', e.target.value)}
                    placeholder="Short tag (leave blank to omit this lever)"
                    className={`${inputCls} mb-2`}
                  />
                  <textarea
                    value={(lv?.items ?? []).join('\n')}
                    onChange={(e) => patchLever(key, 'items', e.target.value)}
                    placeholder="One item per line"
                    rows={2}
                    className={inputCls}
                  />
                </Field>
              )
            })}

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={save}
                disabled={saving || sending}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800 disabled:opacity-40"
              >
                {saving ? 'Saving…' : savedId ? 'Saved ✓ — Save again' : 'Save draft'}
              </button>
              <button
                onClick={send}
                disabled={saving || sending}
                className="rounded-lg bg-lime-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-lime-400 disabled:opacity-40"
              >
                {sending ? 'Sending…' : 'Send to client'}
              </button>
            </div>
            {sentUrl && (
              <p className="text-xs text-lime-400">
                Sent ✓ ·{' '}
                <a href={sentUrl} target="_blank" rel="noreferrer" className="underline hover:text-lime-300">
                  shareable link
                </a>
              </p>
            )}
          </div>

          {/* Live preview */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <div className="mb-2 text-[10px] uppercase tracking-wider text-zinc-500">Preview</div>
            <iframe
              title="Report preview"
              srcDoc={renderReportHtml(content, { clientName, weekLabel })}
              className="h-[640px] w-full rounded-lg border border-zinc-800 bg-white"
            />
          </div>
        </div>
      )}
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-zinc-500">{label}</label>
      {children}
    </div>
  )
}
