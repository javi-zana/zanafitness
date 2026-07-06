'use client'

import { useEffect, useRef, useState } from 'react'
import { localDateKey } from '@/lib/workout-notes'

type Meal = { id: string; photo_url: string; note: string | null; created_at: string }

function dayLabel(key: string, todayKey: string, yesterdayKey: string): string {
  if (key === todayKey) return 'Today'
  if (key === yesterdayKey) return 'Yesterday'
  return new Date(key + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function MealsClient({ initialMeals }: { initialMeals: Meal[] }) {
  const [meals, setMeals] = useState(initialMeals)
  const [pending, setPending] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Day grouping happens in the browser so "Today" means the client's today.
  const [groups, setGroups] = useState<Array<[string, Meal[]]> | null>(null)
  useEffect(() => {
    const byDay = new Map<string, Meal[]>()
    for (const m of meals) {
      const key = localDateKey(new Date(m.created_at))
      byDay.set(key, [...(byDay.get(key) ?? []), m])
    }
    setGroups(Array.from(byDay.entries()).sort((a, b) => b[0].localeCompare(a[0])))
  }, [meals])

  const todayKey = localDateKey()
  const yesterdayKey = localDateKey(new Date(Date.now() - 86_400_000))

  function pick(file: File | null) {
    if (!file) return
    setPending(file)
    setPreview(URL.createObjectURL(file))
    setError(null)
  }

  function cancel() {
    if (preview) URL.revokeObjectURL(preview)
    setPending(null)
    setPreview(null)
    setNote('')
    if (fileRef.current) fileRef.current.value = ''
  }

  async function submit() {
    if (!pending) return
    setBusy(true)
    setError(null)
    const fd = new FormData()
    fd.append('file', pending)
    fd.append('note', note)
    const res = await fetch('/api/upload-meal-photo', { method: 'POST', body: fd })
    const json = await res.json().catch(() => ({}))
    setBusy(false)
    if (!res.ok) {
      setError(json.error || 'Upload failed — try again')
      return
    }
    setMeals((m) => [json.meal as Meal, ...m])
    cancel()
  }

  async function remove(id: string) {
    setMeals((m) => m.filter((x) => x.id !== id))
    await fetch('/api/upload-meal-photo', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id }),
    })
  }

  return (
    <main className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] pb-24 lg:pb-8 lg:pl-52">
      <div className="px-5 pt-8 pb-6 max-w-2xl mx-auto w-full">
        <p className="text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono mb-2">Meals</p>
        <h1 className="font-display text-3xl leading-none mb-6">Your food log.</h1>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => pick(e.target.files?.[0] ?? null)}
        />

        {/* Quick add */}
        {!pending ? (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 bg-[#b0e455] text-[#0f1a0c] py-3.5 rounded-2xl text-sm font-semibold hover:bg-[#c9f070] transition mb-6"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M4 8h3l2-3h6l2 3h3v11H4V8z" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="13" r="3.2" />
            </svg>
            Snap a meal
          </button>
        ) : (
          <div className="space-y-3 mb-6 bg-[var(--c-card)] border border-[var(--c-border)] rounded-2xl p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview ?? ''} alt="Meal preview" className="w-full max-h-64 object-cover rounded-xl" />
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={280}
              placeholder="Add a note (optional)"
              className="w-full bg-[var(--c-bg)] border border-[var(--c-border)] rounded-lg px-3 py-2.5 text-sm text-[var(--c-text)] placeholder:text-[var(--c-text4)] outline-none focus:border-[#b0e455]"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={submit}
                disabled={busy}
                className="flex-1 bg-[#b0e455] text-[#0f1a0c] rounded-lg py-2.5 text-sm font-semibold disabled:opacity-60"
              >
                {busy ? 'Uploading…' : 'Log it'}
              </button>
              <button
                type="button"
                onClick={cancel}
                disabled={busy}
                className="px-4 rounded-lg border border-[var(--c-border)] text-sm text-[var(--c-text3)]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* History, day by day */}
        {groups && groups.length > 0 ? (
          <div className="space-y-6">
            {groups.map(([day, dayMeals]) => (
              <section key={day}>
                <div className="flex items-baseline justify-between mb-2">
                  <p className="text-xs font-semibold text-[var(--c-text2)]">{dayLabel(day, todayKey, yesterdayKey)}</p>
                  <p className="text-[10px] text-[var(--c-text4)] font-mono">{dayMeals.length} meal{dayMeals.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {dayMeals.map((m) => (
                    <div key={m.id} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.photo_url} alt={m.note ?? 'Meal'} className="aspect-square w-full rounded-xl object-cover" />
                      {m.note && (
                        <p className="absolute bottom-0 left-0 right-0 rounded-b-xl bg-black/55 px-2 py-1 text-[10px] leading-tight text-white truncate">
                          {m.note}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => remove(m.id)}
                        aria-label="Delete meal photo"
                        className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-text3)] text-[11px] leading-none shadow-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : groups ? (
          <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-2xl p-8 text-center">
            <p className="text-sm text-[var(--c-text3)] leading-relaxed">
              No meals yet.<br />Snap your first one — it takes five seconds.
            </p>
          </div>
        ) : null}
      </div>
    </main>
  )
}
