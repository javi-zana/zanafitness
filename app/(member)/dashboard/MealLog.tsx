'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { localDateKey } from '@/lib/workout-notes'

export type MealItem = { id: string; photo_url: string; note: string | null; created_at: string }

// Meal photo log: habits-based — a photo and an optional one-liner, no macros.
// Receives recent meals and narrows to the client's local today in-browser.
export default function MealLog({ initialMeals }: { initialMeals: MealItem[] }) {
  const [meals, setMeals] = useState<MealItem[]>([])
  useEffect(() => {
    const today = localDateKey()
    setMeals(initialMeals.filter((m) => localDateKey(new Date(m.created_at)) === today))
  }, [initialMeals])
  const [pending, setPending] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

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
    setMeals((m) => [json.meal as MealItem, ...m])
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
    <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-2xl p-4">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0] ?? null)}
      />

      {!pending ? (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex-1 flex items-center gap-3 text-left group min-w-0"
          >
            <div className="w-10 h-10 rounded-xl bg-[#b0e455]/15 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="#b0e455" strokeWidth="1.8" className="w-5 h-5">
                <path d="M4 8h3l2-3h6l2 3h3v11H4V8z" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="13" r="3.2" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Log a meal</p>
              <p className="text-[11px] text-[var(--c-text3)] mt-0.5">
                {meals.length > 0 ? `${meals.length} logged today` : 'Snap a photo — that’s it'}
              </p>
            </div>
          </button>
          <Link
            href="/meals"
            className="shrink-0 text-[10px] font-mono tracking-widest uppercase text-[var(--c-accent-text)] hover:opacity-75 transition"
          >
            History
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
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

      {meals.length > 0 && !pending && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {meals.map((m) => (
            <div key={m.id} className="relative shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.photo_url} alt={m.note ?? 'Meal'} className="w-16 h-16 rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => remove(m.id)}
                aria-label="Delete meal photo"
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-text3)] text-[10px] leading-none"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
