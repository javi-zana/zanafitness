'use client'

import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SplitExercise = { id: string; name: string; sets: number | null; reps: string }
export type SplitDay = { id: string; label: string; muscleGroups: string[]; exercises: SplitExercise[] }
export type StructuredSplit = { type: 'structured_split'; days: SplitDay[] }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2, 10) }
function emptyExercise(): SplitExercise { return { id: uid(), name: '', sets: null, reps: '' } }
function emptyDay(): SplitDay { return { id: uid(), label: '', muscleGroups: [], exercises: [emptyExercise()] } }

const PRESET_MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Core',
  'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Full Body', 'Cardio', 'Rest',
]

function extractCustomGroups(days: SplitDay[]): string[] {
  const customs = new Set<string>()
  for (const day of days) {
    for (const g of day.muscleGroups) {
      if (!PRESET_MUSCLE_GROUPS.includes(g)) customs.add(g)
    }
  }
  return Array.from(customs)
}

// ─── SplitBuilder (coach editor) ─────────────────────────────────────────────

export function SplitBuilder({
  initial,
  memberName,
  onSave,
}: {
  initial: StructuredSplit | null
  memberName?: string
  onSave: (data: StructuredSplit) => Promise<void>
}) {
  const startDays = initial?.days ?? [emptyDay()]
  const [days, setDays] = useState<SplitDay[]>(startDays)
  const [expandedId, setExpandedId] = useState<string | null>(startDays[0]?.id ?? null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [sharedCustomGroups, setSharedCustomGroups] = useState<string[]>(() => extractCustomGroups(startDays))
  const [customInput, setCustomInput] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  function updateDays(updater: (prev: SplitDay[]) => SplitDay[]) {
    setDays(updater)
    setSaved(false)
  }

  // ── Day operations ──────────────────────────────────────────────────────────

  function addDay() {
    const d = emptyDay()
    updateDays(prev => [...prev, d])
    setExpandedId(d.id)
  }

  function requestDeleteDay(id: string) {
    const day = days.find(d => d.id === id)
    const hasExercises = day?.exercises.some(e => e.name.trim()) ?? false
    if (hasExercises) {
      setConfirmDeleteId(id)
    } else {
      removeDay(id)
    }
  }

  function removeDay(id: string) {
    setConfirmDeleteId(null)
    updateDays(prev => prev.filter(d => d.id !== id))
    setExpandedId(prev => prev === id ? null : prev)
  }

  function moveDay(id: string, dir: -1 | 1) {
    updateDays(prev => {
      const idx = prev.findIndex(d => d.id === id)
      if (idx < 0) return prev
      const next = [...prev]
      const swap = idx + dir
      if (swap < 0 || swap >= next.length) return prev
      ;[next[idx], next[swap]] = [next[swap], next[idx]]
      return next
    })
  }

  function updateDayLabel(id: string, label: string) {
    updateDays(prev => prev.map(d => d.id === id ? { ...d, label } : d))
  }

  function toggleMuscleGroup(dayId: string, group: string) {
    updateDays(prev => prev.map(d => {
      if (d.id !== dayId) return d
      const has = d.muscleGroups.includes(group)
      return { ...d, muscleGroups: has ? d.muscleGroups.filter(g => g !== group) : [...d.muscleGroups, group] }
    }))
  }

  function addCustomGroup(dayId: string) {
    const val = customInput.trim()
    if (!val) return
    if (!sharedCustomGroups.includes(val)) {
      setSharedCustomGroups(prev => [...prev, val])
    }
    updateDays(prev => prev.map(d => {
      if (d.id !== dayId) return d
      if (d.muscleGroups.includes(val)) return d
      return { ...d, muscleGroups: [...d.muscleGroups, val] }
    }))
    setCustomInput('')
  }

  // ── Exercise operations ─────────────────────────────────────────────────────

  function addExercise(dayId: string) {
    updateDays(prev => prev.map(d => {
      if (d.id !== dayId) return d
      return { ...d, exercises: [...d.exercises, emptyExercise()] }
    }))
  }

  function removeExercise(dayId: string, exId: string) {
    updateDays(prev => prev.map(d => {
      if (d.id !== dayId) return d
      const next = d.exercises.filter(e => e.id !== exId)
      return { ...d, exercises: next.length ? next : [emptyExercise()] }
    }))
  }

  function updateExercise(dayId: string, exId: string, field: 'name' | 'sets' | 'reps', value: string) {
    updateDays(prev => prev.map(d => {
      if (d.id !== dayId) return d
      return {
        ...d,
        exercises: d.exercises.map(e => {
          if (e.id !== exId) return e
          if (field === 'sets') return { ...e, sets: value === '' ? null : Math.max(1, Number(value)) }
          return { ...e, [field]: value }
        }),
      }
    }))
  }

  // ── Save ────────────────────────────────────────────────────────────────────

  async function handleSave() {
    setSaving(true)
    // Trim empty exercise rows before saving
    const trimmedDays = days.map(day => ({
      ...day,
      exercises: day.exercises.filter(e => e.name.trim()),
    }))
    await onSave({ type: 'structured_split', days: trimmedDays })
    setDays(trimmedDays)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setSaving(false)
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between mb-1">
        {memberName && (
          <p className="text-[10px] text-[var(--c-text4)] font-mono uppercase tracking-widest">
            {memberName}&apos;s split
          </p>
        )}
        <button
          onClick={addDay}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--c-card2)] border border-[var(--c-border2)] text-[10px] font-mono uppercase tracking-widest text-[var(--c-accent-text)] hover:bg-[var(--c-hover)] transition"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          Add Day
        </button>
      </div>

      {/* Day cards */}
      {days.map((day, idx) => {
        const isExpanded = expandedId === day.id
        const displayLabel = day.label || `Day ${idx + 1}`
        // Hide summary groups that duplicate the day label (e.g. label="Rest", group="Rest")
        const summaryGroups = day.muscleGroups.filter(g => g !== day.label)
        const isConfirmDelete = confirmDeleteId === day.id
        const allChips = [...PRESET_MUSCLE_GROUPS, ...sharedCustomGroups.filter(g => !PRESET_MUSCLE_GROUPS.includes(g))]

        return (
          <div key={day.id} className="rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] overflow-hidden">
            {/* Card header */}
            <div className="flex items-center gap-2 px-4 py-3">
              <button
                onClick={() => setExpandedId(isExpanded ? null : day.id)}
                aria-label={isExpanded ? 'Collapse day' : 'Expand day'}
                className="text-[var(--c-text4)] hover:text-[var(--c-text)] transition shrink-0"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                  <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <button
                onClick={() => setExpandedId(isExpanded ? null : day.id)}
                className="flex-1 text-left min-w-0"
              >
                <p className="text-sm font-semibold text-[var(--c-text)] truncate">{displayLabel}</p>
                {!isExpanded && summaryGroups.length > 0 && (
                  <p className="text-[10px] text-[var(--c-text4)] font-mono mt-0.5 truncate">{summaryGroups.join(' · ')}</p>
                )}
              </button>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => moveDay(day.id, -1)}
                  disabled={idx === 0}
                  aria-label="Move day up"
                  className="w-6 h-6 flex items-center justify-center text-[var(--c-text4)] hover:text-[var(--c-text)] transition disabled:opacity-20"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                    <path d="M5 15l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  onClick={() => moveDay(day.id, 1)}
                  disabled={idx === days.length - 1}
                  aria-label="Move day down"
                  className="w-6 h-6 flex items-center justify-center text-[var(--c-text4)] hover:text-[var(--c-text)] transition disabled:opacity-20"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                    <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  onClick={() => requestDeleteDay(day.id)}
                  aria-label="Delete day"
                  className="w-6 h-6 flex items-center justify-center text-[var(--c-text4)] hover:text-red-400 transition ml-1"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Delete confirmation strip */}
            {isConfirmDelete && (
              <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-red-500/8 border-t border-red-400/20">
                <p className="text-xs text-red-400">Delete &quot;{displayLabel}&quot; and its exercises?</p>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="text-[10px] font-mono uppercase tracking-widest text-[var(--c-text4)] hover:text-[var(--c-text)] transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => removeDay(day.id)}
                    className="text-[10px] font-mono uppercase tracking-widest text-red-400 hover:text-red-300 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}

            {/* Expanded content */}
            {isExpanded && (
              <div className="border-t border-[var(--c-border)] px-4 py-4 space-y-4">
                {/* Label input */}
                <div>
                  <p className="text-[10px] text-[var(--c-text4)] font-mono uppercase tracking-widest mb-1.5">Day Label</p>
                  <input
                    type="text"
                    value={day.label}
                    onChange={e => updateDayLabel(day.id, e.target.value)}
                    placeholder="e.g. Push Day, Leg Day, Rest…"
                    className="w-full bg-[var(--c-bg)] border border-[var(--c-border2)] rounded-xl px-3 py-2 text-sm text-[var(--c-text)] placeholder-[var(--c-text5)] focus:outline-none focus:border-[#b0e455]/40 transition"
                  />
                </div>

                {/* Muscle groups */}
                <div>
                  <p className="text-[10px] text-[var(--c-text4)] font-mono uppercase tracking-widest mb-2">Muscle Groups</p>
                  <div className="flex flex-wrap gap-1.5">
                    {allChips.map(group => {
                      const active = day.muscleGroups.includes(group)
                      return (
                        <button
                          key={group}
                          onClick={() => toggleMuscleGroup(day.id, group)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition ${
                            active
                              ? 'bg-[#b0e455] text-[#0f1a0c] font-semibold'
                              : 'bg-[var(--c-card2)] border border-[var(--c-border)] text-[var(--c-text3)] hover:text-[var(--c-text)]'
                          }`}
                        >
                          {group}
                        </button>
                      )
                    })}
                  </div>
                  {/* Shared custom group input */}
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={customInput}
                      onChange={e => setCustomInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomGroup(day.id) } }}
                      placeholder="Custom group…"
                      className="flex-1 bg-[var(--c-bg)] border border-[var(--c-border2)] rounded-xl px-3 py-1.5 text-sm text-[var(--c-text)] placeholder-[var(--c-text5)] focus:outline-none focus:border-[#b0e455]/40 transition"
                    />
                    <button
                      onClick={() => addCustomGroup(day.id)}
                      disabled={!customInput.trim()}
                      className="px-3 py-1.5 rounded-xl bg-[var(--c-card2)] border border-[var(--c-border2)] text-[10px] font-mono uppercase tracking-widest text-[var(--c-accent-text)] hover:bg-[var(--c-hover)] transition disabled:opacity-30"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Exercise table */}
                <div>
                  <div className="grid grid-cols-[1fr_52px_80px_24px] gap-1.5 px-1 mb-1">
                    {['Exercise', 'Sets', 'Reps / Duration', ''].map((h, i) => (
                      <p key={i} className="text-[9px] font-semibold text-[var(--c-text4)] uppercase tracking-widest text-center first:text-left">{h}</p>
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    {day.exercises.map(ex => (
                      <div key={ex.id} className="grid grid-cols-[1fr_52px_80px_24px] gap-1.5 items-center">
                        <input
                          type="text"
                          value={ex.name}
                          onChange={e => updateExercise(day.id, ex.id, 'name', e.target.value)}
                          placeholder="Exercise name"
                          className="bg-[var(--c-bg)] border border-[var(--c-border2)] rounded-xl px-3 py-2 text-sm text-[var(--c-text)] placeholder-[var(--c-text5)] focus:outline-none focus:border-[#b0e455]/40 transition"
                        />
                        <input
                          type="number"
                          min="1"
                          value={ex.sets ?? ''}
                          onChange={e => updateExercise(day.id, ex.id, 'sets', e.target.value)}
                          placeholder="—"
                          className="bg-[var(--c-bg)] border border-[var(--c-border2)] rounded-xl px-2 py-2 text-sm text-[var(--c-text)] text-center placeholder-[var(--c-text5)] focus:outline-none focus:border-[#b0e455]/40 transition"
                        />
                        <input
                          type="text"
                          value={ex.reps}
                          onChange={e => updateExercise(day.id, ex.id, 'reps', e.target.value)}
                          placeholder="e.g. 8-10"
                          className="bg-[var(--c-bg)] border border-[var(--c-border2)] rounded-xl px-2 py-2 text-sm text-[var(--c-text)] text-center placeholder-[var(--c-text5)] focus:outline-none focus:border-[#b0e455]/40 transition"
                        />
                        <button
                          onClick={() => removeExercise(day.id, ex.id)}
                          aria-label="Remove exercise"
                          className="w-6 h-6 flex items-center justify-center text-[var(--c-text4)] hover:text-red-400 transition rounded-full"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => addExercise(day.id)}
                    className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[var(--c-accent-text)] hover:opacity-75 transition"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                    </svg>
                    Add exercise
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {days.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-[var(--c-text4)]">No days yet. Click &quot;Add Day&quot; to start building the split.</p>
        </div>
      )}

      {/* Save button — disabled while saving or already saved (reset on any edit) */}
      <button
        onClick={handleSave}
        disabled={saving || saved}
        className="w-full py-3.5 rounded-2xl bg-[#b0e455] text-[#0f1a0c] text-xs tracking-widest uppercase font-mono font-semibold hover:bg-[#c9f070] transition disabled:opacity-40 mt-2"
      >
        {saved ? 'Saved ✓' : saving ? 'Saving…' : 'Save Split'}
      </button>
    </div>
  )
}

// ─── SplitViewer (member read-only) ──────────────────────────────────────────

function exerciseTarget(ex: SplitExercise): string {
  if (ex.sets != null && ex.reps) return `${ex.sets} sets × ${ex.reps}`
  if (ex.sets != null) return `${ex.sets} sets`
  if (ex.reps) return ex.reps
  return '—'
}

export function SplitViewer({
  split,
}: {
  split: StructuredSplit
}) {
  const [expandedId, setExpandedId] = useState<string | null>(split.days[0]?.id ?? null)

  return (
    <div className="space-y-3">
      {split.days.map(day => {
        const isExpanded = expandedId === day.id
        const namedExercises = day.exercises.filter(e => e.name)
        // Suppress muscle group chips that duplicate the day label in collapsed summary
        const summaryGroups = day.muscleGroups.filter(g => g !== day.label)
        return (
          <div key={day.id} className="rounded-2xl bg-[var(--c-card)] border border-[var(--c-border)] overflow-hidden">
            {/* Header */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : day.id)}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-[var(--c-hover)] transition"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--c-text)]">{day.label}</p>
                {summaryGroups.length > 0 && (
                  <p className="text-[10px] text-[var(--c-text4)] font-mono mt-0.5 truncate">{summaryGroups.join(' · ')}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {namedExercises.length > 0 && (
                  <span className="text-[10px] font-mono text-[var(--c-text4)] bg-[var(--c-card2)] border border-[var(--c-border)] px-2 py-0.5 rounded-full">
                    {namedExercises.length}
                  </span>
                )}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-4 h-4 text-[var(--c-text4)] transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                  <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </button>

            {/* Expanded body */}
            {isExpanded && (
              <div className="border-t border-[var(--c-border)] px-4 py-4 space-y-4">
                {/* Muscle group pills */}
                {day.muscleGroups.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {day.muscleGroups.map(group => (
                      <span
                        key={group}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-[#b0e455]/15 text-[var(--c-accent-text)] border border-[#b0e455]/20"
                      >
                        {group}
                      </span>
                    ))}
                  </div>
                )}

                {/* Exercise list */}
                {namedExercises.length > 0 && (
                  <div className="space-y-1">
                    {namedExercises.map(ex => (
                      <div key={ex.id} className="flex items-center justify-between py-2 border-b border-[var(--c-border)] last:border-0">
                        <p className="text-sm text-[var(--c-text)]">{ex.name}</p>
                        <p className="text-[11px] font-mono text-[var(--c-text3)] shrink-0 ml-3">{exerciseTarget(ex)}</p>
                      </div>
                    ))}
                  </div>
                )}

                {namedExercises.length === 0 && (
                  <p className="text-xs text-[var(--c-text4)]">No exercises scheduled for this day.</p>
                )}
              </div>
            )}
          </div>
        )
      })}

      {split.days.length === 0 && (
        <p className="text-sm text-[var(--c-text4)] text-center py-8">No days in this split yet.</p>
      )}
    </div>
  )
}
