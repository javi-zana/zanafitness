'use client'

import { useState, useEffect, FormEvent } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/utils/supabase/client'
import BottomNav from '@/components/BottomNav'

const RichTextViewer = dynamic(() => import('@/components/RichTextViewer'), { ssr: false })
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false })

// ─── Types ────────────────────────────────────────────────────────────────────

type BmrContent = {
  type: 'bmr'
  bmr: number
  tdee: number
  calorie_target: number
  protein_g: number
  notes: string
}

type HabitsContent = {
  type: 'habits'
  habits: { id: string; text: string }[]
}

type SectionData = { section: string; content_json: object; updated_at: string } | null
type PrinciplesData = { content_json: object; updated_at: string } | null

type Props = {
  userId: string
  firstName: string | null
  role: string
  split: SectionData
  food: SectionData
  habits: SectionData
  principles: PrinciplesData
  workoutDates: string[]
  milestones: string[]
}

type Tab = 'split' | 'food' | 'habits' | 'principles'

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

function WorkoutLogSection({
  userId,
  workoutDates,
  milestones,
  onLogged,
}: {
  userId: string
  workoutDates: string[]
  milestones: string[]
  onLogged: (date: string, newMilestones: string[]) => void
}) {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]
  const todayLogged = workoutDates.includes(today)
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    await supabase
      .from('workout_logs')
      .upsert({ member_id: userId, logged_date: today, notes: notes.trim() || null }, { onConflict: 'member_id,logged_date' })

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

    onLogged(today, toAward)
    setNotes('')
    setOpen(false)
    setLoading(false)
  }

  if (todayLogged) {
    return (
      <div className="flex items-center gap-3 bg-[#b0e455]/8 border border-[var(--c-border2)] rounded-2xl p-4 mt-6">
        <div className="w-8 h-8 rounded-full bg-[#b0e455] flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="#0f1a0c" strokeWidth="2.5" className="w-4 h-4">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#b0e455]">Workout logged for today</p>
          <p className="text-xs text-[var(--c-text3)] mt-0.5">Streak: {computeStreak(workoutDates)} day{computeStreak(workoutDates) !== 1 ? 's' : ''}</p>
        </div>
      </div>
    )
  }

  if (open) {
    return (
      <form onSubmit={handleSubmit} className="mt-6 space-y-4 bg-[var(--c-card2)] rounded-2xl p-5 border border-[var(--c-border)]">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-[var(--c-text2)]">Log today's workout</p>
          <button type="button" onClick={() => setOpen(false)} className="text-[var(--c-text4)] hover:text-[var(--c-text)] transition">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Optional notes - what did you do? How did it feel?"
          className="w-full bg-[var(--c-bg)] border border-[var(--c-border2)] rounded-2xl px-4 py-3 text-sm text-[var(--c-text)] placeholder-[var(--c-text5)] focus:outline-none focus:border-[#b0e455]/40 transition resize-none"
        />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex-1 py-3 rounded-2xl border border-[var(--c-border)] text-sm text-[var(--c-text3)] hover:text-[var(--c-text)] transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 rounded-2xl bg-[#b0e455] text-[#0f1a0c] text-sm font-semibold hover:bg-[#c9f070] transition disabled:opacity-50"
          >
            {loading ? 'Saving…' : 'Done - Log It'}
          </button>
        </div>
      </form>
    )
  }

  return (
    <div className="mt-6 pt-6 border-t border-[var(--c-border)]">
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 bg-[#b0e455] text-[#0f1a0c] py-3.5 rounded-2xl text-sm font-semibold hover:bg-[#c9f070] transition active:scale-[0.98]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Log Today's Workout
      </button>
    </div>
  )
}

// ─── Habits display (member-facing habits tab) ────────────────────────────────

function HabitsDisplay({ data, userId }: { data: HabitsContent; userId: string }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const key = `habits-${userId}-${new Date().toISOString().split('T')[0]}`
    try {
      const stored = localStorage.getItem(key)
      if (stored) setChecked(JSON.parse(stored))
    } catch { /* ignore */ }
  }, [userId])

  function toggle(id: string) {
    const key = `habits-${userId}-${new Date().toISOString().split('T')[0]}`
    const next = { ...checked, [id]: !checked[id] }
    setChecked(next)
    try { localStorage.setItem(key, JSON.stringify(next)) } catch { /* ignore */ }
  }

  const doneCount = data.habits.filter(h => checked[h.id]).length
  const total = data.habits.length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-[var(--c-text4)] font-mono uppercase tracking-widest">Today's Habits</p>
        <p className="text-[10px] text-[var(--c-text4)] font-mono">{doneCount}/{total} done</p>
      </div>
      <div className="space-y-2">
        {data.habits.map(habit => (
          <button
            key={habit.id}
            onClick={() => toggle(habit.id)}
            className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${
              checked[habit.id]
                ? 'bg-[#b0e455]/8 border-[var(--c-border2)]'
                : 'bg-[var(--c-card2)] border-transparent hover:border-[#b0e455]/10'
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
              checked[habit.id] ? 'bg-[#b0e455] border-[#b0e455]' : 'border-[var(--c-border2)]'
            }`}>
              {checked[habit.id] && (
                <svg viewBox="0 0 24 24" fill="none" stroke="#0f1a0c" strokeWidth="3" className="w-3 h-3">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className={`text-sm transition-all ${checked[habit.id] ? 'text-[var(--c-text3)] line-through' : 'text-[var(--c-text)]'}`}>
              {habit.text}
            </span>
          </button>
        ))}
      </div>
      {doneCount === total && total > 0 && (
        <div className="bg-[#b0e455]/8 border border-[var(--c-border2)] rounded-2xl p-4 text-center">
          <p className="text-sm font-semibold text-[#b0e455]">All habits done today</p>
          <p className="text-xs text-[var(--c-text4)] mt-0.5">Check back tomorrow to reset</p>
        </div>
      )}
    </div>
  )
}

// ─── BMR display (member-facing food tab) ─────────────────────────────────────

function BmrDisplay({ data }: { data: BmrContent }) {
  const [calories, setCalories] = useState('')
  const calN = parseFloat(calories)
  const remaining = !isNaN(calN) ? data.calorie_target - calN : null

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--c-card2)] rounded-2xl p-4 border border-[var(--c-border)]">
          <p className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-widest">Daily Calories</p>
          <p className="text-2xl font-bold text-[#b0e455] mt-1">{data.calorie_target}</p>
          <p className="text-[10px] text-[var(--c-text4)] mt-0.5">kcal target</p>
        </div>
        {data.protein_g > 0 && (
          <div className="bg-[var(--c-card2)] rounded-2xl p-4 border border-[var(--c-border)]">
            <p className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-widest">Protein</p>
            <p className="text-2xl font-bold text-[var(--c-text)] mt-1">{data.protein_g}<span className="text-sm text-[var(--c-text3)]">g</span></p>
            <p className="text-[10px] text-[var(--c-text4)] mt-0.5">daily target</p>
          </div>
        )}
      </div>

      <div className="bg-[var(--c-card)] rounded-2xl p-4 border border-[var(--c-border)] space-y-2">
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
          <span className="text-[#b0e455]">Your target</span>
          <span className="text-[#b0e455] font-mono font-semibold">{data.calorie_target} kcal</span>
        </div>
      </div>

      {data.notes ? (
        <div className="bg-[var(--c-card2)] rounded-2xl p-4 border border-[var(--c-border)]">
          <p className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-widest mb-2">Coach's Notes</p>
          <p className="text-sm text-[var(--c-text2)] leading-relaxed">{data.notes}</p>
        </div>
      ) : null}

      <div className="bg-[var(--c-card2)] rounded-2xl p-4 border border-[var(--c-border)] space-y-3">
        <p className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-widest">Track Today's Calories</p>
        <div className="flex gap-3 items-center">
          <input
            type="number"
            value={calories}
            onChange={e => setCalories(e.target.value)}
            placeholder="Enter calories eaten"
            className="flex-1 bg-[var(--c-bg)] border border-[var(--c-border2)] rounded-xl px-4 py-3 text-sm text-[var(--c-text)] placeholder-[var(--c-text5)] focus:outline-none focus:border-[#b0e455]/40 transition"
          />
          <span className="text-sm text-[var(--c-text4)] shrink-0">kcal</span>
        </div>
        {remaining !== null && (
          <div className={`rounded-xl px-4 py-3 flex items-center justify-between ${
            remaining >= 0 ? 'bg-[#86efac]/8 border border-[#86efac]/15' : 'bg-[#f87171]/8 border border-[#f87171]/15'
          }`}>
            <span className="text-sm text-[var(--c-text3)]">{remaining >= 0 ? 'Remaining' : 'Over by'}</span>
            <span className={`text-lg font-bold font-mono ${remaining >= 0 ? 'text-[#86efac]' : 'text-[#f87171]'}`}>
              {Math.abs(remaining)} kcal
            </span>
          </div>
        )}
      </div>
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

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProgramClient({ userId, firstName, role, split, food, habits, principles, workoutDates: initialWorkoutDates, milestones: initialMilestones }: Props) {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<Tab>('split')
  const [editingPrinciples, setEditingPrinciples] = useState(false)
  const [principlesContent, setPrinciplesContent] = useState<object | null>(
    principles?.content_json ?? null
  )
  const [saving, setSaving] = useState(false)
  const [workoutDates, setWorkoutDates] = useState<string[]>(initialWorkoutDates)
  const [milestones, setMilestones] = useState<string[]>(initialMilestones)

  function handleWorkoutLogged(date: string, newMilestones: string[]) {
    if (!workoutDates.includes(date)) setWorkoutDates(prev => [date, ...prev])
    if (newMilestones.length) setMilestones(prev => [...prev, ...newMilestones])
  }

  const isHeadCoach = role === 'head_coach'
  const name = firstName ? `${firstName}'s` : 'Your'

  const TABS: { id: Tab; label: string }[] = [
    { id: 'split', label: `${name} Split` },
    { id: 'food', label: `${name} Food` },
    { id: 'habits', label: `${name} Habits` },
    { id: 'principles', label: 'Principles' },
  ]

  async function savePrinciples() {
    setSaving(true)
    await supabase
      .from('principles_doc')
      .update({ content_json: principlesContent, updated_by: userId })
      .eq('id', '00000000-0000-0000-0000-000000000001')
    setSaving(false)
    setEditingPrinciples(false)
  }

  function renderContent() {
    if (activeTab === 'principles') {
      const content = principlesContent
      const updatedAt = principles?.updated_at

      return (
        <div className="space-y-4">
          {isHeadCoach && (
            <div className="flex justify-end gap-4">
              {editingPrinciples ? (
                <>
                  <button
                    onClick={() => setEditingPrinciples(false)}
                    className="text-sm text-[var(--c-text4)] hover:text-[var(--c-text)] transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={savePrinciples}
                    disabled={saving}
                    className="text-sm font-semibold text-[#b0e455] hover:text-[#c9f070] transition disabled:opacity-50"
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditingPrinciples(true)}
                  className="text-sm text-[var(--c-text4)] hover:text-[#b0e455] transition"
                >
                  Edit
                </button>
              )}
            </div>
          )}

          {editingPrinciples ? (
            <RichTextEditor content={content} onChange={setPrinciplesContent} />
          ) : hasContent(content) ? (
            <>
              <RichTextViewer content={content} />
              {updatedAt && (
                <p className="text-xs text-[var(--c-text4)] pt-2" suppressHydrationWarning>{relativeTime(updatedAt)}</p>
              )}
            </>
          ) : (
            <EmptyState
              message={
                isHeadCoach
                  ? 'No principles written yet. Tap Edit to add.'
                  : 'Principles haven\'t been written yet.'
              }
            />
          )}
        </div>
      )
    }

    const sectionMap = { split, food, habits }
    const section = sectionMap[activeTab]
    const content = section?.content_json ?? null
    const updatedAt = section?.updated_at

    if (activeTab === 'food' && content && (content as { type?: string }).type === 'bmr') {
      return <BmrDisplay data={content as BmrContent} />
    }

    if (activeTab === 'habits' && content && (content as { type?: string }).type === 'habits') {
      return <HabitsDisplay data={content as HabitsContent} userId={userId} />
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
        habits: {
          title: 'Your Daily Habits',
          desc: 'The small daily actions - sleep, steps, stress management - that compound over time and make the rest of the program work.',
        },
      }
      const info = sectionInfo[activeTab] ?? { title: 'Coming soon', desc: 'Your coach is working on this section.' }
      return (
        <div className="space-y-3 pt-2">
          <div className="bg-[var(--c-card)] rounded-2xl border border-[var(--c-border)] p-5">
            <div className="w-10 h-10 rounded-xl bg-[#b0e455]/10 border border-[var(--c-border2)] flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="#b0e455" strokeWidth="1.5" className="w-5 h-5">
                <path d="M9 12h6M9 16h6M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2M9 4a2 2 0 002 2h2a2 2 0 002-2M9 4a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-[var(--c-text)]/80 mb-2">{info.title}</p>
            <p className="text-sm text-[var(--c-text3)] leading-relaxed">{info.desc}</p>
          </div>
          <div className="bg-[#b0e455]/6 border border-[var(--c-border2)] rounded-2xl p-4">
            <p className="text-xs text-[#b0e455] font-medium">Your coach is preparing this section.</p>
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

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] flex flex-col lg:pl-52">
      <div className="px-5 pt-12 pb-2 lg:px-10 lg:pt-10 lg:pb-4">
        <p className="text-xs lg:text-sm text-[var(--c-text4)] tracking-wider uppercase mb-0.5">Zana</p>
        <h1 className="text-xl font-bold tracking-tight lg:text-3xl">My Program</h1>
      </div>

      <div className="overflow-x-auto border-b border-[var(--c-border)] lg:px-5">
        <div className="flex min-w-max px-5">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setEditingPrinciples(false)
              }}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-[#b0e455] text-[#b0e455]'
                  : 'border-transparent text-[var(--c-text4)] hover:text-[var(--c-text)]/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 pb-28 lg:px-10 lg:max-w-4xl lg:pb-10 lg:py-8">
        {renderContent()}
        {activeTab === 'split' && !isHeadCoach && (
          <WorkoutLogSection
            userId={userId}
            workoutDates={workoutDates}
            milestones={milestones}
            onLogged={handleWorkoutLogged}
          />
        )}
      </div>

      <BottomNav />
    </div>
  )
}
