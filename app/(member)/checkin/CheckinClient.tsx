'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

function weekLabelNow(): string {
  const d = new Date()
  const day = d.getDay()
  d.setDate(d.getDate() - ((day + 6) % 7)) // Monday of current week
  return `Week of ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
}

const RATINGS: { key: string; label: string }[] = [
  { key: 'sleep', label: 'Sleep quality' },
  { key: 'energy', label: 'Energy' },
  { key: 'strength', label: 'Strength' },
  { key: 'stress', label: 'Stress' },
  { key: 'workoutAdherence', label: 'Workout adherence' },
  { key: 'nutritionAdherence', label: 'Nutrition adherence' },
]

type Form = {
  morale: number
  weightKg: string
  programChangesNeeded: boolean
  programChangesDetails: string
  wentOffPlan: boolean
  wentOffPlanDetails: string
  proudOf: string
  improve: string
  comments: string
  [k: string]: string | number | boolean
}

const cardCls = 'bg-[var(--c-card)] border border-[var(--c-border)] rounded-2xl p-4'
const labelCls = 'text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono'
const textCls =
  'w-full bg-[var(--c-bg)] border border-[var(--c-border)] rounded-lg px-3 py-2.5 text-sm text-[var(--c-text)] outline-none focus:border-[var(--c-accent)]'

function Rating({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className={cardCls}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold">{label}</span>
        <span className="font-display text-lg text-[var(--c-accent-text)]">{value}</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#b0e455]"
      />
    </div>
  )
}

function YesNo({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex gap-2">
      {[{ v: false, l: 'No' }, { v: true, l: 'Yes' }].map(({ v, l }) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(v)}
          className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
            value === v
              ? 'bg-[#b0e455] text-[#0f1a0c] border-transparent'
              : 'border-[var(--c-border)] text-[var(--c-text3)] hover:bg-[var(--c-hover)]'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  )
}

export default function CheckinClient() {
  const [f, setF] = useState<Form>({
    morale: 7,
    weightKg: '',
    programChangesNeeded: false,
    programChangesDetails: '',
    sleep: 7,
    energy: 7,
    strength: 7,
    stress: 5,
    workoutAdherence: 7,
    nutritionAdherence: 7,
    wentOffPlan: false,
    wentOffPlanDetails: '',
    proudOf: '',
    improve: '',
    comments: '',
  })
  const [weekLabel, setWeekLabel] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { setWeekLabel(weekLabelNow()) }, [])

  const set = (k: string, v: string | number | boolean) => setF((prev) => ({ ...prev, [k]: v }))

  async function submit() {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...f, weekLabel }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not submit')
      setDone(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <main className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] pb-24 lg:pb-8 lg:pl-52">
        <div className="px-5 pt-16 pb-6 max-w-2xl mx-auto w-full text-center space-y-4">
          <div className="text-4xl">✓</div>
          <h1 className="font-display text-2xl">Check-in submitted</h1>
          <p className="text-sm text-[var(--c-text3)]">Javi will see this before your next report. Nice work this week.</p>
          <Link href="/reports" className="inline-block text-sm font-semibold text-[var(--c-accent-text)]">← Back to Reports</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] pb-28 lg:pb-8 lg:pl-52">
      <div className="px-5 pt-8 pb-6 max-w-2xl mx-auto w-full space-y-5">
        <div>
          <p className={`${labelCls} mb-2`}>Weekly check-in · {weekLabel}</p>
          <h1 className="font-display text-3xl leading-none">How was your week?</h1>
        </div>

        <Rating label="How happy are you with your progress?" value={f.morale} onChange={(v) => set('morale', v)} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {RATINGS.map((r) => (
            <Rating key={r.key} label={r.label} value={f[r.key] as number} onChange={(v) => set(r.key, v)} />
          ))}
        </div>

        <div className={cardCls}>
          <p className={`${labelCls} mb-2`}>Weight (kg)</p>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={f.weightKg}
            onChange={(e) => set('weightKg', e.target.value)}
            placeholder="Optional"
            className={textCls}
          />
        </div>

        <div className={cardCls}>
          <p className={`${labelCls} mb-2`}>Any major changes needed to the program?</p>
          <YesNo value={f.programChangesNeeded} onChange={(v) => set('programChangesNeeded', v)} />
          {f.programChangesNeeded && (
            <textarea
              value={f.programChangesDetails}
              onChange={(e) => set('programChangesDetails', e.target.value)}
              placeholder="What's not working?"
              rows={2}
              className={`${textCls} mt-2`}
            />
          )}
        </div>

        <div className={cardCls}>
          <p className={`${labelCls} mb-2`}>Did you go off-plan?</p>
          <YesNo value={f.wentOffPlan} onChange={(v) => set('wentOffPlan', v)} />
          {f.wentOffPlan && (
            <textarea
              value={f.wentOffPlanDetails}
              onChange={(e) => set('wentOffPlanDetails', e.target.value)}
              placeholder="What happened?"
              rows={2}
              className={`${textCls} mt-2`}
            />
          )}
        </div>

        {[
          { k: 'proudOf', label: 'One thing you’re proud of' },
          { k: 'improve', label: 'One thing you can improve' },
          { k: 'comments', label: 'Final comments, questions, or concerns' },
        ].map(({ k, label }) => (
          <div key={k} className={cardCls}>
            <p className={`${labelCls} mb-2`}>{label}</p>
            <textarea
              value={f[k] as string}
              onChange={(e) => set(k, e.target.value)}
              rows={2}
              className={textCls}
            />
          </div>
        ))}

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          onClick={submit}
          disabled={submitting}
          className="w-full rounded-xl bg-[#b0e455] text-[#0f1a0c] py-3.5 text-sm font-semibold transition hover:bg-[#c9f070] disabled:opacity-40"
        >
          {submitting ? 'Submitting…' : 'Submit check-in'}
        </button>
      </div>
    </main>
  )
}
