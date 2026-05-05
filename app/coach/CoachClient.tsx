'use client'

import { useState, useEffect, useRef, FormEvent, KeyboardEvent } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { SplitBuilder, StructuredSplit } from '@/components/SplitBuilder'

// ─── Types ────────────────────────────────────────────────────────────────────

type Member = { id: string; first_name: string | null; email: string; role: string; weight_unit: string | null; avatar_url: string | null; avatar_color: string | null }
type Stat = { id: string; member_id: string; weight_kg: number | null; confidence: number | null; created_at: string }
type Thread = { id: string; member_id: string }
type MsgPreview = { thread_id: string; body: string; created_at: string; author_id: string }
type ReadReceipt = { thread_id: string; last_read_at: string }
type ChatMessage = { id: string; author_id: string; body: string; created_at: string; message_attachments: { id: string; storage_path: string; kind: string }[] }
type CoachTab = 'home' | 'members' | 'programs' | 'messages' | 'inbox' | 'applications' | 'admin'
type Section = 'split' | 'food' | 'habits'

type BmrData = {
  type: 'bmr'
  gender: 'male' | 'female'
  age: number
  height_cm: number
  weight_kg: number
  activity: number
  bmr: number
  tdee: number
  calorie_target: number
  protein_g: number
  notes: string
}

type HabitsData = {
  type: 'habits'
  habits: { id: string; text: string }[]
}

type Props = {
  userId: string
  userEmail: string
  userRole: string
  firstName: string | null
  avatarColor: string
  avatarUrl: string | null
  members: Member[]
  allStats: Stat[]
  threads: Thread[]
  lastMessages: MsgPreview[]
  myReads: ReadReceipt[]
  snoozeMap: Record<string, string>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function memberName(m: Member) { return m.first_name ?? m.email.split('@')[0] }

function relTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m`
  if (hours < 24) return `${hours}h`
  return `${days}d`
}

function confidenceColor(v: number) {
  if (v <= 3) return '#dc2626'
  if (v <= 5) return '#b45309'
  if (v <= 8) return '#16a34a'
  return '#15803d'
}

function toDisplay(kg: number, unit: string | null) {
  if (unit === 'lb') return `${+(kg * 2.20462).toFixed(1)} lb`
  return `${+kg.toFixed(1)} kg`
}

const ACTIVITY_LEVELS = [
  { label: 'Sedentary (desk job, little movement)', value: 1.2 },
  { label: 'Light (1–2 workouts/week)', value: 1.375 },
  { label: 'Moderate (3–4 workouts/week)', value: 1.55 },
  { label: 'Active (5+ workouts/week)', value: 1.725 },
  { label: 'Very Active (intense daily training)', value: 1.9 },
]

function calcBmr(gender: string, age: number, height_cm: number, weight_kg: number) {
  const base = 10 * weight_kg + 6.25 * height_cm - 5 * age
  return Math.round(gender === 'male' ? base + 5 : base - 161)
}

// ─── Habits section (coach Programs > Habits tab) ────────────────────────────

function HabitsSection({ initial, onSave, saving, saved }: {
  initial: HabitsData | null
  onSave: (data: HabitsData) => void
  saving: boolean
  saved: boolean
}) {
  const [habits, setHabits] = useState<{ id: string; text: string }[]>(initial?.habits ?? [])
  const [newText, setNewText] = useState('')

  function addHabit() {
    const text = newText.trim()
    if (!text) return
    setHabits(prev => [...prev, { id: crypto.randomUUID(), text }])
    setNewText('')
  }

  function removeHabit(id: string) {
    setHabits(prev => prev.filter(h => h.id !== id))
  }

  function updateHabit(id: string, text: string) {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, text } : h))
  }

  return (
    <div className="space-y-3">
      {habits.length > 0 && (
        <div className="space-y-2">
          {habits.map((habit, idx) => (
            <div key={habit.id} className="flex items-center gap-2">
              <span className="text-[10px] text-[var(--c-text4)] font-mono w-4 shrink-0 text-right">{idx + 1}</span>
              <input
                type="text"
                value={habit.text}
                onChange={e => updateHabit(habit.id, e.target.value)}
                className="flex-1 bg-[var(--c-card)] border border-[var(--c-border)] rounded-lg px-3 py-2 text-sm text-[var(--c-text)] focus:outline-none focus:border-[#b0e455]/40 transition"
              />
              <button onClick={() => removeHabit(habit.id)} className="text-[var(--c-text4)] hover:text-[#f87171] transition shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={newText}
          onChange={e => setNewText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addHabit() } }}
          placeholder="Add a habit…"
          className="flex-1 bg-[var(--c-card)] border border-[var(--c-border)] rounded-lg px-3 py-2 text-sm text-[var(--c-text)] placeholder-[var(--c-text5)] focus:outline-none focus:border-[#b0e455]/40 transition"
        />
        <button
          onClick={addHabit}
          disabled={!newText.trim()}
          className="px-4 py-2 rounded-lg bg-[var(--c-card2)] border border-[var(--c-border2)] text-[10px] text-[var(--c-accent-text)] font-mono uppercase tracking-widest hover:bg-[var(--c-hover)] transition disabled:opacity-30 shrink-0"
        >
          Add
        </button>
      </div>

      <button
        onClick={() => onSave({ type: 'habits', habits })}
        disabled={saving || habits.length === 0}
        className="w-full py-3 rounded-lg bg-[#b0e455] text-[#0f1a0c] text-xs tracking-widest uppercase font-mono font-semibold hover:bg-[#c9f070] transition disabled:opacity-40"
      >
        {saved ? 'Saved ✓' : saving ? 'Saving…' : 'Save Habits'}
      </button>
    </div>
  )
}

// ─── BMR section (coach Programs > Food tab) ──────────────────────────────────

function BmrSection({ initial, onSave, saving, saved }: {
  initial: BmrData | null
  onSave: (data: BmrData) => void
  saving: boolean
  saved: boolean
}) {
  const [gender, setGender] = useState<'male' | 'female'>(initial?.gender ?? 'female')
  const [age, setAge] = useState(String(initial?.age ?? ''))
  const [height, setHeight] = useState(String(initial?.height_cm ?? ''))
  const [weight, setWeight] = useState(String(initial?.weight_kg ?? ''))
  const [activity, setActivity] = useState(String(initial?.activity ?? '1.55'))
  const [calorieTarget, setCalorieTarget] = useState(String(initial?.calorie_target ?? ''))
  const [protein, setProtein] = useState(String(initial?.protein_g ?? ''))
  const [notes, setNotes] = useState(initial?.notes ?? '')

  const ageN = parseFloat(age)
  const heightN = parseFloat(height)
  const weightN = parseFloat(weight)
  const activityN = parseFloat(activity)
  const valid = ageN > 0 && heightN > 0 && weightN > 0

  const bmr = valid ? calcBmr(gender, ageN, heightN, weightN) : null
  const tdee = valid ? Math.round((bmr ?? 0) * activityN) : null

  function handleSave() {
    if (!valid || !bmr || !tdee) return
    const ct = parseFloat(calorieTarget) || tdee
    const pg = parseFloat(protein) || 0
    onSave({ type: 'bmr', gender, age: ageN, height_cm: heightN, weight_kg: weightN, activity: activityN, bmr, tdee, calorie_target: ct, protein_g: pg, notes })
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] text-[var(--c-text4)] font-mono uppercase tracking-widest mb-1.5">Gender</p>
          <div className="flex gap-2">
            {(['female', 'male'] as const).map(g => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`flex-1 py-2 rounded-lg text-xs font-mono capitalize transition ${
                  gender === g ? 'bg-[#b0e455] text-[#0f1a0c]' : 'bg-[var(--c-card)] border border-[var(--c-border)] text-[var(--c-text3)] hover:text-[var(--c-text)]'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] text-[var(--c-text4)] font-mono uppercase tracking-widest mb-1.5">Age</p>
          <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 28"
            className="w-full bg-[var(--c-card)] border border-[var(--c-border)] rounded-lg px-3 py-2 text-sm text-[var(--c-text)] placeholder-[var(--c-text5)] focus:outline-none focus:border-[#b0e455]/40 transition" />
        </div>
        <div>
          <p className="text-[10px] text-[var(--c-text4)] font-mono uppercase tracking-widest mb-1.5">Height (cm)</p>
          <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="e.g. 165"
            className="w-full bg-[var(--c-card)] border border-[var(--c-border)] rounded-lg px-3 py-2 text-sm text-[var(--c-text)] placeholder-[var(--c-text5)] focus:outline-none focus:border-[#b0e455]/40 transition" />
        </div>
        <div>
          <p className="text-[10px] text-[var(--c-text4)] font-mono uppercase tracking-widest mb-1.5">Weight (kg)</p>
          <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 65"
            className="w-full bg-[var(--c-card)] border border-[var(--c-border)] rounded-lg px-3 py-2 text-sm text-[var(--c-text)] placeholder-[var(--c-text5)] focus:outline-none focus:border-[#b0e455]/40 transition" />
        </div>
      </div>

      <div>
        <p className="text-[10px] text-[var(--c-text4)] font-mono uppercase tracking-widest mb-1.5">Activity Level</p>
        <select value={activity} onChange={e => setActivity(e.target.value)}
          className="w-full bg-[var(--c-card)] border border-[var(--c-border)] rounded-lg px-3 py-2 text-sm text-[var(--c-text)] focus:outline-none focus:border-[#b0e455]/40 transition">
          {ACTIVITY_LEVELS.map(a => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </select>
      </div>

      {valid && bmr && tdee && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[var(--c-card2)] rounded-xl p-3 border border-[var(--c-border)]">
            <p className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-widest">BMR</p>
            <p className="text-lg font-bold text-[var(--c-text)] mt-0.5">{bmr} <span className="text-xs text-[var(--c-text3)]">kcal</span></p>
          </div>
          <div className="bg-[var(--c-card2)] rounded-xl p-3 border border-[var(--c-border)]">
            <p className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-widest">TDEE</p>
            <p className="text-lg font-bold text-[var(--c-accent-text)] mt-0.5">{tdee} <span className="text-xs text-[var(--c-text3)]">kcal</span></p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] text-[var(--c-text4)] font-mono uppercase tracking-widest mb-1.5">Daily Calorie Target</p>
          <input type="number" value={calorieTarget} onChange={e => setCalorieTarget(e.target.value)} placeholder={tdee ? String(tdee) : 'kcal'}
            className="w-full bg-[var(--c-card)] border border-[var(--c-border)] rounded-lg px-3 py-2 text-sm text-[var(--c-text)] placeholder-[var(--c-text5)] focus:outline-none focus:border-[#b0e455]/40 transition" />
        </div>
        <div>
          <p className="text-[10px] text-[var(--c-text4)] font-mono uppercase tracking-widest mb-1.5">Protein Target (g)</p>
          <input type="number" value={protein} onChange={e => setProtein(e.target.value)} placeholder="e.g. 130"
            className="w-full bg-[var(--c-card)] border border-[var(--c-border)] rounded-lg px-3 py-2 text-sm text-[var(--c-text)] placeholder-[var(--c-text5)] focus:outline-none focus:border-[#b0e455]/40 transition" />
        </div>
      </div>

      <div>
        <p className="text-[10px] text-[var(--c-text4)] font-mono uppercase tracking-widest mb-1.5">Notes (optional)</p>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
          placeholder="Timing notes, meal quality guidance, exceptions…"
          className="w-full bg-[var(--c-card)] border border-[var(--c-border)] rounded-lg px-3 py-2 text-sm text-[var(--c-text)] placeholder-[var(--c-text5)] focus:outline-none focus:border-[#b0e455]/40 transition resize-none" />
      </div>

      <button
        onClick={handleSave}
        disabled={!valid || saving}
        className="w-full py-3 rounded-lg bg-[#b0e455] text-[#0f1a0c] text-xs tracking-widest uppercase font-mono font-semibold hover:bg-[#c9f070] transition disabled:opacity-40"
      >
        {saved ? 'Saved ✓' : saving ? 'Saving…' : 'Save Nutrition Plan'}
      </button>
    </div>
  )
}

// ─── Coach nav ────────────────────────────────────────────────────────────────

function CoachNav({ active, onChange, isHeadCoach, firstName, avatarColor, avatarUrl, userEmail, unreadCount }: {
  active: CoachTab
  onChange: (t: CoachTab) => void
  isHeadCoach: boolean
  firstName: string | null
  avatarColor: string
  avatarUrl: string | null
  userEmail: string
  unreadCount: number
}) {
  const tabs: { id: CoachTab; label: string; icon: JSX.Element }[] = [
    { id: 'home', label: 'Home', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" /></svg> },
    { id: 'members', label: 'Members', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87" strokeLinecap="round" strokeLinejoin="round" /></svg> },
    { id: 'programs', label: 'Programs', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M9 12h6M9 16h6M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2M9 4a2 2 0 002 2h2a2 2 0 002-2M9 4a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" /></svg> },
    { id: 'messages', label: 'Messages', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z" strokeLinecap="round" strokeLinejoin="round" /></svg> },
  ]

  const communityIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87" strokeLinecap="round" strokeLinejoin="round" /></svg>
const applicationsIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M9 12h6M9 16h3M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2M9 4a2 2 0 002 2h2a2 2 0 002-2M9 4a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" /></svg>
  const adminIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
  const showAdmin = isHeadCoach && userEmail === 'me@javilorenzana.com'

  const initials = (firstName ?? userEmail.split('@')[0]).slice(0, 1).toUpperCase()

  return (
    <>
      {/* ── Desktop sidebar ────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-52 flex-col bg-[var(--c-sidebar)] border-r border-[var(--c-border)] z-50">
        {/* Logo */}
        <div className="px-5 pt-6 pb-5 border-b border-[var(--c-border)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#b0e455] flex items-center justify-center shrink-0">
              <svg viewBox="0 0 32 32" className="h-4 w-4" fill="none" stroke="#0b1509" strokeWidth="5.5" strokeMiterlimit="10">
                <path d="M0,2 H32 L18.3,14" />
                <path d="M13.7,18 L0,30 H32" />
              </svg>
            </div>
            <div>
              <p className="text-[var(--c-text)] font-bold text-base tracking-tight leading-none">Zana</p>
              <p className="text-[9px] text-[var(--c-text4)] tracking-widest uppercase leading-none mt-1">Coach Portal</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                active === t.id
                  ? 'bg-[#b0e455] text-[#0b1509]'
                  : 'text-[var(--c-text3)] hover:text-[var(--c-text)] hover:bg-[var(--c-card)]'
              }`}
            >
              <span className="relative">
                {t.icon}
                {t.id === 'messages' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#f87171] rounded-full border-2 border-[var(--c-sidebar)]" />
                )}
              </span>
              <span className="text-sm font-semibold">{t.label}</span>
              {t.id === 'messages' && unreadCount > 0 && active !== 'messages' && (
                <span className="ml-auto text-[10px] font-mono bg-[#f87171]/15 text-[#f87171] px-1.5 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </button>
          ))}
          <Link
            href="/community"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left text-[var(--c-text3)] hover:text-[var(--c-text)] hover:bg-[var(--c-card)]"
          >
            {communityIcon}
            <span className="text-sm font-semibold">Community</span>
          </Link>
          {showAdmin && (
            <button
              onClick={() => onChange('applications')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                active === 'applications'
                  ? 'bg-[#b0e455] text-[#0b1509]'
                  : 'text-[var(--c-text3)] hover:text-[var(--c-text)] hover:bg-[var(--c-card)]'
              }`}
            >
              {applicationsIcon}
              <span className="text-sm font-semibold">Applications</span>
            </button>
          )}
          {showAdmin && (
            <button
              onClick={() => onChange('admin')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                active === 'admin'
                  ? 'bg-[#b0e455] text-[#0b1509]'
                  : 'text-[var(--c-text3)] hover:text-[var(--c-text)] hover:bg-[var(--c-card)]'
              }`}
            >
              {adminIcon}
              <span className="text-sm font-semibold">Admin</span>
            </button>
          )}
        </nav>

        {/* Profile */}
        <div className="px-3 py-4 border-t border-[var(--c-border)] space-y-0.5">
          <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--c-text3)] hover:text-[var(--c-text)] hover:bg-[var(--c-card)] transition-all">
            <div
              className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold overflow-hidden shrink-0"
              style={{ borderColor: avatarColor + '50', backgroundColor: avatarColor + '18', color: avatarColor }}
            >
              {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : initials}
            </div>
            <span className="text-sm font-semibold">Profile</span>
          </Link>
          <p className="text-[9px] text-[var(--c-text5)] uppercase tracking-widest px-3 pt-2">© 2026 Zana</p>
        </div>
      </aside>

      {/* ── Mobile bottom bar ─────────────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--c-backdrop)] backdrop-blur-md border-t border-[var(--c-border)] flex overflow-x-auto z-50 [&::-webkit-scrollbar]:hidden relative" style={{ scrollbarWidth: 'none' }}>
        {showAdmin && <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[var(--c-backdrop)] to-transparent z-10" />}
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className="grow shrink-0 basis-[60px] flex flex-col items-center gap-1 py-2.5 transition-colors"
          >
            <div className={`relative w-10 h-7 flex items-center justify-center rounded-full transition-all ${
              active === t.id ? 'bg-[#b0e455] text-[#0f1a0c]' : 'text-[var(--c-text4)]'
            }`}>
              {t.icon}
              {t.id === 'messages' && unreadCount > 0 && (
                <span className="absolute top-0 right-1 w-2 h-2 bg-[#f87171] rounded-full border border-[var(--c-backdrop)]" />
              )}
            </div>
            <span className={`text-[9px] uppercase font-medium ${
              active === t.id ? 'text-[var(--c-accent-text)]' : 'text-[var(--c-text4)]'
            }`}>
              {t.label}
            </span>
          </button>
        ))}
        <Link href="/community" className="grow shrink-0 basis-[60px] flex flex-col items-center gap-1 py-2.5 transition-colors">
          <div className="w-10 h-7 flex items-center justify-center rounded-full text-[var(--c-text4)]">
            {communityIcon}
          </div>
          <span className="text-[9px] uppercase font-medium text-[var(--c-text4)]">Community</span>
        </Link>
        {showAdmin && (
          <button
            onClick={() => onChange('applications')}
            className="grow shrink-0 basis-[60px] flex flex-col items-center gap-1 py-2.5 transition-colors"
          >
            <div className={`w-10 h-7 flex items-center justify-center rounded-full transition-all ${
              active === 'applications' ? 'bg-[#b0e455] text-[#0f1a0c]' : 'text-[var(--c-text4)]'
            }`}>
              {applicationsIcon}
            </div>
            <span className={`text-[9px] uppercase font-medium ${
              active === 'applications' ? 'text-[var(--c-accent-text)]' : 'text-[var(--c-text4)]'
            }`}>Apps</span>
          </button>
        )}
        {showAdmin && (
          <button
            onClick={() => onChange('admin')}
            className="grow shrink-0 basis-[60px] flex flex-col items-center gap-1 py-2.5 transition-colors"
          >
            <div className={`w-10 h-7 flex items-center justify-center rounded-full transition-all ${
              active === 'admin' ? 'bg-[#b0e455] text-[#0f1a0c]' : 'text-[var(--c-text4)]'
            }`}>
              {adminIcon}
            </div>
            <span className={`text-[9px] uppercase font-medium ${
              active === 'admin' ? 'text-[var(--c-accent-text)]' : 'text-[var(--c-text4)]'
            }`}>Admin</span>
          </button>
        )}
      </nav>
    </>
  )
}

// ─── Home tab ─────────────────────────────────────────────────────────────────

function HomeTab({ members, allStats, threads, lastMessages, isHeadCoach, firstName, snoozes, onMarkAddressed, onUndoAddressed }: {
  members: Member[]
  allStats: Stat[]
  threads: Thread[]
  lastMessages: MsgPreview[]
  isHeadCoach: boolean
  firstName: string | null
  snoozes: Record<string, string>
  onMarkAddressed: (memberId: string) => void
  onUndoAddressed: (memberId: string) => void
}) {
  const name = firstName ?? 'Coach'
  const h = new Date().getHours()
  const greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'

  const threadToMember = Object.fromEntries(threads.map(t => [t.id, t.member_id]))
  const lastMsgByMember: Record<string, MsgPreview> = {}
  for (const msg of lastMessages) {
    const mid = threadToMember[msg.thread_id]
    if (mid && !lastMsgByMember[mid]) lastMsgByMember[mid] = msg
  }

  const latestPerMember = members.map(m => ({
    member: m,
    stat: allStats.find(s => s.member_id === m.id) ?? null,
  }))

  const activeThisWeek = latestPerMember.filter(({ stat }) =>
    stat && Math.floor((Date.now() - new Date(stat.created_at).getTime()) / 86_400_000) <= 7
  ).length

  const needAttention = latestPerMember.filter(({ member, stat }) => needsAttention(stat, snoozes[member.id])).length

  const recentActivity = [...allStats]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  const memberMap = Object.fromEntries(members.map(m => [m.id, m]))

  return (
    <div className="space-y-5">
      {/* Greeting hero */}
      <div
        className="rounded-3xl p-5 lg:p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #cbf14e 0%, #b0e455 45%, #87be2a 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(ellipse at 10% 90%, rgba(255,255,255,0.2) 0%, transparent 55%)' }} />
        <div className="relative z-10">
          <p className="text-xs text-[#1a3300]/50 font-medium" suppressHydrationWarning>{greet},</p>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#1a3300] tracking-tight leading-tight mt-0.5">{name}.</h1>
          <p className="text-xs text-[#1a3300]/50 mt-1.5">
            {isHeadCoach ? 'Full access · Head coach' : 'Coach view'}
          </p>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[var(--c-card)] shadow-sm rounded-2xl p-3 text-center border border-[var(--c-border)]">
          <p className="text-2xl font-bold text-[var(--c-text)]">{members.length}</p>
          <p className="text-[9px] text-[var(--c-text4)] uppercase tracking-wider mt-0.5">Members</p>
        </div>
        <div
          className={`rounded-2xl p-3 text-center border shadow-sm ${needAttention > 0 ? 'bg-[#f87171]/8 border-[#f87171]/30' : 'bg-[var(--c-card)] border-[var(--c-border)]'}`}
        >
          <p className={`text-2xl font-bold ${needAttention > 0 ? 'text-[#f87171]' : 'text-[var(--c-text4)]'}`}>{needAttention}</p>
          <p className="text-[9px] text-[var(--c-text4)] uppercase mt-0.5">Attn</p>
        </div>
        <div className="bg-[var(--c-card)] shadow-sm rounded-2xl p-3 text-center border border-[var(--c-border)]">
          <p className="text-2xl font-bold text-[#16a34a]">{activeThisWeek}</p>
          <p className="text-[9px] text-[var(--c-text4)] uppercase tracking-wider mt-0.5">Active</p>
        </div>
      </div>

      {/* Attention list */}
      {latestPerMember.some(({ member, stat }) => needsAttention(stat, snoozes[member.id]) || snoozes[member.id]) && (
        <div className="space-y-2">
          <p className="text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono">Needs Attention</p>
          {latestPerMember.filter(({ member, stat }) => needsAttention(stat, snoozes[member.id]) || snoozes[member.id]).map(({ member, stat }) => {
            const attn = needsAttention(stat, snoozes[member.id])
            const snoozed = !!snoozes[member.id]
            return (
              <div key={member.id} className={`flex items-center gap-3 rounded-2xl px-4 py-3 border ${attn ? 'bg-[#f87171]/8 border-[#f87171]/30' : 'bg-[var(--c-card)] border-[var(--c-border)]'}`}>
                <div className="w-7 h-7 rounded-full overflow-hidden bg-[var(--c-accent-text)]/10 border border-[var(--c-border2)] flex items-center justify-center text-[10px] font-bold text-[var(--c-accent-text)] shrink-0">
                  {member.avatar_url ? <img src={member.avatar_url} alt="" className="w-full h-full object-cover" /> : memberName(member).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[var(--c-text)] truncate">{memberName(member)}</p>
                  <p className={`text-[10px] font-mono ${attn ? 'text-[#f87171]' : 'text-[var(--c-text4)]'}`}>
                    {attn ? (stat ? `${Math.floor((Date.now() - new Date(stat.created_at).getTime()) / 86_400_000)}d since check-in${stat.confidence !== null && stat.confidence <= 3 ? ` · ${stat.confidence}/10 conf` : ''}` : 'No check-ins yet') : 'Addressed'}
                  </p>
                </div>
                {attn ? (
                  <button
                    onClick={() => onMarkAddressed(member.id)}
                    className="shrink-0 text-[10px] font-mono tracking-widest uppercase text-[#f87171] border border-[#f87171]/40 rounded-lg px-3 py-1.5 hover:bg-[#f87171]/10 transition"
                  >
                    Mark Addressed
                  </button>
                ) : snoozed ? (
                  <button
                    onClick={() => onUndoAddressed(member.id)}
                    className="shrink-0 text-[10px] font-mono tracking-widest uppercase text-[var(--c-text4)] border border-[var(--c-border2)] rounded-lg px-3 py-1.5 hover:bg-[var(--c-hover)] transition"
                  >
                    Undo
                  </button>
                ) : null}
              </div>
            )
          })}
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--c-card)] shadow-sm rounded-2xl border border-[var(--c-border)] p-4">
          <p className="text-[10px] text-[#3b82f6] uppercase tracking-wider font-mono mb-1">Programs</p>
          <p className="text-sm font-semibold text-[var(--c-text)]">{members.length} member{members.length !== 1 ? 's' : ''}</p>
          <p className="text-[10px] text-[var(--c-text3)] mt-0.5">Click Programs to edit</p>
        </div>
        <div className="bg-[var(--c-card)] shadow-sm rounded-2xl border border-[var(--c-border)] p-4">
          <p className="text-[10px] text-[#9333ea] uppercase tracking-wider font-mono mb-1">Messages</p>
          <p className="text-sm font-semibold text-[var(--c-text)]">{threads.length} thread{threads.length !== 1 ? 's' : ''}</p>
          <p className="text-[10px] text-[var(--c-text3)] mt-0.5">Click Messages to chat</p>
        </div>
      </div>

      {/* Recent check-ins */}
      {recentActivity.length > 0 && (
        <div>
          <p className="text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono mb-3">Recent Check-ins</p>
          <div className="space-y-2">
            {recentActivity.map(s => {
              const m = memberMap[s.member_id]
              if (!m) return null
              return (
                <div key={s.id} className="bg-[var(--c-card)] shadow-sm rounded-2xl px-4 py-3 flex items-center gap-3 border border-[var(--c-border)]">
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-[var(--c-accent-text)]/10 border border-[var(--c-border2)] flex items-center justify-center text-[10px] font-bold text-[var(--c-accent-text)] shrink-0">
                    {m.avatar_url ? <img src={m.avatar_url} alt="" className="w-full h-full object-cover" /> : memberName(m).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[var(--c-text)] truncate">{memberName(m)}</p>
                    <p className="text-[10px] text-[var(--c-text4)] font-mono" suppressHydrationWarning>
                      {relTime(s.created_at)} ago
                      {s.weight_kg != null ? ` · ${toDisplay(s.weight_kg, m.weight_unit)}` : ''}
                      {s.confidence != null ? ` · ${s.confidence}/10` : ''}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {members.length === 0 && (
        <div className="text-center py-10">
          <p className="text-sm text-[var(--c-text4)]">No members assigned yet.</p>
          {isHeadCoach && <p className="text-xs text-[var(--c-text5)] mt-1">Use Admin to invite and set up members.</p>}
        </div>
      )}
    </div>
  )
}

// ─── Members tab ──────────────────────────────────────────────────────────────

function checkinStatus(stat: Stat | null): 'fresh' | 'ok' | 'overdue' | 'none' {
  if (!stat) return 'none'
  const days = Math.floor((Date.now() - new Date(stat.created_at).getTime()) / 86_400_000)
  if (days <= 3) return 'fresh'
  if (days <= 7) return 'ok'
  return 'overdue'
}

function needsAttention(stat: Stat | null, snoozedAt?: string | null): boolean {
  if (!stat) {
    if (!snoozedAt) return true
    return (Date.now() - new Date(snoozedAt).getTime()) > 7 * 86_400_000
  }
  const days = Math.floor((Date.now() - new Date(stat.created_at).getTime()) / 86_400_000)
  const isOverdue = days > 7
  const isLowConf = stat.confidence !== null && stat.confidence <= 3
  if (!isOverdue && !isLowConf) return false
  if (!snoozedAt) return true
  const snoozeTime = new Date(snoozedAt).getTime()
  if (isLowConf && new Date(stat.created_at).getTime() > snoozeTime) return true
  if (isOverdue && (Date.now() - snoozeTime) > 7 * 86_400_000) return true
  return false
}

const STATUS_DOT: Record<string, string> = {
  fresh: 'bg-[#86efac]',
  ok: 'bg-[#fbbf24]',
  overdue: 'bg-[#f87171]',
  none: 'bg-[var(--c-hover)]',
}

const STATUS_LABEL: Record<string, string> = {
  fresh: 'Active',
  ok: 'Due soon',
  overdue: 'Overdue',
  none: 'No data',
}

// ─── Member detail panel ──────────────────────────────────────────────────────

type WorkoutLog = { logged_date: string; notes: string | Record<string, unknown> | null }
type CalorieLog = { logged_date: string; calories_eaten: number }
type StatUpdateCoach = {
  id: string
  weight_kg: number | null
  confidence: number | null
  milestone_text: string | null
  created_at: string
  stat_update_photos: { id: string; storage_path: string }[]
}
type ProgressPhoto = { id: string; photo_url: string; photo_type: 'before' | 'weekly'; taken_at: string; created_at: string }

function parseExercises(raw: string | Record<string, unknown> | null): { move: string; kg: string; reps: string; sets: string }[] {
  if (!raw) return []
  try {
    const p = typeof raw === 'string' ? JSON.parse(raw) : raw
    return (p.exercises as { move: string; kg: string; reps: string; sets: string }[] | undefined) ?? []
  } catch { return [] }
}

function MemberDetailPanel({ member, stat, snoozedAt, onOpenProgram, onClose, onMarkAddressed, onUndoAddressed }: {
  member: Member
  stat: Stat | null
  snoozedAt: string | null
  onOpenProgram: (id: string) => void
  onClose: () => void
  onMarkAddressed: () => void
  onUndoAddressed: () => void
}) {
  const supabase = createClient()
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([])
  const [calorieLogs, setCalorieLogs] = useState<CalorieLog[]>([])
  const [calorieTarget, setCalorieTarget] = useState<number | null>(null)
  const [statUpdates, setStatUpdates] = useState<StatUpdateCoach[]>([])
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>([])
  const [expandedLog, setExpandedLog] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000).toISOString().split('T')[0]
    Promise.all([
      supabase.from('workout_logs').select('logged_date, notes').eq('member_id', member.id).gte('logged_date', thirtyDaysAgo).order('logged_date', { ascending: false }),
      supabase.from('calorie_logs').select('logged_date, calories_eaten').eq('member_id', member.id).gte('logged_date', thirtyDaysAgo).order('logged_date', { ascending: false }),
      supabase.from('program_sections').select('content_json').eq('member_id', member.id).eq('section', 'food').maybeSingle(),
      supabase.from('stat_updates').select('id, weight_kg, confidence, milestone_text, created_at, stat_update_photos(id, storage_path)').eq('member_id', member.id).order('created_at', { ascending: false }).limit(20),
      supabase.from('progress_photos').select('id, photo_url, photo_type, taken_at, created_at').eq('member_id', member.id).order('created_at', { ascending: true }),
    ]).then(([wl, cl, food, su, pp]) => {
      setWorkoutLogs((wl.data ?? []) as WorkoutLog[])
      setCalorieLogs((cl.data ?? []) as CalorieLog[])
      const fc = food.data?.content_json as { type?: string; calorie_target?: number } | null
      if (fc?.type === 'bmr' && fc.calorie_target) setCalorieTarget(fc.calorie_target)
      setStatUpdates((su.data ?? []) as StatUpdateCoach[])
      setProgressPhotos((pp.data ?? []) as ProgressPhoto[])
      setLoading(false)
    })
  }, [member.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const workoutDateSet = new Set(workoutLogs.map(w => w.logged_date))
  const calorieMap = Object.fromEntries(calorieLogs.map(c => [c.logged_date, c.calories_eaten]))

  const last7: { date: string; label: string; hasWorkout: boolean; calories: number | null }[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0)
    const key = d.toISOString().split('T')[0]
    last7.push({
      date: key,
      label: i === 0 ? 'T' : d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      hasWorkout: workoutDateSet.has(key),
      calories: calorieMap[key] ?? null,
    })
  }

  const unit = (member.weight_unit as 'kg' | 'lb') ?? 'kg'
  const beforePhoto = progressPhotos.find(p => p.photo_type === 'before') ?? null
  const weeklyPhotos = progressPhotos.filter(p => p.photo_type === 'weekly')
  const latestWeekly = weeklyPhotos[weeklyPhotos.length - 1] ?? null
  const chartPts = [...statUpdates].reverse().filter(s => s.weight_kg != null).map(s =>
    unit === 'lb' ? +(s.weight_kg! * 2.20462).toFixed(1) : +s.weight_kg!.toFixed(1)
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onClose} className="text-[var(--c-text4)] hover:text-[var(--c-text)] transition">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-[var(--c-accent-text)]/10 border border-[var(--c-border2)] flex items-center justify-center text-xs font-bold text-[var(--c-accent-text)] shrink-0">
            {member.avatar_url ? <img src={member.avatar_url} alt="" className="w-full h-full object-cover" /> : (member.first_name ?? member.email).charAt(0).toUpperCase()}
          </div>
          <p className="text-sm font-semibold text-[var(--c-text)] truncate">{member.first_name ?? member.email.split('@')[0]}</p>
        </div>
        <button
          onClick={() => onOpenProgram(member.id)}
          className="shrink-0 text-[10px] font-mono tracking-widest uppercase text-[var(--c-accent-text)] hover:opacity-75 transition"
        >
          Edit Program →
        </button>
      </div>

      {/* Attention banner */}
      {needsAttention(stat, snoozedAt) ? (
        <div className="flex items-center justify-between gap-3 bg-[#f87171]/10 border border-[#f87171]/30 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#f87171] shrink-0" />
            <p className="text-xs text-[#f87171] font-medium">Needs attention</p>
          </div>
          <button
            onClick={onMarkAddressed}
            className="text-[10px] font-mono tracking-widest uppercase text-[#f87171] hover:opacity-75 transition shrink-0"
          >
            Mark Addressed
          </button>
        </div>
      ) : snoozedAt ? (
        <div className="flex items-center justify-between gap-3 bg-[var(--c-card2)] border border-[var(--c-border2)] rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--c-text4)] shrink-0" />
            <p className="text-xs text-[var(--c-text4)]">Marked as addressed</p>
          </div>
          <button
            onClick={onUndoAddressed}
            className="text-[10px] font-mono tracking-widest uppercase text-[var(--c-text4)] hover:text-[var(--c-text3)] transition shrink-0"
          >
            Undo
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-5 h-5 border-2 border-[var(--c-border2)] border-t-[#b0e455]/60 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* 7-day overview */}
          <div className="bg-[var(--c-card)] shadow-sm rounded-2xl p-4 border border-[var(--c-border)]">
            <p className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-widest mb-3">Last 7 Days</p>
            <div className="flex justify-between gap-1">
              {[...last7].reverse().map(day => (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
                  <p className="text-[9px] text-[var(--c-text4)] font-mono">{day.label}</p>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    day.hasWorkout ? 'bg-[#b0e455] border border-[#b0e455]/40' : 'bg-[var(--c-bg)] border border-[var(--c-border2)]'
                  }`}>
                    {day.hasWorkout && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="#0f1a0c" strokeWidth="3" className="w-3 h-3">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  {calorieTarget !== null && (
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      day.calories === null ? 'bg-[var(--c-border2)]'
                      : day.calories >= calorieTarget ? 'bg-[#86efac]'
                      : day.calories >= calorieTarget * 0.8 ? 'bg-[#fbbf24]'
                      : 'bg-[#f87171]'
                    }`} title={day.calories !== null ? `${day.calories} kcal` : 'No log'} />
                  )}
                </div>
              ))}
            </div>
            {calorieTarget !== null && (
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[var(--c-border)]">
                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[#86efac]" /><span className="text-[9px] text-[var(--c-text4)]">On target</span></div>
                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[#fbbf24]" /><span className="text-[9px] text-[var(--c-text4)]">&gt;80%</span></div>
                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[#f87171]" /><span className="text-[9px] text-[var(--c-text4)]">Low</span></div>
                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[var(--c-border2)]" /><span className="text-[9px] text-[var(--c-text4)]">No log</span></div>
              </div>
            )}
          </div>

          {/* Weight trend */}
          {chartPts.length >= 2 && (
            <div className="bg-[var(--c-card)] shadow-sm rounded-2xl p-4 border border-[var(--c-border)]">
              <p className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-widest mb-3">Weight Trend</p>
              {(() => {
                const W = 300; const H = 60
                const min = Math.min(...chartPts); const max = Math.max(...chartPts)
                const range = max - min || 1
                const coords = chartPts.map((w, i) => ({
                  x: (i / (chartPts.length - 1)) * W,
                  y: H - ((w - min) / range) * (H - 8) - 4,
                }))
                const polyline = coords.map(c => `${c.x},${c.y}`).join(' ')
                const fillPath = [`M${coords[0].x},${H}`, ...coords.map(c => `L${c.x},${c.y}`), `L${coords[coords.length - 1].x},${H}`, 'Z'].join(' ')
                const last = coords[coords.length - 1]
                return (
                  <>
                    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ height: 72 }}>
                      <defs>
                        <linearGradient id={`cg-${member.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#b0e455" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#b0e455" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d={fillPath} fill={`url(#cg-${member.id})`} />
                      <polyline points={polyline} fill="none" stroke="#b0e455" strokeWidth="1.5" />
                      <circle cx={last.x} cy={last.y} r="3" fill="#b0e455" />
                    </svg>
                    <div className="flex justify-between text-xs text-[var(--c-text4)] mt-1">
                      <span>{chartPts[0]} {unit}</span>
                      <span className="text-[var(--c-accent-text)] font-semibold">{chartPts[chartPts.length - 1]} {unit} — now</span>
                    </div>
                  </>
                )
              })()}
            </div>
          )}

          {/* Progress photos */}
          {(beforePhoto || latestWeekly) && (
            <div className="bg-[var(--c-card)] shadow-sm rounded-2xl p-4 border border-[var(--c-border)]">
              <p className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-widest mb-3">Progress Photos</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-[var(--c-text4)] uppercase tracking-wide mb-1.5">Before</p>
                  {beforePhoto ? (
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-[var(--c-bg)]">
                      <img src={beforePhoto.photo_url} alt="Before" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="aspect-[3/4] rounded-2xl border border-dashed border-[var(--c-border)] flex items-center justify-center">
                      <p className="text-[10px] text-[var(--c-text5)]">Not uploaded</p>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-[var(--c-text4)] uppercase tracking-wide mb-1.5">
                    {latestWeekly ? `Week ${weeklyPhotos.length}` : 'Latest'}
                  </p>
                  {latestWeekly ? (
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-[var(--c-bg)]">
                      <img src={latestWeekly.photo_url} alt="Latest" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="aspect-[3/4] rounded-2xl border border-dashed border-[var(--c-border)] flex items-center justify-center">
                      <p className="text-[10px] text-[var(--c-text5)]">No weekly yet</p>
                    </div>
                  )}
                </div>
              </div>
              {weeklyPhotos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 mt-3 pt-3 border-t border-[var(--c-border)]">
                  {progressPhotos.map(photo => {
                    const weekIdx = progressPhotos.filter(p => p.photo_type === 'weekly' && new Date(p.created_at) <= new Date(photo.created_at)).length
                    return (
                      <div key={photo.id} className="shrink-0 flex flex-col items-center gap-1">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-[var(--c-bg)]">
                          <img src={photo.photo_url} alt="" className="w-full h-full object-cover" />
                        </div>
                        <p className="text-[9px] text-[var(--c-text4)] uppercase tracking-wide">
                          {photo.photo_type === 'before' ? 'Before' : `Wk ${weekIdx}`}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Check-in history */}
          {statUpdates.length > 0 && (
            <div className="bg-[var(--c-card)] shadow-sm rounded-2xl p-4 border border-[var(--c-border)]">
              <p className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-widest mb-3">Check-in History</p>
              <div className="space-y-3">
                {statUpdates.map(su => {
                  const date = new Date(su.created_at)
                  const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  return (
                    <div key={su.id} className="border-b border-[var(--c-border)] last:border-0 pb-3 last:pb-0">
                      <p className="text-[10px] text-[var(--c-text4)] mb-1.5">{formatted}</p>
                      <div className="flex gap-4">
                        {su.weight_kg != null && (
                          <div>
                            <p className="text-[9px] text-[var(--c-text4)] mb-0.5">Weight</p>
                            <p className="text-sm font-bold text-[var(--c-text)]">
                              {unit === 'lb' ? +(su.weight_kg * 2.20462).toFixed(1) : +su.weight_kg.toFixed(1)}
                              <span className="text-xs text-[var(--c-text3)] ml-1">{unit}</span>
                            </p>
                          </div>
                        )}
                        {su.confidence != null && (
                          <div>
                            <p className="text-[9px] text-[var(--c-text4)] mb-0.5">Confidence</p>
                            <p className="text-sm font-bold" style={{ color: confidenceColor(su.confidence) }}>
                              {su.confidence}<span className="text-xs opacity-60 ml-0.5">/10</span>
                            </p>
                          </div>
                        )}
                      </div>
                      {su.milestone_text && (
                        <p className="text-xs text-[var(--c-text2)] mt-1.5 leading-relaxed">{su.milestone_text}</p>
                      )}
                      {su.stat_update_photos.length > 0 && (
                        <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                          {su.stat_update_photos.map(photo => {
                            const { data } = supabase.storage.from('stat-photos').getPublicUrl(photo.storage_path)
                            return (
                              <img key={photo.id} src={data.publicUrl} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0 bg-[var(--c-bg)]" />
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Workout logs */}
          {workoutLogs.length > 0 && (
            <div className="bg-[var(--c-card)] shadow-sm rounded-2xl p-4 border border-[var(--c-border)]">
              <p className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-widest mb-3">Workout Logs</p>
              <div className="space-y-0.5">
                {workoutLogs.map(log => {
                  const isExpanded = expandedLog === log.logged_date
                  const exercises = parseExercises(log.notes)
                  return (
                    <div key={log.logged_date}>
                      <button
                        onClick={() => setExpandedLog(isExpanded ? null : log.logged_date)}
                        className="w-full flex items-center justify-between py-2.5 border-b border-[var(--c-border)] last:border-0"
                      >
                        <p className="text-xs text-[var(--c-text)]">
                          {new Date(log.logged_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] text-[var(--c-text4)]">{exercises.length} exercise{exercises.length !== 1 ? 's' : ''}</p>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-3 h-3 text-[var(--c-text4)] transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="py-2">
                          {exercises.length === 0 ? (
                            <p className="text-xs text-[var(--c-text4)]">No exercises recorded</p>
                          ) : (
                            <div className="space-y-1">
                              <div className="grid grid-cols-[1fr_44px_40px_40px] gap-1 px-1 mb-1">
                                {['Move', 'kg', 'Reps', 'Sets'].map(h => (
                                  <p key={h} className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-wider text-center first:text-left">{h}</p>
                                ))}
                              </div>
                              {exercises.map((ex, i) => (
                                <div key={i} className="grid grid-cols-[1fr_44px_40px_40px] gap-1 items-center py-1 border-b border-[var(--c-border)] last:border-0">
                                  <p className="text-xs text-[var(--c-text)]">{ex.move}</p>
                                  <p className="text-xs text-[var(--c-text3)] font-mono text-center">{ex.kg || '—'}</p>
                                  <p className="text-xs text-[var(--c-text3)] font-mono text-center">{ex.reps || '—'}</p>
                                  <p className="text-xs text-[var(--c-text3)] font-mono text-center">{ex.sets || '—'}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Calorie adherence */}
          {calorieTarget !== null && calorieLogs.length > 0 && (
            <div className="bg-[var(--c-card)] shadow-sm rounded-2xl p-4 border border-[var(--c-border)]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-widest">Calorie Adherence</p>
                <p className="text-[9px] text-[var(--c-text4)] font-mono">Target: {calorieTarget} kcal</p>
              </div>
              <div className="space-y-2">
                {last7.filter(d => d.calories !== null).map(day => {
                  const pct = Math.min(100, Math.round(((day.calories ?? 0) / calorieTarget) * 100))
                  const isOver = (day.calories ?? 0) > calorieTarget
                  return (
                    <div key={day.date} className="flex items-center gap-3">
                      <p className="text-[9px] text-[var(--c-text4)] font-mono w-8 shrink-0">{new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' })}</p>
                      <div className="flex-1 h-2 bg-[var(--c-bg)] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${isOver ? 'bg-[#f87171]' : 'bg-[#b0e455]'}`} style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-[9px] text-[var(--c-text3)] font-mono w-12 text-right shrink-0">{day.calories} kcal</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {statUpdates.length === 0 && workoutLogs.length === 0 && calorieLogs.length === 0 && progressPhotos.length === 0 && (
            <p className="text-sm text-[var(--c-text4)] text-center py-6">No data yet for this member.</p>
          )}
        </>
      )}
    </div>
  )
}

// ─── Members tab ──────────────────────────────────────────────────────────────

function MembersTab({ members, allStats, threads, lastMessages, myReads, userId, onOpenProgram, snoozes, onMarkAddressed, onUndoAddressed }: {
  members: Member[]
  allStats: Stat[]
  threads: Thread[]
  lastMessages: MsgPreview[]
  myReads: ReadReceipt[]
  userId: string
  onOpenProgram: (memberId: string) => void
  snoozes: Record<string, string>
  onMarkAddressed: (memberId: string) => void
  onUndoAddressed: (memberId: string) => void
}) {
  const supabase = createClient()
  const [stats, setStats] = useState<Stat[]>(allStats)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)

  useEffect(() => {
    const memberIds = members.map(m => m.id)
    if (!memberIds.length) return
    const channel = supabase
      .channel('coach-member-stats')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'stat_updates', filter: `member_id=in.(${memberIds.join(',')})` },
        payload => {
          setStats(prev => [payload.new as Stat, ...prev])
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [members]) // eslint-disable-line react-hooks/exhaustive-deps

  const threadToMember = Object.fromEntries(threads.map(t => [t.id, t.member_id]))
  const memberToThread = Object.fromEntries(threads.map(t => [t.member_id, t.id]))
  const lastMsgByMember: Record<string, MsgPreview> = {}
  for (const msg of lastMessages) {
    const mid = threadToMember[msg.thread_id]
    if (mid && !lastMsgByMember[mid]) lastMsgByMember[mid] = msg
  }
  const readMap = Object.fromEntries(myReads.map(r => [r.thread_id, r.last_read_at]))
  const unreadMembers = new Set(
    members.filter(m => {
      const tid = memberToThread[m.id]
      const lastMsg = lastMsgByMember[m.id]
      if (!tid || !lastMsg || lastMsg.author_id === userId) return false
      const readAt = readMap[tid]
      return !readAt || new Date(lastMsg.created_at) > new Date(readAt)
    }).map(m => m.id)
  )

  const memberMap = Object.fromEntries(members.map(m => [m.id, m]))

  const latestPerMember = members.map(m => ({
    member: m,
    stat: stats.find(s => s.member_id === m.id) ?? null,
    lastMsg: lastMsgByMember[m.id] ?? null,
  }))

  const recentStream = [...stats]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 20)

  // Summary counts
  const totalMembers = members.length
  const activeThisWeek = latestPerMember.filter(({ stat }) => {
    if (!stat) return false
    return Math.floor((Date.now() - new Date(stat.created_at).getTime()) / 86_400_000) <= 7
  }).length
  const needAttention = latestPerMember.filter(({ member, stat }) => needsAttention(stat, snoozes[member.id])).length

  // Sort: overdue first, then ok, then fresh
  const sortedMembers = [...latestPerMember].sort((a, b) => {
    const order = { overdue: 0, none: 1, ok: 2, fresh: 3 }
    return order[checkinStatus(a.stat)] - order[checkinStatus(b.stat)]
  })

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-[var(--c-text4)]">No members assigned yet.</p>
        <p className="text-xs text-[var(--c-text5)] mt-1">Use Admin to invite members.</p>
      </div>
    )
  }

  if (selectedMember) {
    const selectedStat = stats.find(s => s.member_id === selectedMember.id) ?? null
    return (
      <MemberDetailPanel
        member={selectedMember}
        stat={selectedStat}
        snoozedAt={snoozes[selectedMember.id] ?? null}
        onOpenProgram={(id) => { setSelectedMember(null); onOpenProgram(id) }}
        onClose={() => setSelectedMember(null)}
        onMarkAddressed={() => onMarkAddressed(selectedMember.id)}
        onUndoAddressed={() => onUndoAddressed(selectedMember.id)}
      />
    )
  }

  return (
    <div className="space-y-6">

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[var(--c-card)] shadow-sm rounded-2xl p-3 text-center border border-[var(--c-border)]">
          <p className="text-2xl font-bold text-[var(--c-text)]">{totalMembers}</p>
          <p className="text-[9px] text-[var(--c-text4)] uppercase tracking-wider mt-0.5">Total</p>
        </div>
        <div
          className={`rounded-2xl p-3 text-center border shadow-sm ${needAttention > 0 ? 'bg-[#f87171]/8 border-[#f87171]/30' : 'bg-[var(--c-card)] border-[var(--c-border)]'}`}
          style={undefined}
        >
          <p className={`text-2xl font-bold ${needAttention > 0 ? 'text-[#f87171]' : 'text-[var(--c-text4)]'}`}>{needAttention}</p>
          <p className="text-[9px] text-[var(--c-text4)] uppercase mt-0.5">Attn</p>
        </div>
        <div className="bg-[var(--c-card)] shadow-sm rounded-2xl p-3 text-center border border-[var(--c-border)]">
          <p className="text-2xl font-bold text-[#16a34a]">{activeThisWeek}</p>
          <p className="text-[9px] text-[var(--c-text4)] uppercase tracking-wider mt-0.5">Active</p>
        </div>
      </div>

      {/* Roster */}
      <div>
        <p className="text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono mb-3">Roster</p>
        <div className="space-y-2">
          {sortedMembers.map(({ member, stat, lastMsg }) => {
            const status = checkinStatus(stat)
            return (
              <button
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className="w-full bg-[var(--c-card)] shadow-sm rounded-2xl p-4 flex items-center gap-4 border border-[var(--c-border)] hover:border-[var(--c-accent-text)]/20 transition-colors text-left"
              >
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-[var(--c-accent-text)]/10 border border-[var(--c-border2)] flex items-center justify-center text-xs font-mono font-bold text-[var(--c-accent-text)]">
                    {member.avatar_url ? <img src={member.avatar_url} alt="" className="w-full h-full object-cover" /> : memberName(member).charAt(0).toUpperCase()}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--c-card2)] ${STATUS_DOT[status]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--c-text)] truncate">{memberName(member)}</p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    {stat ? (
                      <p className="text-[10px] text-[var(--c-text4)] font-mono" suppressHydrationWarning>
                        Check-in {relTime(stat.created_at)} ago
                        {stat.weight_kg != null ? ` · ${toDisplay(stat.weight_kg, member.weight_unit)}` : ''}
                        {stat.confidence != null ? <span style={{ color: confidenceColor(stat.confidence) }}> · {stat.confidence}/10</span> : null}
                      </p>
                    ) : (
                      <p className="text-[10px] text-[var(--c-text4)] font-mono">No check-ins</p>
                    )}
                    {lastMsg && (
                      <p className="text-[10px] text-[var(--c-text4)] font-mono" suppressHydrationWarning>Msg {relTime(lastMsg.created_at)} ago</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-medium tracking-wide uppercase px-2.5 py-0.5 rounded-full ${
                      status === 'fresh' ? 'text-[#15803d] bg-[#15803d]/10'
                      : status === 'ok' ? 'text-[#b45309] bg-[#b45309]/10'
                      : status === 'overdue' ? 'text-[#dc2626] bg-[#dc2626]/10'
                      : 'text-[var(--c-text4)] bg-[var(--c-card)]'
                    }`}>
                      {STATUS_LABEL[status]}
                    </span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-[var(--c-text4)]">
                      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  {unreadMembers.has(member.id) && (
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest bg-[#b0e455] text-[#0f1a0c] px-2 py-0.5 rounded-full">New</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {recentStream.length > 0 && (
        <div>
          <p className="text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono mb-3">Recent updates</p>
          <div className="space-y-2">
            {recentStream.map(s => {
              const m = memberMap[s.member_id]
              if (!m) return null
              return (
                <div key={s.id} className="bg-[var(--c-card)] shadow-sm rounded-2xl border border-[var(--c-border)] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-[var(--c-text)]">{memberName(m)}</p>
                    <p className="text-[10px] text-[var(--c-text4)] font-mono" suppressHydrationWarning>{relTime(s.created_at)} ago</p>
                  </div>
                  <div className="flex gap-4">
                    {s.weight_kg != null && (
                      <div>
                        <p className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-widest">Weight</p>
                        <p className="text-sm font-semibold text-[var(--c-text)]">{toDisplay(s.weight_kg, m.weight_unit)}</p>
                      </div>
                    )}
                    {s.confidence != null && (
                      <div>
                        <p className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-widest">Confidence</p>
                        <p className="text-sm font-semibold" style={{ color: confidenceColor(s.confidence) }}>{s.confidence}/10</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Programs tab ─────────────────────────────────────────────────────────────

function ProgramsTab({ members, userId, initialMemberId }: { members: Member[]; userId: string; initialMemberId?: string | null }) {
  const supabase = createClient()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<Section>('split')
  const [sections, setSections] = useState<Partial<Record<Section, object | null>>>({})
  const [sectionLoadKey, setSectionLoadKey] = useState(0)
  const [loadingSections, setLoadingSections] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const selected = members.find(m => m.id === selectedId) ?? null
  const SECTIONS: Section[] = ['split', 'food', 'habits']

  useEffect(() => {
    if (initialMemberId && initialMemberId !== selectedId) {
      selectMember(initialMemberId)
    }
  }, [initialMemberId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function selectMember(id: string) {
    setSelectedId(id)
    setActiveSection('split')
    setSections({})
    setLoadingSections(true)
    const { data } = await supabase
      .from('program_sections')
      .select('section, content_json')
      .eq('member_id', id)
    const map: Partial<Record<Section, object | null>> = {}
    for (const row of data ?? []) map[row.section as Section] = row.content_json
    setSections(map)
    setLoadingSections(false)
    setSectionLoadKey(k => k + 1)
  }

  async function saveHabitsSection(data: HabitsData) {
    if (!selectedId) return
    setSaving(true)
    await supabase.from('program_sections').upsert(
      { member_id: selectedId, section: 'habits', content_json: data, updated_by: userId },
      { onConflict: 'member_id,section' }
    )
    setSections(prev => ({ ...prev, habits: data }))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function saveFoodSection(data: BmrData) {
    if (!selectedId) return
    setSaving(true)
    await supabase.from('program_sections').upsert(
      { member_id: selectedId, section: 'food', content_json: data, updated_by: userId },
      { onConflict: 'member_id,section' }
    )
    setSections(prev => ({ ...prev, food: data }))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function saveSplitSection(data: StructuredSplit) {
    if (!selectedId) return
    setSaving(true)
    await supabase.from('program_sections').upsert(
      { member_id: selectedId, section: 'split', content_json: data, updated_by: userId },
      { onConflict: 'member_id,section' }
    )
    setSections(prev => ({ ...prev, split: data }))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setSaving(false)
  }

  if (!selectedId) {
    return (
      <div>
        <p className="text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono mb-3">Select a member to edit their program</p>
        <div className="space-y-2">
          {members.map(m => (
            <button
              key={m.id}
              onClick={() => selectMember(m.id)}
              className="w-full bg-[var(--c-card)] shadow-sm rounded-2xl p-4 flex items-center gap-3 border border-[var(--c-border)] hover:border-[var(--c-accent-text)]/20 hover:bg-[var(--c-hover)] transition text-left"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-[var(--c-accent-text)]/10 border border-[var(--c-border2)] flex items-center justify-center text-xs font-mono font-bold text-[var(--c-accent-text)] shrink-0">
                {m.avatar_url ? <img src={m.avatar_url} alt="" className="w-full h-full object-cover" /> : memberName(m).charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--c-text)]">{memberName(m)}</p>
                <p className="text-[10px] text-[var(--c-text4)] font-mono">Split · Food · Habits</p>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-[var(--c-text4)] ml-auto">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => setSelectedId(null)} className="text-[var(--c-text4)] hover:text-[var(--c-text)] transition">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p className="text-sm font-semibold text-[var(--c-text)]">{memberName(selected!)}</p>
      </div>

      {/* Section tabs */}
      <div className="border-b border-[var(--c-border)] mb-4">
        <div className="flex gap-1">
          {SECTIONS.map(s => (
            <button
              key={s}
              onClick={() => setActiveSection(s)}
              className={`relative flex-1 py-2.5 text-[11px] font-mono capitalize transition text-center ${
                activeSection === s ? 'text-[var(--c-accent-text)]' : 'text-[var(--c-text3)] hover:text-[var(--c-text)]'
              }`}
            >
              {s}
              {activeSection === s && (
                <span className="absolute bottom-0 left-1 right-1 h-0.5 bg-[var(--c-accent-text)] rounded-full translate-y-px" />
              )}
            </button>
          ))}
        </div>
      </div>

      {loadingSections ? (
        <div className="flex justify-center py-16">
          <div className="w-5 h-5 border-2 border-[var(--c-border2)] border-t-[#b0e455]/60 rounded-full animate-spin" />
        </div>
      ) : activeSection === 'food' ? (
        <BmrSection
          key={`${selectedId}-${sectionLoadKey}`}
          initial={(sections.food as BmrData | null | undefined) ?? null}
          onSave={saveFoodSection}
          saving={saving}
          saved={saved}
        />
      ) : activeSection === 'habits' ? (
        <HabitsSection
          key={`${selectedId}-${sectionLoadKey}`}
          initial={(sections.habits as HabitsData | null | undefined) ?? null}
          onSave={saveHabitsSection}
          saving={saving}
          saved={saved}
        />
      ) : activeSection === 'split' ? (
        <SplitBuilder
          key={`${selectedId}-${sectionLoadKey}`}
          initial={(() => {
            const c = sections.split as { type?: string } | null | undefined
            return c?.type === 'structured_split' ? (c as StructuredSplit) : null
          })()}
          memberName={memberName(selected!)}
          onSave={saveSplitSection}
        />
      ) : null}
    </div>
  )
}

// ─── Messages tab ─────────────────────────────────────────────────────────────

function MessagesTab({
  userId,
  members,
  threads,
  lastMessages,
  myReads,
  coachName,
  coachAvatarUrl,
  coachAvatarColor,
}: {
  userId: string
  members: Member[]
  threads: Thread[]
  lastMessages: MsgPreview[]
  myReads: ReadReceipt[]
  coachName: string | null
  coachAvatarUrl: string | null
  coachAvatarColor: string
}) {
  const supabase = createClient()
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [lastMsgState, setLastMsgState] = useState<MsgPreview[]>(lastMessages)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const memberMap = Object.fromEntries(members.map(m => [m.id, m]))
  const threadMap = Object.fromEntries(threads.map(t => [t.id, t]))

  // Last message per thread — kept in sync as messages are loaded/sent
  const lastMsgByThread: Record<string, MsgPreview> = {}
  for (const msg of lastMsgState) {
    if (!lastMsgByThread[msg.thread_id]) lastMsgByThread[msg.thread_id] = msg
  }

  const readMap: Record<string, string> = {}
  for (const r of myReads) readMap[r.thread_id] = r.last_read_at

  const sortedThreads = [...threads].sort((a, b) => {
    const ta = lastMsgByThread[a.id]?.created_at ?? ''
    const tb = lastMsgByThread[b.id]?.created_at ?? ''
    return tb.localeCompare(ta)
  })

  function isUnread(threadId: string) {
    const last = lastMsgByThread[threadId]
    if (!last) return false
    if (last.author_id === userId) return false
    const read = readMap[threadId]
    return !read || new Date(last.created_at) > new Date(read)
  }

  async function openThread(threadId: string) {
    setSelectedThreadId(threadId)
    setChatMessages([])
    setLoadError(null)
    setLoadingMessages(true)
    try {
      const res = await fetch(`/api/get-thread-messages?thread_id=${threadId}`)
      const json = await res.json()
      if (!res.ok) {
        setLoadError(`Could not load messages: ${json.error ?? 'Unknown error'}`)
        console.error('get-thread-messages error:', json.error)
      } else {
        const msgs = json.messages as ChatMessage[]
        setChatMessages(msgs)
        if (msgs.length > 0) {
          const latest = msgs[msgs.length - 1]
          setLastMsgState(prev => {
            const filtered = prev.filter(m => m.thread_id !== threadId)
            return [{ thread_id: threadId, body: latest.body, created_at: latest.created_at, author_id: latest.author_id }, ...filtered]
          })
        }
      }
    } catch (err) {
      setLoadError('Network error loading messages.')
      console.error('get-thread-messages fetch error:', err)
    }
    setLoadingMessages(false)
    await supabase.from('message_reads').upsert({
      thread_id: threadId, user_id: userId, last_read_at: new Date().toISOString(),
    })
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'instant' }), 50)
  }

  // Realtime for selected thread
  useEffect(() => {
    if (!selectedThreadId) return
    const channel = supabase
      .channel(`coach-${selectedThreadId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `thread_id=eq.${selectedThreadId}` },
        payload => {
          const msg = payload.new as ChatMessage
          setChatMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, { ...msg, message_attachments: [] }])
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
          supabase.from('message_reads').upsert({ thread_id: selectedThreadId, user_id: userId, last_read_at: new Date().toISOString() })
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [selectedThreadId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function send() {
    if (!selectedThreadId || !body.trim() || sending) return
    setSending(true)
    setSendError(null)
    const text = body.trim()
    try {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thread_id: selectedThreadId, body: text }),
      })
      const json = await res.json()
      if (!res.ok || !json.msg) {
        setSendError(`Failed to send: ${json.error ?? 'Unknown error'}`)
        console.error('send-message error:', json.error)
      } else {
        setBody('')
        if (textareaRef.current) textareaRef.current.style.height = 'auto'
        setChatMessages(prev => prev.some(m => m.id === json.msg.id) ? prev : [...prev, { ...json.msg, message_attachments: [] }])
        setLastMsgState(prev => {
          const filtered = prev.filter(m => m.thread_id !== selectedThreadId)
          return [{ thread_id: selectedThreadId!, body: text, created_at: json.msg.created_at, author_id: userId }, ...filtered]
        })
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      }
    } catch (err) {
      setSendError('Network error — check your connection.')
      console.error('send-message fetch error:', err)
    }
    setSending(false)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  // Thread inbox
  if (!selectedThreadId) {
    if (sortedThreads.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-sm text-[var(--c-text4)]">No threads yet.</p>
          <p className="text-xs text-[var(--c-text5)] mt-1">Use Admin to set up member threads.</p>
        </div>
      )
    }
    return (
      <div className="space-y-2">
        <p className="text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono mb-3">Inbox</p>
        {sortedThreads.map(thread => {
          const m = memberMap[thread.member_id]
          const last = lastMsgByThread[thread.id]
          const unread = isUnread(thread.id)
          return (
            <button
              key={thread.id}
              onClick={() => openThread(thread.id)}
              className="w-full bg-[var(--c-card)] shadow-sm rounded-2xl p-4 flex items-center gap-3 border border-[var(--c-border)] hover:border-[var(--c-accent-text)]/20 hover:bg-[var(--c-hover)] transition text-left"
            >
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-[var(--c-accent-text)]/10 border border-[var(--c-border2)] flex items-center justify-center text-xs font-mono font-bold text-[var(--c-accent-text)]">
                  {m?.avatar_url ? <img src={m.avatar_url} alt="" className="w-full h-full object-cover" /> : (m ? memberName(m).charAt(0).toUpperCase() : '?')}
                </div>
                {unread && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#b0e455] rounded-full border-2 border-[var(--c-bg)]" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${unread ? 'font-semibold text-[var(--c-text)]' : 'text-[var(--c-text2)]'}`}>
                  {m ? memberName(m) : 'Unknown'}
                </p>
                {last && (
                  <p className={`text-[11px] truncate mt-0.5 ${unread ? 'text-[var(--c-text3)]' : 'text-[var(--c-text4)]'}`}>{last.body || '📎 Attachment'}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                {last && (
                  <p className="text-[10px] text-[var(--c-text4)] font-mono" suppressHydrationWarning>{relTime(last.created_at)}</p>
                )}
                {unread && (
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest bg-[#b0e455] text-[#0f1a0c] px-2 py-0.5 rounded-full">New</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  // Thread chat view
  const thread = threadMap[selectedThreadId]
  const chatMember = thread ? memberMap[thread.member_id] : null

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => setSelectedThreadId(null)} className="text-[var(--c-text4)] hover:text-[var(--c-text)] transition shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p className="text-sm font-semibold text-[var(--c-text)]">{chatMember ? memberName(chatMember) : 'Chat'}</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 pb-4" style={{ maxHeight: 'calc(100vh - 340px)' }}>
        {loadError && (
          <div className="bg-[#f87171]/10 border border-[#f87171]/25 rounded-xl px-4 py-3 text-xs text-[#f87171]">{loadError}</div>
        )}
        {loadingMessages && (
          <div className="flex justify-center py-16">
            <div className="w-5 h-5 border-2 border-[var(--c-border2)] border-t-[#b0e455]/60 rounded-full animate-spin" />
          </div>
        )}
        {!loadError && !loadingMessages && chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-[var(--c-text4)]">No messages yet.</p>
            <p className="text-xs text-[var(--c-text5)] mt-1">Send the first message below.</p>
          </div>
        )}
        {chatMessages.map((msg, i) => {
          const isMine = msg.author_id === userId
          const prev = chatMessages[i - 1]
          const next = chatMessages[i + 1]
          const isFirst = !prev || prev.author_id !== msg.author_id
          const isLast = !next || next.author_id !== msg.author_id

          const memberAvatar = chatMember?.avatar_url
            ? <img src={chatMember.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" style={{ border: `1.5px solid ${chatMember.avatar_color ?? '#b0e455'}` }} />
            : <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0" style={{ background: (chatMember?.avatar_color ?? '#b0e455') + '22', border: `1.5px solid ${chatMember?.avatar_color ?? '#b0e455'}`, color: chatMember?.avatar_color ?? '#b0e455' }}>{(chatMember ? memberName(chatMember) : '?').charAt(0).toUpperCase()}</div>

          const coachAvatar = coachAvatarUrl
            ? <img src={coachAvatarUrl} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" style={{ border: `1.5px solid ${coachAvatarColor}` }} />
            : <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0" style={{ background: coachAvatarColor + '22', border: `1.5px solid ${coachAvatarColor}`, color: coachAvatarColor }}>{(coachName ?? 'J').charAt(0).toUpperCase()}</div>

          const displayName = isMine ? (coachName ?? 'Coach') : (chatMember ? memberName(chatMember) : 'Member')

          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
              {!isMine && (isLast ? memberAvatar : <div className="w-7 shrink-0" />)}
              <div className={`max-w-[75%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                {isFirst && (
                  <p className="text-[11px] text-[var(--c-text4)] font-medium mb-1 px-1">{displayName}</p>
                )}
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMine ? 'bg-[#b0e455] text-[#0f1a0c] rounded-br-sm' : 'bg-[var(--c-card)] text-[var(--c-text)] border border-[var(--c-border)] rounded-bl-sm'
                }`}>
                  {msg.body}
                </div>
              </div>
              {isMine && (isLast ? coachAvatar : <div className="w-7 shrink-0" />)}
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {sendError && (
        <div className="bg-[#f87171]/10 border border-[#f87171]/25 rounded-xl px-4 py-2.5 text-xs text-[#f87171] mb-2">
          {sendError}
        </div>
      )}

      <div className="flex items-end gap-2 pt-3 border-t border-[var(--c-border)]">
        <textarea
          ref={textareaRef}
          value={body}
          onChange={e => { setBody(e.target.value); setSendError(null); const ta = textareaRef.current; if (ta) { ta.style.height = 'auto'; ta.style.height = `${ta.scrollHeight}px` } }}
          onKeyDown={handleKeyDown}
          placeholder="Message…"
          rows={1}
          className="flex-1 bg-[var(--c-card)] border border-[var(--c-border)] rounded-2xl px-4 py-2.5 text-sm text-[var(--c-text)] placeholder-[var(--c-text5)] resize-none focus:outline-none focus:border-[#b0e455]/40 transition max-h-28 overflow-y-auto leading-relaxed"
        />
        <button
          onClick={send}
          disabled={sending || !body.trim()}
          className="shrink-0 w-9 h-9 rounded-full bg-[#b0e455] flex items-center justify-center text-[#0f1a0c] hover:bg-[#c9f070] transition disabled:opacity-30 mb-0.5"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 translate-x-px">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ─── Applications Kanban ──────────────────────────────────────────────────────

type Application = {
  id: string
  created_at: string
  status: 'pending' | 'accepted' | 'declined' | 'call_booked' | 'waiting' | 'closed'
  responded_at: string | null
  first_name: string | null
  email: string | null
  phone: string | null
  instagram: string | null
  age: string | null
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

type KanbanColKey = 'new' | 'call_booked' | 'waiting' | 'closed'

function appRelTime(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

function columnKey(status: Application['status']): KanbanColKey {
  if (['accepted', 'call_booked'].includes(status)) return 'call_booked'
  if (status === 'waiting') return 'waiting'
  if (['declined', 'closed'].includes(status)) return 'closed'
  return 'new'
}

const KANBAN_COLS: { key: KanbanColKey; label: string; accent: string; dim: string }[] = [
  { key: 'new',        label: 'New',         accent: '#fbbf24', dim: '#fbbf24/15' },
  { key: 'call_booked',label: 'Call Booked', accent: '#b0e455', dim: '#b0e455/15' },
  { key: 'waiting',    label: 'Waiting',     accent: '#60a5fa', dim: '#60a5fa/15' },
  { key: 'closed',     label: 'Closed',      accent: '#94a3b8', dim: '#94a3b8/15' },
]

function ApplicationsSection() {
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [actionState, setActionState] = useState<Record<string, 'idle' | 'loading' | 'done' | 'error'>>({})
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [declineFlow, setDeclineFlow] = useState<{ appId: string; note: string; step: 'compose' | 'preview' } | null>(null)

  useEffect(() => {
    fetch('/api/admin-applications')
      .then(r => r.json())
      .then(json => setApps(json.applications ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Keep selectedApp in sync when apps list updates
  useEffect(() => {
    if (selectedApp) {
      const updated = apps.find(a => a.id === selectedApp.id)
      if (updated) setSelectedApp(updated)
    }
  }, [apps]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAction(appId: string, action: 'accept' | 'decline', personalNote?: string) {
    setActionState(s => ({ ...s, [appId]: 'loading' }))
    try {
      const res = await fetch('/api/application-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: appId, action, personalNote }),
      })
      const json = await res.json().catch(() => ({}))
      if (res.ok) {
        const newStatus = action === 'accept' ? 'call_booked' : 'closed'
        setApps(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus, responded_at: new Date().toISOString() } : a))
        setActionState(s => ({ ...s, [appId]: 'done' }))
        if (action === 'decline') setDeclineFlow(null)
      } else {
        console.error('application-action error:', json.error)
        setActionState(s => ({ ...s, [appId]: 'error' }))
        setTimeout(() => setActionState(s => ({ ...s, [appId]: 'idle' })), 3000)
      }
    } catch {
      setActionState(s => ({ ...s, [appId]: 'error' }))
      setTimeout(() => setActionState(s => ({ ...s, [appId]: 'idle' })), 3000)
    }
  }

  async function handleMove(appId: string, status: 'call_booked' | 'waiting' | 'closed') {
    setActionState(s => ({ ...s, [appId]: 'loading' }))
    try {
      const res = await fetch('/api/move-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: appId, status }),
      })
      if (res.ok) {
        setApps(prev => prev.map(a => a.id === appId ? { ...a, status, responded_at: new Date().toISOString() } : a))
        setActionState(s => ({ ...s, [appId]: 'idle' }))
      } else {
        setActionState(s => ({ ...s, [appId]: 'error' }))
        setTimeout(() => setActionState(s => ({ ...s, [appId]: 'idle' })), 3000)
      }
    } catch {
      setActionState(s => ({ ...s, [appId]: 'error' }))
      setTimeout(() => setActionState(s => ({ ...s, [appId]: 'idle' })), 3000)
    }
  }

  async function handleDelete(appId: string) {
    setDeletingId(appId)
    const res = await fetch('/api/delete-application', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId: appId }),
    })
    if (res.ok) {
      setApps(prev => prev.filter(a => a.id !== appId))
      setSelectedApp(null)
    }
    setDeletingId(null)
  }

  if (loading) {
    return <div className="py-8 text-center text-xs text-[var(--c-text4)] font-mono">Loading…</div>
  }

  if (apps.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-xs text-[var(--c-text4)] font-mono">No applications yet.</p>
        <p className="text-[10px] text-[var(--c-text5)] mt-1">Submissions will appear here.</p>
      </div>
    )
  }

  const colApps = (key: KanbanColKey) => apps.filter(a => columnKey(a.status) === key)

  return (
    <div className="space-y-5">
      {/* Kanban board — horizontal scroll on mobile */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {KANBAN_COLS.map(col => {
          const items = colApps(col.key)
          return (
            <div key={col.key} className="flex-none w-60 space-y-2">
              {/* Column header */}
              <div className="flex items-center gap-2 px-1">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: col.accent }} />
                <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--c-text3)] flex-1">{col.label}</p>
                {items.length > 0 && (
                  <span className="text-[10px] font-mono text-[var(--c-text4)] bg-[var(--c-card2)] px-1.5 py-0.5 rounded-full border border-[var(--c-border)]">{items.length}</span>
                )}
              </div>

              {/* Cards */}
              <div className="space-y-2 min-h-[80px]">
                {items.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-[var(--c-border)] px-3 py-6 flex items-center justify-center">
                    <p className="text-[10px] text-[var(--c-text5)] font-mono">Empty</p>
                  </div>
                )}
                {items.map(app => {
                  const isSelected = selectedApp?.id === app.id
                  const state = actionState[app.id] ?? 'idle'
                  return (
                    <div
                      key={app.id}
                      className={`rounded-2xl border p-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[var(--c-card)] border-[var(--c-accent-text)]/30 shadow-md'
                          : 'bg-[var(--c-card)] border-[var(--c-border)] hover:border-[var(--c-border2)] shadow-sm'
                      }`}
                      onClick={() => setSelectedApp(isSelected ? null : app)}
                    >
                      {/* Name + time */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ backgroundColor: `${col.accent}20`, color: col.accent }}>
                            {(app.first_name ?? app.email ?? '?').charAt(0).toUpperCase()}
                          </div>
                          <p className="text-xs font-semibold text-[var(--c-text)] truncate">{app.first_name ?? app.email?.split('@')[0] ?? 'Unknown'}</p>
                        </div>
                        <p className="text-[9px] text-[var(--c-text5)] font-mono shrink-0">{appRelTime(app.created_at)}</p>
                      </div>

                      {/* Quick info */}
                      {(app.age || app.location) && (
                        <p className="text-[10px] text-[var(--c-text4)] mb-2 truncate">
                          {[app.age, app.location].filter(Boolean).join(' · ')}
                        </p>
                      )}

                      {/* Commitment bar */}
                      {app.commitment != null && (
                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-[9px] text-[var(--c-text5)] font-mono uppercase tracking-widest">Commit</p>
                            <p className="text-[9px] font-mono" style={{ color: col.accent }}>{app.commitment}/10</p>
                          </div>
                          <div className="h-1 bg-[var(--c-bg)] rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${app.commitment * 10}%`, backgroundColor: col.accent }} />
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      {col.key === 'new' && (
                        <div className="flex gap-1.5 mt-2.5">
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              setSelectedApp(app)
                              setDeclineFlow({ appId: app.id, note: '', step: 'compose' })
                            }}
                            disabled={state === 'loading'}
                            className="flex-1 py-1.5 rounded-xl border border-[var(--c-border2)] text-[10px] font-mono text-[var(--c-text4)] hover:text-red-400 hover:border-red-400/30 transition disabled:opacity-40"
                          >
                            Decline
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); handleAction(app.id, 'accept') }}
                            disabled={state === 'loading'}
                            className="flex-1 py-1.5 rounded-xl text-[10px] font-mono font-semibold transition disabled:opacity-40"
                            style={{ backgroundColor: col.accent, color: '#0f1a0c' }}
                          >
                            {state === 'loading' ? '…' : state === 'done' ? '✓' : 'Accept'}
                          </button>
                        </div>
                      )}
                      {col.key === 'call_booked' && (
                        <div className="flex gap-1.5 mt-2.5">
                          <button
                            onClick={e => { e.stopPropagation(); handleMove(app.id, 'waiting') }}
                            disabled={state === 'loading'}
                            className="flex-1 py-1.5 rounded-xl border border-[#60a5fa]/30 text-[10px] font-mono text-[#60a5fa] hover:bg-[#60a5fa]/8 transition disabled:opacity-40"
                          >
                            → Waiting
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); handleMove(app.id, 'closed') }}
                            disabled={state === 'loading'}
                            className="flex-1 py-1.5 rounded-xl border border-[var(--c-border2)] text-[10px] font-mono text-[var(--c-text4)] hover:text-[var(--c-text)] transition disabled:opacity-40"
                          >
                            → Close
                          </button>
                        </div>
                      )}
                      {col.key === 'waiting' && (
                        <div className="flex gap-1.5 mt-2.5">
                          <button
                            onClick={e => { e.stopPropagation(); handleMove(app.id, 'call_booked') }}
                            disabled={state === 'loading'}
                            className="flex-1 py-1.5 rounded-xl border border-[#b0e455]/30 text-[10px] font-mono text-[#b0e455] hover:bg-[#b0e455]/8 transition disabled:opacity-40"
                          >
                            → Call
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); handleMove(app.id, 'closed') }}
                            disabled={state === 'loading'}
                            className="flex-1 py-1.5 rounded-xl border border-[var(--c-border2)] text-[10px] font-mono text-[var(--c-text4)] hover:text-[var(--c-text)] transition disabled:opacity-40"
                          >
                            → Close
                          </button>
                        </div>
                      )}
                      {col.key === 'closed' && (
                        <button
                          onClick={e => { e.stopPropagation(); handleMove(app.id, 'waiting') }}
                          disabled={state === 'loading'}
                          className="w-full mt-2.5 py-1.5 rounded-xl border border-[#60a5fa]/30 text-[10px] font-mono text-[#60a5fa] hover:bg-[#60a5fa]/8 transition disabled:opacity-40"
                        >
                          ← Reopen
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Detail drawer — shown below kanban when a card is selected */}
      {selectedApp && (() => {
        const app = selectedApp
        const state = actionState[app.id] ?? 'idle'
        const colKey = columnKey(app.status)
        const col = KANBAN_COLS.find(c => c.key === colKey)!
        return (
          <div className="bg-[var(--c-card)] shadow-sm rounded-2xl border border-[var(--c-border)] overflow-hidden">
            {/* Drawer header */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-[var(--c-border)]">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ backgroundColor: `${col.accent}20`, color: col.accent }}>
                {(app.first_name ?? app.email ?? '?').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--c-text)]">{app.first_name ?? 'Unknown'}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: col.accent }} />
                  <p className="text-[10px] font-mono text-[var(--c-text4)]">{col.label} · {appRelTime(app.created_at)}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-[var(--c-text4)] hover:text-[var(--c-text)] transition shrink-0"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="px-4 py-5 space-y-5">
              {/* Contact */}
              <div className="grid grid-cols-2 gap-3">
                {app.email && (
                  <div>
                    <p className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-widest mb-1">Email</p>
                    <p className="text-xs text-[var(--c-text2)] break-all">{app.email}</p>
                  </div>
                )}
                {app.phone && (
                  <div>
                    <p className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-widest mb-1">Phone / WA</p>
                    <p className="text-xs text-[var(--c-text2)]">{app.phone}</p>
                  </div>
                )}
                {app.instagram && (
                  <div>
                    <p className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-widest mb-1">Instagram</p>
                    <p className="text-xs text-[var(--c-text2)]">@{app.instagram}</p>
                  </div>
                )}
                {app.work && (
                  <div>
                    <p className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-widest mb-1">Work</p>
                    <p className="text-xs text-[var(--c-text2)]">{app.work}</p>
                  </div>
                )}
              </div>

              {/* Training background */}
              {(app.training_history || app.training_looks || app.coach_history) && (
                <div className="space-y-2">
                  {app.training_history && (
                    <div>
                      <p className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-widest mb-1.5">Where they&apos;re at</p>
                      <p className="text-xs text-[var(--c-text2)] leading-relaxed bg-[var(--c-bg)] rounded-xl px-3 py-2.5">{app.training_history}</p>
                    </div>
                  )}
                  {app.training_looks && (
                    <div>
                      <p className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-widest mb-1.5">Training overview</p>
                      <p className="text-xs text-[var(--c-text2)] leading-relaxed bg-[var(--c-bg)] rounded-xl px-3 py-2.5">{app.training_looks}</p>
                    </div>
                  )}
                  {app.coach_history && (
                    <div>
                      <p className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-widest mb-1.5">Coaching history</p>
                      <p className="text-xs text-[var(--c-text2)] leading-relaxed bg-[var(--c-bg)] rounded-xl px-3 py-2.5">{app.coach_history}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Big answers */}
              {app.mirror_goal && (
                <div>
                  <p className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-widest mb-1.5">Mirror goal</p>
                  <p className="text-sm text-[var(--c-text)] leading-relaxed bg-[var(--c-bg)] rounded-xl px-3 py-2.5 italic">&quot;{app.mirror_goal}&quot;</p>
                </div>
              )}
              {app.what_stopped && (
                <div>
                  <p className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-widest mb-1.5">What stopped them</p>
                  <p className="text-sm text-[var(--c-text)] leading-relaxed bg-[var(--c-bg)] rounded-xl px-3 py-2.5 italic">&quot;{app.what_stopped}&quot;</p>
                </div>
              )}
              {app.why_now && (
                <div>
                  <p className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-widest mb-1.5">Why now</p>
                  <p className="text-sm text-[var(--c-text)] leading-relaxed bg-[var(--c-bg)] rounded-xl px-3 py-2.5 italic">&quot;{app.why_now}&quot;</p>
                </div>
              )}

              {/* Scores */}
              <div className="flex gap-4">
                {app.commitment !== null && (
                  <div className="bg-[var(--c-bg)] rounded-xl px-3 py-2.5">
                    <p className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-widest">Commitment</p>
                    <p className="text-xl font-bold mt-0.5" style={{ color: col.accent }}>{app.commitment}<span className="text-xs text-[var(--c-text3)]">/10</span></p>
                  </div>
                )}
                {app.investment_fit && (
                  <div className="flex-1 bg-[var(--c-bg)] rounded-xl px-3 py-2.5">
                    <p className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-widest">Investment fit</p>
                    <p className="text-xs text-[var(--c-text2)] mt-1 leading-relaxed">{app.investment_fit}</p>
                    {app.investment_why && <p className="text-xs text-[var(--c-text3)] mt-1 italic">{app.investment_why}</p>}
                  </div>
                )}
              </div>

              {/* Actions */}
              {colKey === 'new' && (
                <div className="pt-2 border-t border-[var(--c-border)] space-y-3">
                  {/* Decline flow — compose or preview step */}
                  {declineFlow?.appId === app.id ? (
                    <>
                      {declineFlow.step === 'compose' && (
                        <>
                          <div>
                            <p className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-widest mb-2">Personal note <span className="normal-case tracking-normal text-[var(--c-text5)]">— optional, appears at the top of the email</span></p>
                            <textarea
                              value={declineFlow.note}
                              onChange={e => setDeclineFlow(prev => prev ? { ...prev, note: e.target.value } : null)}
                              placeholder={`e.g. Really appreciated your honesty about where you're at — that kind of self-awareness is rare.`}
                              rows={3}
                              className="w-full bg-[var(--c-bg)] border border-[var(--c-border2)] rounded-xl px-3 py-2.5 text-sm text-[var(--c-text)] placeholder-[var(--c-text5)] focus:outline-none focus:border-[var(--c-border)] resize-none transition leading-relaxed"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setDeclineFlow(null)}
                              className="flex-1 py-2.5 rounded-2xl border border-[var(--c-border2)] text-sm text-[var(--c-text3)] hover:text-[var(--c-text)] transition"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => setDeclineFlow(prev => prev ? { ...prev, step: 'preview' } : null)}
                              className="flex-1 py-2.5 rounded-2xl bg-[var(--c-card2)] border border-[var(--c-border2)] text-sm text-[var(--c-text2)] hover:text-[var(--c-text)] transition"
                            >
                              Preview →
                            </button>
                          </div>
                        </>
                      )}
                      {declineFlow.step === 'preview' && (
                        <>
                          <div className="bg-[var(--c-bg)] rounded-2xl p-4 space-y-2.5 border border-[var(--c-border)]">
                            <p className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-widest mb-3">Email preview — to {app.email}</p>
                            <p className="text-sm font-bold text-[var(--c-text)]">Hey {app.first_name ?? 'there'}.</p>
                            {declineFlow.note.trim() && (
                              <p className="text-sm text-[var(--c-text)] italic leading-relaxed border-l-2 border-[var(--c-border2)] pl-3">{declineFlow.note.trim()}</p>
                            )}
                            <p className="text-sm text-[var(--c-text2)] leading-relaxed">Thank you for taking the time — I genuinely read every application, and yours was no different.</p>
                            <p className="text-xs text-[var(--c-text4)] leading-relaxed">After sitting with it, I don&apos;t think the timing is right for us to work together. That&apos;s not a reflection of your goals or your drive — it&apos;s about fit...</p>
                            <p className="text-xs text-[var(--c-text4)]">...Wishing you real progress on this. Keep going. 💪</p>
                            <p className="text-sm text-[var(--c-text3)]">All the best,<br /><span className="font-semibold text-[var(--c-text2)]">Javi</span></p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setDeclineFlow(prev => prev ? { ...prev, step: 'compose' } : null)}
                              className="flex-1 py-2.5 rounded-2xl border border-[var(--c-border2)] text-sm text-[var(--c-text3)] hover:text-[var(--c-text)] transition"
                            >
                              ← Edit Note
                            </button>
                            <button
                              onClick={() => handleAction(app.id, 'decline', declineFlow.note.trim() || undefined)}
                              disabled={state === 'loading'}
                              className="flex-1 py-2.5 rounded-2xl bg-red-500/10 border border-red-400/30 text-sm font-semibold text-red-400 hover:bg-red-500/15 transition disabled:opacity-40"
                            >
                              {state === 'loading' ? 'Sending…' : state === 'error' ? 'Error — retry' : 'Send Email'}
                            </button>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    /* Normal accept / decline buttons */
                    <div className="flex gap-3">
                      <button
                        onClick={() => setDeclineFlow({ appId: app.id, note: '', step: 'compose' })}
                        disabled={state === 'loading'}
                        className="flex-1 py-3 rounded-2xl border border-[var(--c-border2)] text-sm text-[var(--c-text3)] hover:text-[#f87171] hover:border-[#f87171]/30 transition disabled:opacity-40"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleAction(app.id, 'accept')}
                        disabled={state === 'loading'}
                        className="flex-1 py-3 rounded-2xl bg-[#b0e455] text-[#0f1a0c] text-sm font-semibold hover:bg-[#c9f070] transition disabled:opacity-40"
                      >
                        {state === 'loading' ? 'Sending…' : state === 'done' ? 'Sent ✓' : 'Accept — Send Invite'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Delete */}
              <div className="flex items-center justify-between pt-1 border-t border-[var(--c-border)]">
                {app.responded_at && (
                  <p className="text-[10px] text-[var(--c-text5)] font-mono">Email sent {appRelTime(app.responded_at)}</p>
                )}
                <button
                  onClick={() => handleDelete(app.id)}
                  disabled={deletingId === app.id}
                  className="ml-auto text-[10px] text-[var(--c-text5)] hover:text-red-400 transition disabled:opacity-40"
                >
                  {deletingId === app.id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

// ─── Admin tab ────────────────────────────────────────────────────────────────

type AdminProfile = { id: string; email: string; first_name: string | null; role: string }
type Assignment = { member_id: string; coach_id: string }

function AdminTab({ userEmail }: { userEmail: string }) {
  // Live data
  const [coaches, setCoaches] = useState<AdminProfile[]>([])
  const [members, setMembers] = useState<AdminProfile[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)

  // New member notifications
  const [newMembers, setNewMembers] = useState<AdminProfile[]>([])
  const [newMemberCoach, setNewMemberCoach] = useState<Record<string, string>>({})
  const knownMemberIds = useRef<Set<string>>(new Set())
  const isFirstLoad = useRef(true)

  // Invite
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [inviteMsg, setInviteMsg] = useState('')

  // Thread setup
  const [setupStatus, setSetupStatus] = useState<Record<string, 'idle' | 'loading' | 'done' | 'error'>>({})

  // Assign
  const [assignMemberId, setAssignMemberId] = useState('')
  const [assignCoachId, setAssignCoachId] = useState('')
  const [assignStatus, setAssignStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  // Broadcast
  const [broadcastBody, setBroadcastBody] = useState('')
  const [broadcastStatus, setBroadcastStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function loadData(showLoading = true) {
    if (showLoading) setLoading(true)
    const res = await fetch('/api/admin-data')
    if (res.ok) {
      const json = await res.json()
      const freshMembers: AdminProfile[] = json.members ?? []

      // Detect new members on subsequent polls (not on first load)
      if (!isFirstLoad.current) {
        const appeared = freshMembers.filter(m => !knownMemberIds.current.has(m.id))
        if (appeared.length > 0) {
          setNewMembers(prev => {
            const existingIds = new Set(prev.map(m => m.id))
            return [...prev, ...appeared.filter(m => !existingIds.has(m.id))]
          })
        }
      } else {
        isFirstLoad.current = false
      }

      knownMemberIds.current = new Set(freshMembers.map(m => m.id))
      setCoaches(json.coaches ?? [])
      setMembers(freshMembers)
      setAssignments(json.assignments ?? [])
      setThreads(json.threads ?? [])
    }
    if (showLoading) setLoading(false)
  }

  // Initial load + poll every 30 seconds
  useEffect(() => {
    loadData()
    const interval = setInterval(() => loadData(false), 30_000)
    return () => clearInterval(interval)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const assignMap = Object.fromEntries(assignments.map(a => [a.member_id, a.coach_id]))
  const threadMemberIds = new Set(threads.map(t => t.member_id))
  const membersWithoutThread = members.filter(m => !threadMemberIds.has(m.id))

  function profileName(p: AdminProfile) { return p.first_name ?? p.email.split('@')[0] }
  function coachName(id: string) { return coaches.find(c => c.id === id) }

  async function handleInvite(e: FormEvent) {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setInviteStatus('loading')
    try {
      const res = await fetch('/api/invite-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-coach-email': userEmail },
        body: JSON.stringify({ email: inviteEmail.trim(), plan: 'member' }),
      })
      const json = await res.json()
      if (res.ok) {
        setInviteStatus('ok')
        setInviteMsg('Invite sent! Refresh to see them in the list.')
        setInviteEmail('')
        setTimeout(() => loadData(), 2000)
      } else {
        setInviteStatus('error')
        setInviteMsg(json.error ?? 'Failed to send invite.')
      }
    } catch {
      setInviteStatus('error'); setInviteMsg('Network error.')
    }
    setTimeout(() => { setInviteStatus('idle'); setInviteMsg('') }, 4000)
  }

  async function handleAssign(e: FormEvent) {
    e.preventDefault()
    if (!assignMemberId || !assignCoachId) return
    setAssignStatus('loading')
    const res = await fetch('/api/admin-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'assign', memberId: assignMemberId, coachId: assignCoachId }),
    })
    if (res.ok) {
      setAssignStatus('done')
      setAssignMemberId('')
      setAssignCoachId('')
      await loadData()
      setTimeout(() => setAssignStatus('idle'), 2000)
    } else {
      const json = await res.json().catch(() => ({}))
      console.error('assign error:', json.error)
      setAssignStatus('error')
      setTimeout(() => setAssignStatus('idle'), 3000)
    }
  }

  async function setupThread(member: AdminProfile) {
    setSetupStatus(s => ({ ...s, [member.id]: 'loading' }))
    const res = await fetch('/api/admin-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'setup_thread', memberId: member.id }),
    })
    if (!res.ok) { setSetupStatus(s => ({ ...s, [member.id]: 'error' })); return }
    setSetupStatus(s => ({ ...s, [member.id]: 'done' }))
    await loadData()
    setTimeout(() => setNewMembers(prev => prev.filter(m => m.id !== member.id)), 1500)
  }

  async function handleQuickAssign(memberId: string) {
    const coachId = newMemberCoach[memberId]
    if (!coachId) return
    await fetch('/api/admin-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'assign', memberId, coachId }),
    })
    await loadData()
  }

  async function handleBroadcast(e: FormEvent) {
    e.preventDefault()
    if (!broadcastBody.trim() || !threads.length) return
    setBroadcastStatus('loading')
    await fetch('/api/admin-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'broadcast', threadIds: threads.map(t => t.id), body: broadcastBody.trim() }),
    })
    setBroadcastBody('')
    setBroadcastStatus('done')
    setTimeout(() => setBroadcastStatus('idle'), 3000)
  }

  if (loading) {
    return <div className="py-12 text-center text-xs text-[var(--c-text4)] font-mono">Loading…</div>
  }

  return (
    <div className="space-y-8">

      {/* ── New member notifications ── */}
      {newMembers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#fbbf24] animate-pulse shrink-0" />
            <p className="text-[10px] text-[#fbbf24] tracking-widest uppercase font-mono">
              New Signup{newMembers.length > 1 ? 's' : ''} ({newMembers.length})
            </p>
          </div>
          {newMembers.map(m => {
            const hasThread = threadMemberIds.has(m.id)
            const alreadyAssigned = !!assignMap[m.id]
            return (
              <div key={m.id} className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-2xl overflow-hidden shadow-sm">
                {/* amber top bar accent */}
                <div className="h-0.5 bg-[#fbbf24]/50 w-full" />
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#fbbf24]/10 border border-[#fbbf24]/20 flex items-center justify-center text-sm font-bold text-[#fbbf24] shrink-0">
                      {profileName(m).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--c-text)]">{profileName(m)}</p>
                      <p className="text-xs text-[var(--c-text3)] truncate">{m.email}</p>
                      <p className="text-[10px] text-[#fbbf24] mt-0.5">Just joined — assign a coach &amp; set up messaging</p>
                    </div>
                    <button
                      onClick={() => setNewMembers(prev => prev.filter(x => x.id !== m.id))}
                      className="text-[var(--c-text4)] hover:text-[var(--c-text3)] transition shrink-0 mt-0.5"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>

                  {coaches.length > 0 && !alreadyAssigned && (
                    <div className="flex gap-2">
                      <select
                        value={newMemberCoach[m.id] ?? ''}
                        onChange={e => setNewMemberCoach(prev => ({ ...prev, [m.id]: e.target.value }))}
                        className="flex-1 bg-[var(--c-bg)] border border-[var(--c-border)] rounded-xl px-3 py-2 text-xs text-[var(--c-text)] focus:outline-none focus:border-[var(--c-border2)] transition"
                      >
                        <option value="">Assign coach…</option>
                        {coaches.map(c => (
                          <option key={c.id} value={c.id}>{profileName(c)}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleQuickAssign(m.id)}
                        disabled={!newMemberCoach[m.id]}
                        className="px-4 py-2 rounded-xl bg-[var(--c-accent-text)]/10 border border-[var(--c-border)] text-xs font-semibold text-[var(--c-accent-text)] hover:bg-[var(--c-accent-text)]/20 transition disabled:opacity-40 shrink-0"
                      >
                        Assign
                      </button>
                    </div>
                  )}
                  {alreadyAssigned && (
                    <p className="text-xs text-[#16a34a] font-medium">Coach assigned ✓</p>
                  )}

                  <button
                    onClick={() => setupThread(m)}
                    disabled={hasThread || setupStatus[m.id] === 'loading' || setupStatus[m.id] === 'done'}
                    className="w-full py-2.5 rounded-xl bg-[var(--c-bg)] border border-[var(--c-border)] text-xs font-semibold text-[var(--c-text2)] hover:border-[var(--c-border2)] hover:text-[var(--c-text)] transition disabled:opacity-40"
                  >
                    {hasThread || setupStatus[m.id] === 'done'
                      ? 'Messaging Active ✓'
                      : setupStatus[m.id] === 'loading' ? 'Setting up…'
                      : setupStatus[m.id] === 'error' ? 'Error — retry'
                      : 'Setup Messaging Thread'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Coaches ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono">Coaches ({coaches.length})</p>
          <button onClick={() => loadData()} className="text-[10px] text-[var(--c-text4)] hover:text-[var(--c-text)]/50 font-mono transition">Refresh</button>
        </div>
        {coaches.length === 0 ? (
          <p className="text-xs text-[var(--c-text4)] font-mono">No coaches found. Set role to coach or head_coach in Supabase.</p>
        ) : (
          <div className="space-y-2">
            {coaches.map(c => (
              <div key={c.id} className="bg-[var(--c-card)] shadow-sm rounded-2xl px-4 py-3 flex items-center gap-3 border border-[var(--c-border)]">
                <div className="w-8 h-8 rounded-full bg-[var(--c-accent-text)]/10 border border-[var(--c-border2)] flex items-center justify-center text-xs font-bold text-[var(--c-accent-text)] shrink-0">
                  {profileName(c).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--c-text)]">{profileName(c)}</p>
                  <p className="text-[10px] text-[var(--c-text4)] font-mono truncate">{c.email}</p>
                </div>
                <span className="text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 rounded border text-[var(--c-accent-text)] border-[var(--c-accent-text)]/20 bg-[var(--c-accent-text)]/8">
                  {c.role === 'head_coach' ? 'Head Coach' : 'Coach'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Members ── */}
      <div>
        <p className="text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono mb-3">Members ({members.length})</p>
        {members.length === 0 ? (
          <p className="text-xs text-[var(--c-text4)] font-mono">No members yet. Invite one below.</p>
        ) : (
          <div className="space-y-2">
            {members.map(m => {
              const coach = coachName(assignMap[m.id])
              const hasThread = threadMemberIds.has(m.id)
              return (
                <div key={m.id} className="bg-[var(--c-card)] shadow-sm rounded-2xl px-4 py-3 flex items-center gap-3 border border-[var(--c-border)]">
                  <div className="w-8 h-8 rounded-full bg-[var(--c-accent-text)]/10 border border-[var(--c-border2)] flex items-center justify-center text-xs font-bold text-[var(--c-accent-text)] shrink-0">
                    {profileName(m).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--c-text)]">{profileName(m)}</p>
                    <p className="text-[10px] text-[var(--c-text4)] font-mono truncate">{m.email}</p>
                    <p className="text-[10px] text-[var(--c-text4)] font-mono mt-0.5">
                      {coach ? `Coach: ${profileName(coach)}` : 'No coach assigned'}
                      {' · '}
                      {hasThread ? 'Messaging active' : 'No thread'}
                    </p>
                  </div>
                  <span className={`text-[10px] font-medium tracking-wide uppercase px-2.5 py-0.5 rounded-lg border ${
                    hasThread
                      ? 'text-[#15803d] border-[#15803d]/25 bg-[#15803d]/8'
                      : 'text-[var(--c-text4)] border-[var(--c-border)]'
                  }`}>
                    {hasThread ? 'active' : 'pending'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Assign member to coach ── */}
      {coaches.length > 0 && members.length > 0 && (
        <div>
          <p className="text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono mb-3">Assign Member to Coach</p>
          <form onSubmit={handleAssign} className="space-y-2">
            <select
              value={assignMemberId}
              onChange={e => setAssignMemberId(e.target.value)}
              className="w-full bg-[var(--c-card)] border border-[var(--c-border)] rounded-lg px-4 py-3 text-sm text-[var(--c-text)] focus:outline-none focus:border-[#b0e455]/50 transition"
            >
              <option value="">Select member…</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{profileName(m)} ({m.email})</option>
              ))}
            </select>
            <select
              value={assignCoachId}
              onChange={e => setAssignCoachId(e.target.value)}
              className="w-full bg-[var(--c-card)] border border-[var(--c-border)] rounded-lg px-4 py-3 text-sm text-[var(--c-text)] focus:outline-none focus:border-[#b0e455]/50 transition"
            >
              <option value="">Select coach…</option>
              {coaches.map(c => (
                <option key={c.id} value={c.id}>{profileName(c)} — {c.role === 'head_coach' ? 'Head Coach' : 'Coach'}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={assignStatus === 'loading' || !assignMemberId || !assignCoachId}
              className="w-full py-3 rounded-lg bg-[#b0e455] text-[#0f1a0c] text-xs tracking-widest uppercase font-mono font-semibold hover:bg-[#c9f070] transition disabled:opacity-50"
            >
              {assignStatus === 'loading' ? 'Assigning…' : assignStatus === 'done' ? 'Assigned ✓' : assignStatus === 'error' ? 'Failed — retry' : 'Assign'}
            </button>
          </form>
        </div>
      )}

      {/* ── Setup messaging threads ── */}
      {membersWithoutThread.length > 0 && (
        <div>
          <p className="text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono mb-3">Setup Messaging Thread</p>
          <div className="space-y-2">
            {membersWithoutThread.map(m => (
              <div key={m.id} className="bg-[var(--c-card)] shadow-sm rounded-2xl px-4 py-3 flex items-center gap-3 border border-[var(--c-border)]">
                <div className="w-8 h-8 rounded-full bg-[var(--c-accent-text)]/10 border border-[var(--c-border2)] flex items-center justify-center text-xs font-bold text-[var(--c-accent-text)] shrink-0">
                  {profileName(m).charAt(0).toUpperCase()}
                </div>
                <p className="text-sm text-[var(--c-text)] flex-1 truncate">{profileName(m)}</p>
                <button
                  onClick={() => setupThread(m)}
                  disabled={setupStatus[m.id] === 'loading' || setupStatus[m.id] === 'done'}
                  className="text-[10px] tracking-widest uppercase font-mono text-[var(--c-accent-text)] hover:text-[var(--c-accent-text)]/70 transition disabled:opacity-40 shrink-0"
                >
                  {setupStatus[m.id] === 'loading' ? 'Setting up…'
                    : setupStatus[m.id] === 'done' ? 'Done!'
                    : setupStatus[m.id] === 'error' ? 'Error - retry'
                    : 'Setup Thread'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Invite member ── */}
      <div>
        <p className="text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono mb-3">Invite New Member</p>
        <form onSubmit={handleInvite} className="space-y-3">
          <input
            type="email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            placeholder="member@email.com"
            className="w-full bg-[var(--c-card)] border border-[var(--c-border)] rounded-lg px-4 py-3 text-[var(--c-text)] text-sm placeholder-[var(--c-text5)] focus:outline-none focus:border-[#b0e455]/60 transition"
          />
          <button
            type="submit"
            disabled={inviteStatus === 'loading' || !inviteEmail.trim()}
            className="w-full py-3 rounded-lg bg-[#b0e455] text-[#0f1a0c] text-xs tracking-widest uppercase font-mono font-semibold hover:bg-[#c9f070] transition disabled:opacity-50"
          >
            {inviteStatus === 'loading' ? 'Sending…' : 'Send Invite'}
          </button>
          {inviteMsg && (
            <p className={`text-xs font-medium ${inviteStatus === 'ok' ? 'text-[#15803d]' : 'text-[#dc2626]'}`}>{inviteMsg}</p>
          )}
        </form>
      </div>

      {/* ── Broadcast ── */}
      {threads.length > 0 && (
        <div>
          <p className="text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono mb-3">
            Broadcast to All Members ({threads.length})
          </p>
          <form onSubmit={handleBroadcast} className="space-y-3">
            <textarea
              value={broadcastBody}
              onChange={e => setBroadcastBody(e.target.value)}
              rows={3}
              placeholder="Send one message to every member's inbox…"
              className="w-full bg-[var(--c-card)] border border-[var(--c-border)] rounded-lg px-4 py-3 text-[var(--c-text)] text-sm placeholder-[var(--c-text5)] focus:outline-none focus:border-[#b0e455]/60 transition resize-none"
            />
            <button
              type="submit"
              disabled={broadcastStatus === 'loading' || !broadcastBody.trim()}
              className="w-full py-3 rounded-lg border border-[var(--c-accent-text)]/30 text-[var(--c-accent-text)] text-xs tracking-widest uppercase font-mono font-semibold hover:bg-[var(--c-accent-text)]/8 transition disabled:opacity-50"
            >
              {broadcastStatus === 'loading' ? 'Sending…' : broadcastStatus === 'done' ? 'Sent to All!' : 'Broadcast'}
            </button>
          </form>
        </div>
      )}

    </div>
  )
}

// ─── Instagram DM Inbox ───────────────────────────────────────────────────────

type IgConversation = {
  id: string
  ig_username: string | null
  display_name: string | null
  profile_pic_url: string | null
  last_message_body: string | null
  last_message_at: string | null
  status: string
  bucket: string
  unread: boolean
}

const BUCKET_META: Record<string, { label: string; color: string }> = {
  new:          { label: 'New',          color: '#94a3b8' },
  interviewing: { label: 'Interviewing', color: '#b0e455' },
  favorites:    { label: 'Favorites',    color: '#fbbf24' },
  not_ready:    { label: 'Not Ready',    color: '#fb923c' },
  declined:     { label: 'Declined',     color: '#f87171' },
}

type IgMessage = {
  id: string
  conversation_id: string
  direction: 'inbound' | 'outbound'
  body: string
  sent_at: string
  ai_suggested: boolean
}

const DROP_LINK_TEXT = `honestly ur the exact guy this works for\n\napply here https://zanafitness.com/apply, takes 3 mins. ill send you an email after to lock in a quick 15-min call where we map out the plan 🤝`

// Javi already sends the opener auto-reply asking "what's the #1 thing you're trying to change"
// So templates pick up from their response to that question
const TEMPLATES: { stage: string; text: string }[] = [
  { stage: 'Qualify', text: "how long have you been dealing with that?" },
  { stage: 'Qualify', text: "what have you tried so far?" },
  { stage: 'Qualify', text: "what's been the hardest part for you?" },
  { stage: 'Qualify', text: "are you training at all rn or starting from scratch?" },
  { stage: 'Qualify', text: "what does your routine look like right now?" },
  { stage: 'Validate', text: "yeah that makes a lot of sense bro, that's one of the most common things i hear" },
  { stage: 'Validate', text: "i get that, it's frustrating when you put in effort and nothing moves" },
  { stage: 'Confirm',  text: "yeah that's exactly what we help with, body recomp is literally our thing" },
  { stage: 'Confirm',  text: "sounds like you'd be a solid fit honestly" },
  { stage: 'Convert',  text: "want to hop on a quick 15 mins? i'll map out exactly what we'd do for you" },
  { stage: 'Convert',  text: "fill this out when you get a chance, takes 3 mins → zanafitness.com/apply" },
  { stage: 'Decline',  text: "hey i appreciate you sharing that with me. based on where you're at right now, i don't think we'd be the best fit — but that doesn't mean you can't get there. keep going and feel free to reach out down the road 🙏" },
  { stage: 'Decline',  text: "thanks for being open with me. i want to be honest — i think you'd benefit more from getting some foundations in place first before joining a structured program. the door's always open when you're ready 💪" },
]

function InboxTab({ userEmail: _userEmail }: { userId: string; userEmail: string }) {
  const supabase = createClient()
  const [convos, setConvos] = useState<IgConversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<IgMessage[]>([])
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [filterBucket, setFilterBucket] = useState('all')
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase
      .from('ig_conversations')
      .select('*')
      .order('last_message_at', { ascending: false })
      .then(({ data }) => { if (data) setConvos(data as IgConversation[]) })

    const ch = supabase
      .channel('ig_convos_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ig_conversations' }, () => {
        supabase
          .from('ig_conversations')
          .select('*')
          .order('last_message_at', { ascending: false })
          .then(({ data }) => { if (data) setConvos(data as IgConversation[]) })
      })
      .subscribe()

    return () => { supabase.removeChannel(ch) }
  }, [])

  useEffect(() => {
    if (!selectedId) return
    setLoadingMsgs(true)
    setMessages([])
    setShowTemplates(false)
    supabase
      .from('ig_messages')
      .select('*')
      .eq('conversation_id', selectedId)
      .order('sent_at', { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data as IgMessage[])
        setLoadingMsgs(false)
      })

    const ch = supabase
      .channel(`ig_msgs_${selectedId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'ig_messages',
        filter: `conversation_id=eq.${selectedId}`,
      }, payload => {
        setMessages(prev => [...prev, payload.new as IgMessage])
      })
      .subscribe()

    return () => { supabase.removeChannel(ch) }
  }, [selectedId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!selectedId || !reply.trim() || sending) return
    const text = reply.trim()
    const tempId = `temp-${Date.now()}`
    setSending(true)
    setReply('')
    setShowTemplates(false)
    // Show message instantly
    setMessages(prev => [...prev, { id: tempId, conversation_id: selectedId, direction: 'outbound', body: text, sent_at: new Date().toISOString(), ai_suggested: false }])
    setConvos(prev => prev.map(c => c.id === selectedId ? { ...c, bucket: c.bucket === 'new' ? 'interviewing' : c.bucket, last_message_body: text, last_message_at: new Date().toISOString(), unread: false } : c))
    setSending(false) // re-enable button immediately

    // Send in background
    fetch('/api/instagram/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId: selectedId, message: text }),
    }).then(async res => {
      const json = await res.json().catch(() => ({}))
      console.log('[send] result:', json)
      if (!res.ok) alert('Send failed: ' + JSON.stringify(json))
    }).catch(err => console.error('[send] error:', err.message))
  }

  async function markRead(id: string) {
    setConvos(prev => prev.map(c => c.id === id ? { ...c, unread: false } : c))
    await fetch('/api/instagram/mark-read', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId: id }),
    })
  }

  async function handleSetBucket(bucket: string) {
    if (!selectedId) return
    setConvos(prev => prev.map(c => c.id === selectedId ? { ...c, bucket } : c))
    await fetch('/api/instagram/set-bucket', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId: selectedId, bucket }),
    })
  }

  const sortedConvos = [...convos].sort((a, b) => {
    if (!a.last_message_at && !b.last_message_at) return 0
    if (!a.last_message_at) return 1
    if (!b.last_message_at) return -1
    return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
  })
  const filteredConvos = filterBucket === 'all'
    ? sortedConvos.filter(c => (c.bucket ?? 'new') !== 'declined')
    : sortedConvos.filter(c => (c.bucket ?? 'new') === filterBucket)
  const unreadCount = convos.filter(c => c.unread && (c.bucket ?? 'new') !== 'declined').length
  const selected = convos.find(c => c.id === selectedId)

  return (
    <div className="flex h-[calc(100vh-120px)] lg:h-[calc(100vh-100px)] -mx-5 lg:-mx-10">
      {/* Conversation list */}
      <div className={`w-full lg:w-72 shrink-0 border-r border-[var(--c-border)] flex flex-col overflow-hidden ${selectedId ? 'hidden lg:flex' : ''}`}>
        {/* Filter tabs */}
        <div className="flex gap-1.5 px-3 py-2.5 border-b border-[var(--c-border)] overflow-x-auto shrink-0 scrollbar-none">
          {(['all', 'new', 'interviewing', 'favorites', 'not_ready', 'declined'] as const).map(b => {
            const meta = b !== 'all' ? BUCKET_META[b] : null
            const isActive = filterBucket === b
            return (
              <button
                key={b}
                onClick={() => setFilterBucket(b)}
                className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all whitespace-nowrap"
                style={isActive
                  ? { backgroundColor: meta ? meta.color + '22' : '#b0e455' + '22', borderColor: meta ? meta.color : '#b0e455', color: meta ? meta.color : '#b0e455' }
                  : { borderColor: 'transparent', color: 'var(--c-text4)' }}
              >
                {b === 'all' ? (unreadCount > 0 ? `All · ${unreadCount}` : 'All') : meta!.label}
              </button>
            )
          })}
        </div>
        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConvos.length === 0 ? (
            <div className="p-6 text-center text-[var(--c-text4)] text-sm">{convos.length === 0 ? 'No DMs yet.' : 'None here.'}</div>
          ) : filteredConvos.map(c => (
            <button
              key={c.id}
              onClick={() => { setSelectedId(c.id); if (c.unread) markRead(c.id) }}
              className={`w-full text-left px-4 py-3.5 border-b border-[var(--c-border)] transition-colors ${
                selectedId === c.id ? 'bg-[var(--c-card)]' : 'hover:bg-[var(--c-card2)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-full bg-[var(--c-card2)] border border-[var(--c-border)] overflow-hidden flex items-center justify-center text-sm font-bold text-[var(--c-text3)]">
                    {c.profile_pic_url
                      ? <img src={c.profile_pic_url} alt="" className="w-full h-full object-cover" />
                      : (c.display_name ?? c.ig_username ?? '?').slice(0, 1).toUpperCase()}
                  </div>
                  {c.unread && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#b0e455] border-2 border-[var(--c-bg)]" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-1.5 min-w-0">
                    <p className={`text-sm truncate ${c.unread ? 'font-bold' : 'font-semibold'}`}>{c.display_name ?? c.ig_username ?? c.id}</p>
                    {c.ig_username && <p className="text-[10px] text-[var(--c-text5)] shrink-0">@{c.ig_username}</p>}
                  </div>
                  <p className="text-xs text-[var(--c-text4)] truncate mt-0.5">{c.last_message_body ?? ''}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {c.last_message_at && <span className="text-[10px] text-[var(--c-text5)]">{relTime(c.last_message_at)}</span>}
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: BUCKET_META[c.bucket ?? 'new']?.color ?? '#94a3b8' }} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Thread */}
      <div className={`flex-1 flex flex-col min-w-0 ${!selectedId ? 'hidden lg:flex' : ''}`}>
        {!selectedId ? (
          <div className="flex-1 flex items-center justify-center text-[var(--c-text4)] text-sm">Select a conversation</div>
        ) : (
          <>
            <div className="border-b border-[var(--c-border)] shrink-0">
              <div className="px-4 py-3 flex items-center gap-3">
                <button onClick={() => setSelectedId(null)} className="lg:hidden text-[var(--c-text4)] p-1 -ml-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                    <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div className="w-8 h-8 rounded-full bg-[var(--c-card2)] border border-[var(--c-border)] shrink-0 overflow-hidden flex items-center justify-center text-sm font-bold text-[var(--c-text3)]">
                  {selected?.profile_pic_url
                    ? <img src={selected.profile_pic_url} alt="" className="w-full h-full object-cover" />
                    : (selected?.display_name ?? selected?.ig_username ?? '?').slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{selected?.display_name ?? selected?.ig_username ?? selectedId}</p>
                  {selected?.ig_username && <p className="text-xs text-[var(--c-text4)]">@{selected.ig_username}</p>}
                </div>
              </div>
              {/* Bucket selector */}
              <div className="px-4 pb-2.5 flex gap-1.5 flex-wrap">
                {(['interviewing', 'favorites', 'not_ready', 'declined'] as const).map(b => {
                  const isActive = (selected?.bucket ?? 'new') === b
                  return (
                    <button
                      key={b}
                      onClick={() => handleSetBucket(b)}
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold border transition-all"
                      style={isActive
                        ? { backgroundColor: BUCKET_META[b].color + '22', borderColor: BUCKET_META[b].color, color: BUCKET_META[b].color }
                        : { borderColor: 'var(--c-border)', color: 'var(--c-text4)' }}
                    >
                      {BUCKET_META[b].label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
              {loadingMsgs ? (
                <div className="text-center text-[var(--c-text4)] text-sm py-8">Loading…</div>
              ) : messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-snug ${
                    msg.direction === 'outbound'
                      ? 'bg-[#b0e455] text-[#0f1a0c] rounded-br-sm'
                      : 'bg-[var(--c-card)] text-[var(--c-text)] rounded-bl-sm'
                  }`}>
                    <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                    <p className={`text-[10px] mt-1 ${msg.direction === 'outbound' ? 'text-[#0f1a0c]/50' : 'text-[var(--c-text5)]'}`}>
                      {relTime(msg.sent_at)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="px-4 py-3 border-t border-[var(--c-border)] space-y-2 shrink-0">
              {showTemplates && (
                <div className="border border-[var(--c-border)] rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                  {(['Qualify', 'Validate', 'Confirm', 'Convert', 'Decline'] as const).map(stage => {
                    const stageTpls = TEMPLATES.filter(t => t.stage === stage)
                    return (
                      <div key={stage}>
                        <p className="px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-[var(--c-text4)] bg-[var(--c-bg)] border-b border-[var(--c-border)]">{stage}</p>
                        {stageTpls.map((t, i) => (
                          <button
                            key={i}
                            onClick={() => { setReply(t.text); setShowTemplates(false) }}
                            className="w-full text-left px-3 py-2 text-xs text-[var(--c-text)] hover:bg-[var(--c-card2)] border-b border-[var(--c-border)] last:border-0 transition-colors leading-snug"
                          >
                            {t.text}
                          </button>
                        ))}
                      </div>
                    )
                  })}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowTemplates(p => !p)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${showTemplates ? 'border-[#b0e455]/60 text-[var(--c-accent-text)] bg-[#b0e455]/10' : 'border-[var(--c-border)] text-[var(--c-text3)] hover:text-[var(--c-text)] hover:bg-[var(--c-card)]'}`}
                >
                  ⚡ Templates
                </button>
                <button
                  onClick={() => setReply(DROP_LINK_TEXT)}
                  className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#b0e455]/40 text-[#b0e455] hover:bg-[#b0e455]/10 transition"
                >
                  Drop Link
                </button>
              </div>
              <div className="flex gap-2 items-end">
                <textarea
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend() }}
                  rows={3}
                  placeholder="Reply…"
                  className="flex-1 bg-[var(--c-card)] border border-[var(--c-border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--c-text)] placeholder-[var(--c-text5)] focus:outline-none focus:border-[#b0e455]/60 transition resize-none"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !reply.trim()}
                  className="shrink-0 px-4 py-2.5 rounded-xl bg-[#b0e455] text-[#0f1a0c] text-sm font-semibold hover:bg-[#c9f070] transition disabled:opacity-40"
                >
                  {sending ? '…' : 'Send'}
                </button>
              </div>
              <p className="text-[10px] text-[var(--c-text5)]">⌘↵ to send</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function CoachClient({ userId, userEmail, userRole, firstName, avatarColor, avatarUrl, members, allStats, threads, lastMessages, myReads, snoozeMap }: Props) {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<CoachTab>('home')
  const [programMemberId, setProgramMemberId] = useState<string | null>(null)
  const [snoozes, setSnoozes] = useState<Record<string, string>>(snoozeMap)
  const isHeadCoach = userRole === 'head_coach'

  function openMemberProgram(memberId: string) {
    setProgramMemberId(memberId)
    setActiveTab('programs')
  }

  function markAddressed(memberId: string) {
    const now = new Date().toISOString()
    setSnoozes(prev => ({ ...prev, [memberId]: now }))
    supabase.from('attention_snoozes').upsert({ coach_id: userId, member_id: memberId, snoozed_at: now })
  }

  function undoAddressed(memberId: string) {
    setSnoozes(prev => { const next = { ...prev }; delete next[memberId]; return next })
    supabase.from('attention_snoozes').delete().eq('coach_id', userId).eq('member_id', memberId)
  }

  const initialUnread = (() => {
    const readMap = Object.fromEntries(myReads.map(r => [r.thread_id, r.last_read_at]))
    return threads.filter(t => {
      const lastMsg = lastMessages.find(m => m.thread_id === t.id)
      if (!lastMsg || lastMsg.author_id === userId) return false
      const readAt = readMap[t.id]
      return !readAt || new Date(lastMsg.created_at) > new Date(readAt)
    }).length
  })()
  const [unreadCount, setUnreadCount] = useState(initialUnread)

  useEffect(() => {
    const threadIds = threads.map(t => t.id)
    if (!threadIds.length) return
    const channel = supabase.channel('coach-unread-badge')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new as { author_id: string; thread_id: string }
        if (threadIds.includes(msg.thread_id) && msg.author_id !== userId) {
          setUnreadCount(c => c + 1)
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, []) // eslint-disable-line

  useEffect(() => {
    if (activeTab === 'messages') setUnreadCount(0)
  }, [activeTab])

  const TAB_TITLES: Record<CoachTab, string> = {
    home: 'Home',
    members: 'Members',
    programs: 'Programs',
    messages: 'Messages',
    inbox: 'DM Inbox',
    applications: 'Applications',
    admin: 'Admin',
  }

  const initials = (firstName ?? userEmail.split('@')[0]).slice(0, 1).toUpperCase()

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] flex flex-col lg:pl-52">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-start justify-between lg:px-8 lg:pt-7 lg:pb-4 lg:border-b lg:border-[var(--c-border)]">
        <div>
          <p className="text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono">
            Zana · Coach Portal
          </p>
          <h1 className="text-xl font-semibold tracking-tight mt-0.5 lg:text-2xl">{TAB_TITLES[activeTab]}</h1>
        </div>
        <Link href="/profile" className="shrink-0 mt-1 lg:hidden">
          <div
            className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-bold overflow-hidden"
            style={{ borderColor: avatarColor + '50', backgroundColor: avatarColor + '18', color: avatarColor }}
          >
            {avatarUrl
              ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              : initials
            }
          </div>
        </Link>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-5 pb-28 lg:px-10 lg:pb-10 lg:pt-6">
        {activeTab === 'home' && (
          <HomeTab members={members} allStats={allStats} threads={threads} lastMessages={lastMessages} isHeadCoach={isHeadCoach} firstName={firstName} snoozes={snoozes} onMarkAddressed={markAddressed} onUndoAddressed={undoAddressed} />
        )}
        {activeTab === 'members' && (
          <MembersTab members={members} allStats={allStats} threads={threads} lastMessages={lastMessages} myReads={myReads} userId={userId} onOpenProgram={openMemberProgram} snoozes={snoozes} onMarkAddressed={markAddressed} onUndoAddressed={undoAddressed} />
        )}
        {activeTab === 'programs' && (
          <ProgramsTab members={members} userId={userId} initialMemberId={programMemberId} />
        )}
        {activeTab === 'messages' && (
          <MessagesTab
            userId={userId}
            members={members}
            threads={threads}
            lastMessages={lastMessages}
            myReads={myReads}
            coachName={firstName}
            coachAvatarUrl={avatarUrl}
            coachAvatarColor={avatarColor}
          />
        )}
{activeTab === 'applications' && isHeadCoach && userEmail === 'me@javilorenzana.com' && (
          <ApplicationsSection />
        )}
        {activeTab === 'admin' && isHeadCoach && userEmail === 'me@javilorenzana.com' && (
          <AdminTab userEmail={userEmail} />
        )}
      </div>

      <CoachNav
        active={activeTab}
        onChange={setActiveTab}
        isHeadCoach={isHeadCoach}
        firstName={firstName}
        avatarColor={avatarColor}
        avatarUrl={avatarUrl}
        userEmail={userEmail}
        unreadCount={unreadCount}
      />
    </div>
  )
}
