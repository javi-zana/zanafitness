'use client'

import { useState, useEffect, useRef, FormEvent } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/utils/supabase/client'
import { SplitViewer, StructuredSplit, SplitDay } from '@/components/SplitBuilder'
import { OkrCard, type OkrContent } from '@/components/OkrCard'

const RichTextViewer = dynamic(() => import('@/components/RichTextViewer'), { ssr: false })
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false })

// ─── Types ────────────────────────────────────────────────────────────────────

type WorkoutLogRecord = { id: string; logged_date: string; notes: string | Record<string, unknown> | null }

type BmrContent = {
  type: 'bmr'
  bmr: number
  tdee: number
  calorie_target: number
  protein_g: number
  notes: string
}

type SectionData = { section: string; content_json: object; updated_at: string } | null

type CoachNote = {
  id: string
  author_id: string
  author_name: string
  body: string
  created_at: string
  updated_at: string
}

type Props = {
  firstName: string | null
  okr: SectionData
  split: SectionData
  food: SectionData
  milestones: string[]
  notes: CoachNote[]
}

type Module = 'split' | 'food' | 'notes'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hasContent(json: object | null | undefined) {
  if (!json) return false
  const j = json as { content?: unknown[] }
  return Object.keys(json).length > 0 && (j.content?.length ?? 0) > 0
}

function relativeTime(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
  if (days === 0) return 'Updated today'
  if (days === 1) return 'Updated yesterday'
  return `Updated ${days} days ago`
}

// ─── Streak helper ────────────────────────────────────────────────────────────

function computeStreak(dates: string[]): number {
  if (!dates.length) return 0
  const dateSet = new Set(dates)
  const toKey = (d: Date) => d.toISOString().split('T')[0]
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let check = new Date(today)
  if (!dateSet.has(toKey(check))) {
    check.setDate(check.getDate() - 1)
    if (!dateSet.has(toKey(check))) return 0
  }
  let streak = 0
  while (dateSet.has(toKey(check))) {
    streak++
    check.setDate(check.getDate() - 1)
  }
  return streak
}

// ─── Workout log section ──────────────────────────────────────────────────────

type ExerciseRow = { id: number; move: string; kg: string; reps: string; sets: string; targetReps?: string }
type ParsedExercise = { move: string; kg: string; reps: string; sets: string }

function parseWorkoutNotes(raw: string | Record<string, unknown> | null): { exercises: ParsedExercise[]; notes: string | null } {
  if (!raw) return { exercises: [], notes: null }
  try {
    const p = typeof raw === 'string' ? JSON.parse(raw) : raw
    return { exercises: (p.exercises as ParsedExercise[] | undefined) ?? [], notes: (p.notes as string | null | undefined) ?? null }
  } catch {
    return { exercises: [], notes: null }
  }
}

function WorkoutHistory({ logs }: { logs: WorkoutLogRecord[] }) {
  const [expandedDate, setExpandedDate] = useState<string | null>(logs[0]?.logged_date ?? null)
  if (!logs.length) return null
  return (
    <div className="mt-6 space-y-2">
      <p className="text-[10px] text-[var(--c-text4)] font-mono uppercase tracking-widest mb-3">Recent workouts</p>
      {logs.slice(0, 10).map(log => {
        const { exercises, notes: logNotes } = parseWorkoutNotes(log.notes)
        const isExpanded = expandedDate === log.logged_date
        const d = new Date(log.logged_date + 'T12:00:00')
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        return (
          <div key={log.logged_date} className="bg-[var(--c-card)] shadow-sm rounded-2xl border border-[var(--c-border)] overflow-hidden">
            <button
              onClick={() => setExpandedDate(isExpanded ? null : log.logged_date)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[var(--c-hover)] transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#b0e455]/15 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#b0e455" strokeWidth="2.5" className="w-3 h-3">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-[var(--c-text)]">{dayLabel}</p>
              </div>
              <div className="flex items-center gap-2">
                {exercises.length > 0 && (
                  <span className="text-[10px] text-[var(--c-text4)] font-mono">{exercises.length} exercise{exercises.length !== 1 ? 's' : ''}</span>
                )}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-3.5 h-3.5 text-[var(--c-text4)] transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                  <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </button>
            {isExpanded && (
              <div className="border-t border-[var(--c-border)] px-4 py-3 space-y-3">
                {exercises.length > 0 ? (
                  <div className="space-y-1">
                    <div className="grid grid-cols-[1fr_52px_44px_44px] gap-1 px-1 mb-1">
                      {['Move', 'kg', 'Reps', 'Sets'].map(h => (
                        <p key={h} className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-wider text-center first:text-left">{h}</p>
                      ))}
                    </div>
                    {exercises.map((ex, i) => (
                      <div key={i} className="grid grid-cols-[1fr_52px_44px_44px] gap-1 items-center py-1 border-b border-[var(--c-border)] last:border-0">
                        <p className="text-sm text-[var(--c-text)]">{ex.move}</p>
                        <p className="text-sm text-[var(--c-text3)] font-mono text-center">{ex.kg || '—'}</p>
                        <p className="text-sm text-[var(--c-text3)] font-mono text-center">{ex.reps || '—'}</p>
                        <p className="text-sm text-[var(--c-text3)] font-mono text-center">{ex.sets || '—'}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--c-text4)]">No exercises recorded</p>
                )}
                {logNotes && (
                  <p className="text-xs text-[var(--c-text3)] italic border-t border-[var(--c-border)] pt-2">{logNotes}</p>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function WorkoutLogSection({
  userId,
  workoutLogs,
  milestones,
  onLogged,
  split,
  triggerDay,
  onTriggerConsumed,
}: {
  userId: string
  workoutLogs: WorkoutLogRecord[]
  milestones: string[]
  onLogged: (date: string, newMilestones: string[], newLog: WorkoutLogRecord) => void
  split?: StructuredSplit | null
  triggerDay?: SplitDay | null
  onTriggerConsumed?: () => void
}) {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]
  const workoutDates = workoutLogs.map(w => w.logged_date)
  const todayLog = workoutLogs.find(w => w.logged_date === today)
  const todayLogged = !!todayLog
  const historyLogs = workoutLogs.filter(w => w.logged_date !== today)

  const [step, setStep] = useState<'idle' | 'picking' | 'logging'>('idle')
  const [selectedDay, setSelectedDay] = useState<SplitDay | null>(null)
  const [rows, setRows] = useState<ExerciseRow[]>([{ id: 1, move: '', kg: '', reps: '', sets: '' }])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const sectionElRef = useRef<HTMLElement | null>(null)
  const sectionRef = (el: HTMLElement | null) => { sectionElRef.current = el }
  let nextId = rows.length + 1

  useEffect(() => {
    if (step !== 'idle') {
      setTimeout(() => sectionElRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    }
  }, [step])

  function applyPreset(day: SplitDay) {
    setSelectedDay(day)
    const filled = day.exercises
      .filter(e => e.name)
      .map((e, i) => ({
        id: i + 1,
        move: e.name,
        kg: '',
        reps: '',
        sets: e.sets != null ? String(e.sets) : '',
        targetReps: e.reps || '',
      }))
    setRows(filled.length ? filled : [{ id: 1, move: '', kg: '', reps: '', sets: '' }])
    nextId = filled.length + 1
    setStep('logging')
  }

  function resetForm() {
    setStep('idle')
    setSelectedDay(null)
    setRows([{ id: 1, move: '', kg: '', reps: '', sets: '' }])
    setNotes('')
  }

  // When SplitViewer's "Log Day X" button fires
  useEffect(() => {
    if (triggerDay) {
      applyPreset(triggerDay)
      onTriggerConsumed?.()
    }
  }, [triggerDay]) // eslint-disable-line react-hooks/exhaustive-deps

  function updateRow(id: number, field: keyof ExerciseRow, value: string) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
  }

  function addRow() {
    setRows(prev => [...prev, { id: nextId++, move: '', kg: '', reps: '', sets: '' }])
  }

  function removeRow(id: number) {
    setRows(prev => prev.length > 1 ? prev.filter(r => r.id !== id) : prev)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSaveError(null)
    const exercises = rows.filter(r => r.move.trim()).map(({ targetReps: _t, ...r }) => r)
    const notesPayload = { v: 1, exercises, notes: notes.trim() || null }
    const { data: upserted, error: upsertErr } = await supabase
      .from('workout_logs')
      .upsert({ member_id: userId, logged_date: today, notes: notesPayload }, { onConflict: 'member_id,logged_date' })
      .select('id')
      .single()

    if (upsertErr) {
      console.error('[workout_logs] upsert error:', upsertErr)
      setSaveError('Failed to save — please try again.')
      setLoading(false)
      return
    }

    const newDates = workoutDates.includes(today) ? workoutDates : [today, ...workoutDates]
    const streak = computeStreak(newDates)
    const toAward: string[] = []

    const STREAK_MILESTONES: [number, string][] = [[3, 'streak_3'], [7, 'streak_7'], [14, 'streak_14'], [30, 'streak_30']]
    if (!milestones.includes('first_workout')) toAward.push('first_workout')
    for (const [n, type] of STREAK_MILESTONES) {
      if (streak >= n && !milestones.includes(type)) toAward.push(type)
    }

    if (toAward.length) {
      await supabase.from('member_milestones').insert(
        toAward.map(type => ({ member_id: userId, type }))
      )
    }

    onLogged(today, toAward, { id: upserted?.id ?? today, logged_date: today, notes: notesPayload })
    resetForm()
    setLoading(false)
  }

  if (todayLogged) {
    const { exercises } = parseWorkoutNotes(todayLog.notes)
    return (
      <div className="mt-6 space-y-1 pt-6 border-t border-[var(--c-border)]">
        <div className="flex items-center gap-3 bg-[#b0e455]/8 border border-[var(--c-border2)] rounded-2xl p-4">
          <div className="w-8 h-8 rounded-full bg-[#b0e455] flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="#0f1a0c" strokeWidth="2.5" className="w-4 h-4">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--c-accent-text)]">Workout logged for today</p>
            <p className="text-xs text-[var(--c-text3)] mt-0.5">
              Streak: {computeStreak(workoutDates)} day{computeStreak(workoutDates) !== 1 ? 's' : ''}
              {exercises.length > 0 ? ` · ${exercises.length} exercise${exercises.length !== 1 ? 's' : ''}` : ''}
            </p>
          </div>
        </div>
        <WorkoutHistory logs={historyLogs} />
      </div>
    )
  }

  // Step: day picker
  if (step === 'picking') {
    return (
      <div ref={sectionRef} className="mt-6 pt-6 border-t border-[var(--c-border)] space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-[var(--c-text2)]">Which session today?</p>
          <button onClick={resetForm} className="text-[var(--c-text4)] hover:text-[var(--c-text)] transition">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {split!.days.map(day => (
          <button
            key={day.id}
            onClick={() => applyPreset(day)}
            className="w-full flex items-start gap-3 p-4 rounded-2xl border border-[var(--c-border)] hover:border-[#b0e455]/40 hover:bg-[#b0e455]/4 transition text-left"
          >
            <div className="w-7 h-7 rounded-full bg-[#b0e455]/10 flex items-center justify-center shrink-0 mt-0.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="#b0e455" strokeWidth="2" className="w-3.5 h-3.5">
                <path d="M6 5v14M10 8l4 4-4 4M14 5v14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--c-text)]">{day.label}</p>
              {day.muscleGroups.length > 0 && (
                <p className="text-xs text-[var(--c-text4)] mt-0.5">{day.muscleGroups.join(' · ')}</p>
              )}
              {day.exercises.filter(e => e.name).length > 0 && (
                <p className="text-xs text-[var(--c-text4)] mt-0.5">
                  {day.exercises.filter(e => e.name).length} exercise{day.exercises.filter(e => e.name).length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-[var(--c-text4)] shrink-0 mt-1">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
        <button
          onClick={() => setStep('logging')}
          className="w-full py-3 rounded-2xl border border-[var(--c-border)] text-sm text-[var(--c-text3)] hover:text-[var(--c-text)] hover:border-[var(--c-border2)] transition"
        >
          Custom / No preset
        </button>
      </div>
    )
  }

  // Step: logging form
  if (step === 'logging') {
    return (
      <form ref={sectionRef} onSubmit={handleSubmit} className="mt-6 space-y-4 bg-[var(--c-card)] shadow-sm rounded-2xl p-5 border border-[var(--c-border)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--c-text2)]">Log today's workout</p>
            {selectedDay && (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#b0e455] shrink-0" />
                <p className="text-xs text-[var(--c-accent-text)]">{selectedDay.label}</p>
                <button
                  type="button"
                  onClick={() => { setSelectedDay(null); setRows([{ id: 1, move: '', kg: '', reps: '', sets: '' }]) }}
                  className="text-[10px] text-[var(--c-text4)] hover:text-[var(--c-text)] transition underline"
                >
                  change
                </button>
              </div>
            )}
          </div>
          <button type="button" onClick={resetForm} className="text-[var(--c-text4)] hover:text-[var(--c-text)] transition">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Exercise rows — stacked layout for mobile readability */}
        <div className="space-y-3">
          {rows.map(row => (
            <div key={row.id} className="space-y-1.5">
              <input
                value={row.move}
                onChange={e => updateRow(row.id, 'move', e.target.value)}
                placeholder="Exercise name"
                className="w-full bg-[var(--c-bg)] border border-[var(--c-border2)] rounded-xl px-3 py-2.5 text-sm text-[var(--c-text)] placeholder-[var(--c-text5)] focus:outline-none focus:border-[#b0e455]/40 transition"
              />
              <div className="grid grid-cols-[1fr_1fr_1fr_28px] gap-1.5 items-end">
                <div>
                  <p className="text-[9px] text-[var(--c-text5)] font-mono uppercase tracking-widest text-center mb-1">kg</p>
                  <input
                    value={row.kg}
                    onChange={e => updateRow(row.id, 'kg', e.target.value)}
                    placeholder="—"
                    type="number"
                    min="0"
                    className="w-full bg-[var(--c-bg)] border border-[var(--c-border2)] rounded-xl px-2 py-2 text-sm text-[var(--c-text)] text-center placeholder-[var(--c-text5)] focus:outline-none focus:border-[#b0e455]/40 transition"
                  />
                </div>
                <div>
                  <p className="text-[9px] text-[var(--c-text5)] font-mono uppercase tracking-widest text-center mb-1">Reps</p>
                  <input
                    value={row.reps}
                    onChange={e => updateRow(row.id, 'reps', e.target.value)}
                    placeholder={row.targetReps || '—'}
                    className="w-full bg-[var(--c-bg)] border border-[var(--c-border2)] rounded-xl px-2 py-2 text-sm text-[var(--c-text)] text-center placeholder-[var(--c-text5)] focus:outline-none focus:border-[#b0e455]/40 transition"
                  />
                </div>
                <div>
                  <p className="text-[9px] text-[var(--c-text5)] font-mono uppercase tracking-widest text-center mb-1">Sets</p>
                  <input
                    value={row.sets}
                    onChange={e => updateRow(row.id, 'sets', e.target.value)}
                    placeholder="—"
                    type="number"
                    min="0"
                    className="w-full bg-[var(--c-bg)] border border-[var(--c-border2)] rounded-xl px-2 py-2 text-sm text-[var(--c-text)] text-center placeholder-[var(--c-text5)] focus:outline-none focus:border-[#b0e455]/40 transition"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  className="w-7 h-7 mb-0.5 flex items-center justify-center text-[var(--c-text4)] hover:text-red-400 transition rounded-full"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-1.5 text-xs font-medium text-[var(--c-accent-text)] hover:opacity-75 transition"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          Add exercise
        </button>

        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          maxLength={300}
          rows={2}
          placeholder="Any notes? (optional)"
          className="w-full bg-[var(--c-bg)] border border-[var(--c-border2)] rounded-2xl px-4 py-3 text-sm text-[var(--c-text)] placeholder-[var(--c-text5)] focus:outline-none focus:border-[#b0e455]/40 transition resize-none"
        />

        {saveError && (
          <p className="text-xs text-red-400 text-center">{saveError}</p>
        )}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={resetForm}
            className="flex-1 py-3 rounded-2xl border border-[var(--c-border)] text-sm text-[var(--c-text3)] hover:text-[var(--c-text)] transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 rounded-2xl bg-[#b0e455] text-[#0f1a0c] text-sm font-semibold hover:bg-[#c9f070] transition disabled:opacity-50"
          >
            {loading ? 'Saving…' : 'Log It'}
          </button>
        </div>
      </form>
    )
  }

  // Step: idle — show Log button
  return (
    <div className="mt-6 pt-6 border-t border-[var(--c-border)]">
      <button
        onClick={() => split?.days?.length ? setStep('picking') : setStep('logging')}
        className="w-full flex items-center justify-center gap-2 bg-[#b0e455] text-[#0f1a0c] py-3.5 rounded-2xl text-sm font-semibold hover:bg-[#c9f070] transition active:scale-[0.98]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Log Today's Workout
      </button>
      <WorkoutHistory logs={historyLogs} />
    </div>
  )
}

// ─── BMR display (member-facing food tab) ─────────────────────────────────────

function BmrDisplay({ data }: { data: BmrContent }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--c-card)] shadow-sm rounded-2xl p-4 border border-[var(--c-border)]">
          <p className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-widest">Daily Calories</p>
          <p className="text-2xl font-bold text-[var(--c-accent-text)] mt-1">{data.calorie_target}</p>
          <p className="text-[10px] text-[var(--c-text4)] mt-0.5">kcal target</p>
        </div>
        {data.protein_g > 0 && (
          <div className="bg-[var(--c-card)] shadow-sm rounded-2xl p-4 border border-[var(--c-border)]">
            <p className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-widest">Protein</p>
            <p className="text-2xl font-bold text-[var(--c-text)] mt-1">{data.protein_g}<span className="text-sm text-[var(--c-text3)]">g</span></p>
            <p className="text-[10px] text-[var(--c-text4)] mt-0.5">daily target</p>
          </div>
        )}
      </div>

      <div className="bg-[var(--c-card)] shadow-sm rounded-2xl p-4 border border-[var(--c-border)] space-y-2">
        <p className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-widest mb-2">Your Numbers</p>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--c-text3)]">BMR (at rest)</span>
          <span className="text-[var(--c-text)] font-mono">{data.bmr} kcal</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--c-text3)]">TDEE (with activity)</span>
          <span className="text-[var(--c-text)] font-mono">{data.tdee} kcal</span>
        </div>
        <div className="flex justify-between text-sm border-t border-[var(--c-border)] pt-2 mt-1">
          <span className="text-[var(--c-accent-text)]">Your target</span>
          <span className="text-[var(--c-accent-text)] font-mono font-semibold">{data.calorie_target} kcal</span>
        </div>
      </div>

      {data.notes ? (
        <div className="bg-[var(--c-card)] shadow-sm rounded-2xl p-4 border border-[var(--c-border)]">
          <p className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-widest mb-2">Coach's Notes</p>
          <p className="text-sm text-[var(--c-text2)] leading-relaxed">{data.notes}</p>
        </div>
      ) : null}
    </div>
  )
}

// ─── Coach notes feed (read-only) ────────────────────────────────────────────

function formatNoteDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: now.getFullYear() === d.getFullYear() ? undefined : 'numeric' })
}

function CoachNotesFeed({ notes }: { notes: CoachNote[] }) {
  if (!notes.length) {
    return (
      <div className="space-y-3 pt-2">
        <div className="bg-[var(--c-card)] shadow-sm rounded-2xl border border-[var(--c-border)] p-5">
          <div className="w-10 h-10 rounded-xl bg-[#b0e455]/10 border border-[var(--c-border2)] flex items-center justify-center mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="#b0e455" strokeWidth="1.5" className="w-5 h-5">
              <path d="M9 12h6M9 16h6M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2M9 4a2 2 0 002 2h2a2 2 0 002-2M9 4a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-[var(--c-text)]/80 mb-2">Coach Notes</p>
          <p className="text-sm text-[var(--c-text3)] leading-relaxed">
            Your coach will leave timestamped notes here from check-ins and calls — what's working, what to focus on next, anything you talked through.
          </p>
        </div>
        <div className="bg-[#b0e455]/6 border border-[var(--c-border2)] rounded-2xl p-4">
          <p className="text-xs text-[var(--c-accent-text)] font-medium">No notes yet.</p>
          <p className="text-xs text-[var(--c-text3)] mt-1">You'll see them here as soon as your coach adds one.</p>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-3">
      {notes.map(note => (
        <div key={note.id} className="bg-[var(--c-card)] shadow-sm rounded-2xl border border-[var(--c-border)] p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-[var(--c-accent-text)]">{note.author_name}</p>
            <p className="text-[10px] text-[var(--c-text4)] font-mono uppercase tracking-widest" suppressHydrationWarning>{formatNoteDate(note.created_at)}</p>
          </div>
          <p className="text-sm text-[var(--c-text2)] leading-relaxed whitespace-pre-wrap">{note.body}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-10 h-10 rounded-full bg-[#b0e455]/8 border border-[var(--c-border2)] flex items-center justify-center mb-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-[var(--c-text4)]">
          <path d="M9 12h6M9 16h6M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2M9 4a2 2 0 002 2h2a2 2 0 002-2M9 4a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="text-sm text-[var(--c-text4)]">{message}</p>
    </div>
  )
}

// ─── Module grid ─────────────────────────────────────────────────────────────

type ModuleMeta = { id: Module; label: string; subtitle: string; icon: React.ReactNode }

function ModuleGrid({
  modules,
  onSelect,
}: {
  modules: ModuleMeta[]
  onSelect: (m: Module) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {modules.map(m => (
        <button
          key={m.id}
          onClick={() => onSelect(m.id)}
          className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-2xl p-4 lg:p-5 text-left hover:border-[#b0e455]/30 hover:bg-[var(--c-hover)] transition active:scale-[0.98]"
        >
          <div className="w-9 h-9 rounded-xl bg-[#b0e455]/10 border border-[var(--c-border2)] flex items-center justify-center mb-3">
            {m.icon}
          </div>
          <p className="text-sm font-semibold text-[var(--c-text)]">{m.label}</p>
          <p className="text-[11px] text-[var(--c-text4)] mt-0.5">{m.subtitle}</p>
        </button>
      ))}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProgramClient({ firstName, okr, split, food, notes }: Props) {
  const [activeModule, setActiveModule] = useState<Module | null>(null)

  const structuredSplit: StructuredSplit | null = (() => {
    const c = split?.content_json as { type?: string } | null
    return c?.type === 'structured_split' ? (c as StructuredSplit) : null
  })()

  const okrContent: OkrContent | null = (() => {
    const c = okr?.content_json as { type?: string } | null
    if (c?.type === 'okr') return c as OkrContent
    return null
  })()

  const name = firstName ? `${firstName}'s` : 'Your'

  const modules: ModuleMeta[] = [
    {
      id: 'split',
      label: `${name} Split`,
      subtitle: 'Training plan',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#b0e455" strokeWidth="1.8" className="w-4 h-4">
          <path d="M6 5v14M10 8l4 4-4 4M14 5v14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'food',
      label: `${name} Food`,
      subtitle: 'Calories & protein',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#b0e455" strokeWidth="1.8" className="w-4 h-4">
          <path d="M12 2v20M5 7l7-5 7 5M5 7v10l7 5 7-5V7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'notes',
      label: 'Coach Notes',
      subtitle: notes.length > 0 ? `${notes.length} note${notes.length === 1 ? '' : 's'}` : 'From check-ins',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#b0e455" strokeWidth="1.8" className="w-4 h-4">
          <path d="M9 12h6M9 16h6M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2M9 4a2 2 0 002 2h2a2 2 0 002-2M9 4a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ]

  function renderModuleContent(mod: Module) {
    if (mod === 'notes') {
      return <CoachNotesFeed notes={notes} />
    }

    const sectionMap = { split, food }
    const section = sectionMap[mod]
    const content = section?.content_json ?? null
    const updatedAt = section?.updated_at

    if (mod === 'food' && content && (content as { type?: string }).type === 'bmr') {
      return <BmrDisplay data={content as BmrContent} />
    }

    if (mod === 'split' && structuredSplit) {
      return <SplitViewer split={structuredSplit} />
    }

    if (!hasContent(content)) {
      const sectionInfo: Record<string, { title: string; desc: string }> = {
        split: {
          title: 'Your Training Split',
          desc: 'Your coach will write a personalised workout plan here - days, exercises, sets, and reps structured around your goal and schedule.',
        },
        food: {
          title: 'Your Nutrition Plan',
          desc: 'Calorie targets, macro splits, meal timing guidance, and food choices tailored to your body and goal.',
        },
      }
      const info = sectionInfo[mod] ?? { title: 'Coming soon', desc: 'Your coach is working on this section.' }
      return (
        <div className="space-y-3 pt-2">
          <div className="bg-[var(--c-card)] shadow-sm rounded-2xl border border-[var(--c-border)] p-5">
            <div className="w-10 h-10 rounded-xl bg-[#b0e455]/10 border border-[var(--c-border2)] flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="#b0e455" strokeWidth="1.5" className="w-5 h-5">
                <path d="M9 12h6M9 16h6M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2M9 4a2 2 0 002 2h2a2 2 0 002-2M9 4a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-[var(--c-text)]/80 mb-2">{info.title}</p>
            <p className="text-sm text-[var(--c-text3)] leading-relaxed">{info.desc}</p>
          </div>
          <div className="bg-[#b0e455]/6 border border-[var(--c-border2)] rounded-2xl p-4">
            <p className="text-xs text-[var(--c-accent-text)] font-medium">Your coach is preparing this section.</p>
            <p className="text-xs text-[var(--c-text3)] mt-1">You'll see it here as soon as it's ready.</p>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        <RichTextViewer content={content} />
        {updatedAt && (
          <p className="text-xs text-[var(--c-text4)] pt-2" suppressHydrationWarning>{relativeTime(updatedAt)}</p>
        )}
      </div>
    )
  }

  const activeModuleMeta = activeModule ? modules.find(m => m.id === activeModule) : null

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] flex flex-col lg:pl-52">
      <div className="px-5 pt-12 pb-2 lg:px-10 lg:pt-10 lg:pb-4">
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">My Program</h1>
        <p className="text-xs text-[var(--c-text4)] mt-0.5">Training & nutrition</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 pb-28 lg:px-10 lg:pb-10 lg:py-8">
        {activeModule === null ? (
          <div className="space-y-6">
            <OkrCard okr={okrContent} />
            <ModuleGrid modules={modules} onSelect={setActiveModule} />
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => setActiveModule(null)}
              className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[var(--c-text4)] hover:text-[var(--c-text)] transition"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {activeModuleMeta?.label ?? 'Back'}
            </button>
            {renderModuleContent(activeModule)}
          </div>
        )}
      </div>

    </div>
  )
}
