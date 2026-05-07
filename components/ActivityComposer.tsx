'use client'

import { useState, useRef, ChangeEvent } from 'react'
import type { ActivityKind } from './ActivityCard'

const KINDS: { id: ActivityKind; label: string; emoji: string }[] = [
  { id: 'workout', label: 'Workout', emoji: '🏋️' },
  { id: 'win',     label: 'Win',     emoji: '🏆' },
  { id: 'meal',    label: 'Meal',    emoji: '🍽️' },
]

export function ActivityComposer({ onPosted }: { onPosted: () => void }) {
  const [kind, setKind] = useState<ActivityKind | null>(null)
  const [note, setNote] = useState('')
  const [confidence, setConfidence] = useState(7)
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setPhoto(f)
    setPhotoPreview(URL.createObjectURL(f))
  }

  function clearPhoto() {
    setPhoto(null)
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  function reset() {
    setKind(null)
    setNote('')
    setConfidence(7)
    clearPhoto()
    setError('')
  }

  async function post() {
    if (!kind) return
    setPosting(true)
    setError('')

    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, note: note.trim() || null, confidence }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to post')

      // Upload photo (best-effort: if it fails, the activity still exists)
      if (photo && json.activity?.id) {
        const fd = new FormData()
        fd.append('file', photo)
        fd.append('activity_id', json.activity.id)
        await fetch('/api/activity-photo', { method: 'POST', body: fd })
      }

      reset()
      onPosted()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post')
    } finally {
      setPosting(false)
    }
  }

  const canPost = kind !== null && !posting

  return (
    <div className="bg-[var(--c-card)] shadow-sm border border-[var(--c-border)] rounded-2xl p-4 space-y-4">
      <p className="text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono">Log Activity</p>

      {/* Kind picker */}
      <div className="grid grid-cols-3 gap-2">
        {KINDS.map(k => (
          <button
            key={k.id}
            type="button"
            onClick={() => setKind(k.id)}
            className={`py-3 rounded-xl text-sm font-semibold border transition ${
              kind === k.id
                ? 'border-[#b0e455] bg-[#b0e455]/10 text-[#b0e455]'
                : 'border-[var(--c-border)] bg-[var(--c-bg)] text-[var(--c-text3)] hover:border-[var(--c-text4)] hover:text-[var(--c-text)]'
            }`}
          >
            <span className="mr-1.5" aria-hidden>{k.emoji}</span>
            {k.label}
          </button>
        ))}
      </div>

      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        rows={3}
        placeholder={kind === 'workout' ? 'How did the session go?' :
                     kind === 'meal'    ? 'What did you eat?' :
                     kind === 'win'     ? 'What\'s the win?' :
                                          'Pick a type to start…'}
        disabled={!kind}
        className="w-full bg-[var(--c-bg)] border border-[var(--c-border)] rounded-xl px-3.5 py-3 text-sm text-[var(--c-text)] placeholder-[var(--c-text5)] focus:outline-none focus:border-[#b0e455]/50 transition resize-none disabled:opacity-50"
      />

      {/* Confidence */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono">Confidence</label>
          <span className="text-sm font-bold text-[var(--c-text)] tabular-nums">{confidence}/10</span>
        </div>
        <input
          type="range" min={1} max={10} step={1}
          value={confidence}
          onChange={e => setConfidence(Number(e.target.value))}
          className="w-full accent-[#b0e455]"
        />
        <div className="flex justify-between text-[9px] text-[var(--c-text5)] font-mono mt-1">
          <span>1</span><span>5</span><span>10</span>
        </div>
      </div>

      {/* Photo */}
      <div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="hidden"
        />
        {photoPreview ? (
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoPreview} alt="" className="max-h-40 rounded-xl" />
            <button
              type="button"
              onClick={clearPhoto}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition"
              aria-label="Remove photo"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-xs text-[var(--c-text3)] hover:text-[var(--c-text)] transition flex items-center gap-1.5"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Add photo (optional)
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-3 py-2">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      <button
        type="button"
        onClick={post}
        disabled={!canPost}
        className="w-full py-3 rounded-xl bg-[#b0e455] text-[#0f1a0c] text-sm font-semibold hover:bg-[#c9f070] transition disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {posting ? 'Posting…' : 'Post'}
      </button>
    </div>
  )
}
