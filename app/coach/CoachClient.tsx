'use client'

import { useState, useEffect, useRef, FormEvent, KeyboardEvent } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { createClient } from '@/utils/supabase/client'

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false })

// ─── Types ────────────────────────────────────────────────────────────────────

type Member = { id: string; first_name: string | null; email: string; role: string; weight_unit: string | null }
type Stat = { id: string; member_id: string; weight_kg: number | null; confidence: number | null; created_at: string }
type Thread = { id: string; member_id: string }
type MsgPreview = { thread_id: string; body: string; created_at: string; author_id: string }
type ReadReceipt = { thread_id: string; last_read_at: string }
type ChatMessage = { id: string; author_id: string; body: string; created_at: string; message_attachments: { id: string; storage_path: string; kind: string }[] }
type CoachTab = 'home' | 'members' | 'programs' | 'messages' | 'admin'
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
  if (v <= 3) return '#f87171'
  if (v <= 5) return '#fbbf24'
  if (v <= 8) return '#86efac'
  return '#b0e455'
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
              <span className="text-[10px] text-[#edf5e2]/20 font-mono w-4 shrink-0 text-right">{idx + 1}</span>
              <input
                type="text"
                value={habit.text}
                onChange={e => updateHabit(habit.id, e.target.value)}
                className="flex-1 bg-[#162212] border border-[#b0e455]/12 rounded-lg px-3 py-2 text-sm text-[#edf5e2] focus:outline-none focus:border-[#b0e455]/40 transition"
              />
              <button onClick={() => removeHabit(habit.id)} className="text-[#edf5e2]/20 hover:text-[#f87171] transition shrink-0">
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
          className="flex-1 bg-[#162212] border border-[#b0e455]/12 rounded-lg px-3 py-2 text-sm text-[#edf5e2] placeholder-[#edf5e2]/20 focus:outline-none focus:border-[#b0e455]/40 transition"
        />
        <button
          onClick={addHabit}
          disabled={!newText.trim()}
          className="px-4 py-2 rounded-lg bg-[#1c2e16] border border-[#b0e455]/20 text-[10px] text-[#b0e455] font-mono uppercase tracking-widest hover:bg-[#233019] transition disabled:opacity-30 shrink-0"
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
          <p className="text-[10px] text-[#edf5e2]/30 font-mono uppercase tracking-widest mb-1.5">Gender</p>
          <div className="flex gap-2">
            {(['female', 'male'] as const).map(g => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`flex-1 py-2 rounded-lg text-xs font-mono capitalize transition ${
                  gender === g ? 'bg-[#b0e455] text-[#0f1a0c]' : 'bg-[#162212] border border-[#b0e455]/12 text-[#edf5e2]/50 hover:text-[#edf5e2]'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] text-[#edf5e2]/30 font-mono uppercase tracking-widest mb-1.5">Age</p>
          <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 28"
            className="w-full bg-[#162212] border border-[#b0e455]/12 rounded-lg px-3 py-2 text-sm text-[#edf5e2] placeholder-[#edf5e2]/20 focus:outline-none focus:border-[#b0e455]/40 transition" />
        </div>
        <div>
          <p className="text-[10px] text-[#edf5e2]/30 font-mono uppercase tracking-widest mb-1.5">Height (cm)</p>
          <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="e.g. 165"
            className="w-full bg-[#162212] border border-[#b0e455]/12 rounded-lg px-3 py-2 text-sm text-[#edf5e2] placeholder-[#edf5e2]/20 focus:outline-none focus:border-[#b0e455]/40 transition" />
        </div>
        <div>
          <p className="text-[10px] text-[#edf5e2]/30 font-mono uppercase tracking-widest mb-1.5">Weight (kg)</p>
          <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 65"
            className="w-full bg-[#162212] border border-[#b0e455]/12 rounded-lg px-3 py-2 text-sm text-[#edf5e2] placeholder-[#edf5e2]/20 focus:outline-none focus:border-[#b0e455]/40 transition" />
        </div>
      </div>

      <div>
        <p className="text-[10px] text-[#edf5e2]/30 font-mono uppercase tracking-widest mb-1.5">Activity Level</p>
        <select value={activity} onChange={e => setActivity(e.target.value)}
          className="w-full bg-[#162212] border border-[#b0e455]/12 rounded-lg px-3 py-2 text-sm text-[#edf5e2] focus:outline-none focus:border-[#b0e455]/40 transition">
          {ACTIVITY_LEVELS.map(a => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </select>
      </div>

      {valid && bmr && tdee && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#1c2e16] rounded-xl p-3 border border-[#b0e455]/8">
            <p className="text-[9px] text-[#edf5e2]/30 font-mono uppercase tracking-widest">BMR</p>
            <p className="text-lg font-bold text-[#edf5e2] mt-0.5">{bmr} <span className="text-xs text-[#edf5e2]/40">kcal</span></p>
          </div>
          <div className="bg-[#1c2e16] rounded-xl p-3 border border-[#b0e455]/8">
            <p className="text-[9px] text-[#edf5e2]/30 font-mono uppercase tracking-widest">TDEE</p>
            <p className="text-lg font-bold text-[#b0e455] mt-0.5">{tdee} <span className="text-xs text-[#edf5e2]/40">kcal</span></p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] text-[#edf5e2]/30 font-mono uppercase tracking-widest mb-1.5">Daily Calorie Target</p>
          <input type="number" value={calorieTarget} onChange={e => setCalorieTarget(e.target.value)} placeholder={tdee ? String(tdee) : 'kcal'}
            className="w-full bg-[#162212] border border-[#b0e455]/12 rounded-lg px-3 py-2 text-sm text-[#edf5e2] placeholder-[#edf5e2]/20 focus:outline-none focus:border-[#b0e455]/40 transition" />
        </div>
        <div>
          <p className="text-[10px] text-[#edf5e2]/30 font-mono uppercase tracking-widest mb-1.5">Protein Target (g)</p>
          <input type="number" value={protein} onChange={e => setProtein(e.target.value)} placeholder="e.g. 130"
            className="w-full bg-[#162212] border border-[#b0e455]/12 rounded-lg px-3 py-2 text-sm text-[#edf5e2] placeholder-[#edf5e2]/20 focus:outline-none focus:border-[#b0e455]/40 transition" />
        </div>
      </div>

      <div>
        <p className="text-[10px] text-[#edf5e2]/30 font-mono uppercase tracking-widest mb-1.5">Notes (optional)</p>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
          placeholder="Timing notes, meal quality guidance, exceptions…"
          className="w-full bg-[#162212] border border-[#b0e455]/12 rounded-lg px-3 py-2 text-sm text-[#edf5e2] placeholder-[#edf5e2]/20 focus:outline-none focus:border-[#b0e455]/40 transition resize-none" />
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

function CoachNav({ active, onChange, isHeadCoach, firstName, avatarColor, avatarUrl, userEmail }: {
  active: CoachTab
  onChange: (t: CoachTab) => void
  isHeadCoach: boolean
  firstName: string | null
  avatarColor: string
  avatarUrl: string | null
  userEmail: string
}) {
  const tabs: { id: CoachTab; label: string; icon: JSX.Element }[] = [
    { id: 'home', label: 'Home', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" /></svg> },
    { id: 'members', label: 'Members', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87" strokeLinecap="round" strokeLinejoin="round" /></svg> },
    { id: 'programs', label: 'Programs', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M9 12h6M9 16h6M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2M9 4a2 2 0 002 2h2a2 2 0 002-2M9 4a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" /></svg> },
    { id: 'messages', label: 'Messages', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z" strokeLinecap="round" strokeLinejoin="round" /></svg> },
    ...(isHeadCoach && userEmail === 'me@javilorenzana.com' ? [{ id: 'admin' as CoachTab, label: 'Admin', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" /></svg> }] : []),
  ]

  const communityIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87" strokeLinecap="round" strokeLinejoin="round" /></svg>

  const initials = (firstName ?? userEmail.split('@')[0]).slice(0, 1).toUpperCase()

  return (
    <>
      {/* ── Desktop sidebar ────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-52 flex-col bg-[#0b1509] border-r border-[#b0e455]/12 z-50">
        {/* Logo */}
        <div className="px-5 pt-6 pb-5 border-b border-[#b0e455]/8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#b0e455] flex items-center justify-center shrink-0">
              <svg viewBox="0 0 32 32" className="h-4 w-4" fill="none" stroke="#0b1509" strokeWidth="5.5" strokeMiterlimit="10">
                <path d="M0,2 H32 L18.3,14" />
                <path d="M13.7,18 L0,30 H32" />
              </svg>
            </div>
            <div>
              <p className="text-[#edf5e2] font-bold text-base tracking-tight leading-none">Zana</p>
              <p className="text-[9px] text-[#edf5e2]/30 tracking-widest uppercase leading-none mt-1">Coach Portal</p>
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
                  : 'text-[#edf5e2]/40 hover:text-[#edf5e2] hover:bg-[#162212]'
              }`}
            >
              {t.icon}
              <span className="text-sm font-semibold">{t.label}</span>
            </button>
          ))}
          <Link
            href="/community"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left text-[#edf5e2]/40 hover:text-[#edf5e2] hover:bg-[#162212]"
          >
            {communityIcon}
            <span className="text-sm font-semibold">Community</span>
          </Link>
        </nav>

        {/* Profile */}
        <div className="px-3 py-4 border-t border-[#b0e455]/8 space-y-0.5">
          <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#edf5e2]/40 hover:text-[#edf5e2] hover:bg-[#162212] transition-all">
            <div
              className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold overflow-hidden shrink-0"
              style={{ borderColor: avatarColor + '50', backgroundColor: avatarColor + '18', color: avatarColor }}
            >
              {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : initials}
            </div>
            <span className="text-sm font-semibold">Profile</span>
          </Link>
          <p className="text-[9px] text-[#edf5e2]/15 uppercase tracking-widest px-3 pt-2">© 2026 Zana</p>
        </div>
      </aside>

      {/* ── Mobile bottom bar ─────────────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0f1a0c]/95 backdrop-blur-md border-t border-[#b0e455]/8 flex z-50">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className="flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors"
          >
            <div className={`w-12 h-7 flex items-center justify-center rounded-full transition-all ${
              active === t.id ? 'bg-[#b0e455] text-[#0f1a0c]' : 'text-[#edf5e2]/25'
            }`}>
              {t.icon}
            </div>
            <span className={`text-[9px] uppercase font-medium ${
              active === t.id ? 'text-[#b0e455]' : 'text-[#edf5e2]/25'
            }`}>
              {t.label}
            </span>
          </button>
        ))}
        <Link href="/community" className="flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors">
          <div className="w-12 h-7 flex items-center justify-center rounded-full text-[#edf5e2]/25">
            {communityIcon}
          </div>
          <span className="text-[9px] uppercase font-medium text-[#edf5e2]/25">Community</span>
        </Link>
      </nav>
    </>
  )
}

// ─── Home tab ─────────────────────────────────────────────────────────────────

function HomeTab({ members, allStats, threads, lastMessages, isHeadCoach, firstName }: {
  members: Member[]
  allStats: Stat[]
  threads: Thread[]
  lastMessages: MsgPreview[]
  isHeadCoach: boolean
  firstName: string | null
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

  const needAttention = latestPerMember.filter(({ stat }) => {
    if (!stat) return true
    return Math.floor((Date.now() - new Date(stat.created_at).getTime()) / 86_400_000) > 7
  }).length

  const recentActivity = [...allStats]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  const memberMap = Object.fromEntries(members.map(m => [m.id, m]))

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div>
        <p className="text-[10px] text-[#edf5e2]/30 tracking-widest uppercase font-mono lg:hidden">Zana · Coach Portal</p>
        <h1 className="text-xl font-bold tracking-tight mt-0.5 lg:text-3xl">{greet}, {name}.</h1>
        <p className="text-xs text-[#edf5e2]/35 mt-1">
          {isHeadCoach ? 'Full access · Head coach' : 'Coach view'}
        </p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#1c2e16] rounded-xl p-3 text-center border border-[#b0e455]/8">
          <p className="text-2xl font-bold text-[#edf5e2]">{members.length}</p>
          <p className="text-[9px] text-[#edf5e2]/30 uppercase tracking-widest mt-0.5">Members</p>
        </div>
        <div className={`rounded-xl p-3 text-center border ${needAttention > 0 ? 'bg-[#2a1a1a] border-[#f87171]/20' : 'bg-[#1c2e16] border-[#b0e455]/8'}`}>
          <p className={`text-2xl font-bold ${needAttention > 0 ? 'text-[#f87171]' : 'text-[#edf5e2]/30'}`}>{needAttention}</p>
          <p className="text-[9px] text-[#edf5e2]/30 uppercase tracking-wider mt-0.5">Attention</p>
        </div>
        <div className="bg-[#1c2e16] rounded-xl p-3 text-center border border-[#b0e455]/8">
          <p className="text-2xl font-bold text-[#86efac]">{activeThisWeek}</p>
          <p className="text-[9px] text-[#edf5e2]/30 uppercase tracking-widest mt-0.5">Active</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#1a2630] border border-[#60a5fa]/10 rounded-xl p-4">
          <p className="text-[10px] text-[#60a5fa] uppercase tracking-wider font-mono mb-1">Programs</p>
          <p className="text-sm font-semibold text-[#edf5e2]">{members.length} member{members.length !== 1 ? 's' : ''}</p>
          <p className="text-[10px] text-[#edf5e2]/30 mt-0.5">Click Programs to edit</p>
        </div>
        <div className="bg-[#261a2a] border border-[#c084fc]/10 rounded-xl p-4">
          <p className="text-[10px] text-[#c084fc] uppercase tracking-wider font-mono mb-1">Messages</p>
          <p className="text-sm font-semibold text-[#edf5e2]">{threads.length} thread{threads.length !== 1 ? 's' : ''}</p>
          <p className="text-[10px] text-[#edf5e2]/30 mt-0.5">Click Messages to chat</p>
        </div>
      </div>

      {/* Recent check-ins */}
      {recentActivity.length > 0 && (
        <div>
          <p className="text-[10px] text-[#edf5e2]/30 tracking-widest uppercase font-mono mb-3">Recent Check-ins</p>
          <div className="space-y-2">
            {recentActivity.map(s => {
              const m = memberMap[s.member_id]
              if (!m) return null
              return (
                <div key={s.id} className="bg-[#1c2e16] rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#b0e455]/10 border border-[#b0e455]/20 flex items-center justify-center text-[10px] font-bold text-[#b0e455] shrink-0">
                    {memberName(m).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#edf5e2] truncate">{memberName(m)}</p>
                    <p className="text-[10px] text-[#edf5e2]/30 font-mono" suppressHydrationWarning>
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
          <p className="text-sm text-[#edf5e2]/20">No members assigned yet.</p>
          {isHeadCoach && <p className="text-xs text-[#edf5e2]/15 mt-1">Use Admin to invite and set up members.</p>}
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

const STATUS_DOT: Record<string, string> = {
  fresh: 'bg-[#86efac]',
  ok: 'bg-[#fbbf24]',
  overdue: 'bg-[#f87171]',
  none: 'bg-[#edf5e2]/15',
}

const STATUS_LABEL: Record<string, string> = {
  fresh: 'Active',
  ok: 'Due soon',
  overdue: 'Overdue',
  none: 'No data',
}

function MembersTab({ members, allStats, threads, lastMessages, onOpenProgram }: {
  members: Member[]
  allStats: Stat[]
  threads: Thread[]
  lastMessages: MsgPreview[]
  onOpenProgram: (memberId: string) => void
}) {
  const supabase = createClient()
  const [stats, setStats] = useState<Stat[]>(allStats)

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
  const lastMsgByMember: Record<string, MsgPreview> = {}
  for (const msg of lastMessages) {
    const mid = threadToMember[msg.thread_id]
    if (mid && !lastMsgByMember[mid]) lastMsgByMember[mid] = msg
  }

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
  const needAttention = latestPerMember.filter(({ stat }) => checkinStatus(stat) === 'overdue' || checkinStatus(stat) === 'none').length

  // Sort: overdue first, then ok, then fresh
  const sortedMembers = [...latestPerMember].sort((a, b) => {
    const order = { overdue: 0, none: 1, ok: 2, fresh: 3 }
    return order[checkinStatus(a.stat)] - order[checkinStatus(b.stat)]
  })

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-[#edf5e2]/20">No members assigned yet.</p>
        <p className="text-xs text-[#edf5e2]/15 mt-1">Use Admin to invite members.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#1c2e16] rounded-xl p-3 text-center border border-[#b0e455]/8">
          <p className="text-2xl font-bold text-[#edf5e2]">{totalMembers}</p>
          <p className="text-[9px] text-[#edf5e2]/30 uppercase tracking-widest mt-0.5">Total</p>
        </div>
        <div className={`rounded-xl p-3 text-center border ${needAttention > 0 ? 'bg-[#2a1a1a] border-[#f87171]/20' : 'bg-[#1c2e16] border-[#b0e455]/8'}`}>
          <p className={`text-2xl font-bold ${needAttention > 0 ? 'text-[#f87171]' : 'text-[#edf5e2]/30'}`}>{needAttention}</p>
          <p className="text-[9px] text-[#edf5e2]/30 uppercase tracking-widest mt-0.5">Attention</p>
        </div>
        <div className="bg-[#1c2e16] rounded-xl p-3 text-center border border-[#b0e455]/8">
          <p className="text-2xl font-bold text-[#86efac]">{activeThisWeek}</p>
          <p className="text-[9px] text-[#edf5e2]/30 uppercase tracking-widest mt-0.5">Active</p>
        </div>
      </div>

      {/* Roster */}
      <div>
        <p className="text-[10px] text-[#edf5e2]/30 tracking-widest uppercase font-mono mb-3">Roster</p>
        <div className="space-y-2">
          {sortedMembers.map(({ member, stat, lastMsg }) => {
            const status = checkinStatus(stat)
            return (
              <button
                key={member.id}
                onClick={() => onOpenProgram(member.id)}
                className="w-full bg-[#1c2e16] rounded-xl p-4 flex items-center gap-4 border border-transparent hover:border-[#b0e455]/10 transition-colors text-left"
              >
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-full bg-[#b0e455]/10 border border-[#b0e455]/20 flex items-center justify-center text-xs font-mono font-bold text-[#b0e455]">
                    {memberName(member).charAt(0).toUpperCase()}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#1c2e16] ${STATUS_DOT[status]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#edf5e2] truncate">{memberName(member)}</p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    {stat ? (
                      <p className="text-[10px] text-[#edf5e2]/30 font-mono" suppressHydrationWarning>
                        Check-in {relTime(stat.created_at)} ago
                        {stat.weight_kg != null ? ` · ${toDisplay(stat.weight_kg, member.weight_unit)}` : ''}
                        {stat.confidence != null ? <span style={{ color: confidenceColor(stat.confidence) }}> · {stat.confidence}/10</span> : null}
                      </p>
                    ) : (
                      <p className="text-[10px] text-[#edf5e2]/20 font-mono">No check-ins</p>
                    )}
                    {lastMsg && (
                      <p className="text-[10px] text-[#edf5e2]/20 font-mono" suppressHydrationWarning>Msg {relTime(lastMsg.created_at)} ago</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-full ${
                    status === 'fresh' ? 'text-[#86efac] bg-[#86efac]/10'
                    : status === 'ok' ? 'text-[#fbbf24] bg-[#fbbf24]/10'
                    : status === 'overdue' ? 'text-[#f87171] bg-[#f87171]/10'
                    : 'text-[#edf5e2]/20 bg-[#edf5e2]/5'
                  }`}>
                    {STATUS_LABEL[status]}
                  </span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-[#edf5e2]/20">
                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {recentStream.length > 0 && (
        <div>
          <p className="text-[10px] text-[#edf5e2]/30 tracking-widest uppercase font-mono mb-3">Recent updates</p>
          <div className="space-y-2">
            {recentStream.map(s => {
              const m = memberMap[s.member_id]
              if (!m) return null
              return (
                <div key={s.id} className="bg-[#1c2e16] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-[#edf5e2]">{memberName(m)}</p>
                    <p className="text-[10px] text-[#edf5e2]/25 font-mono" suppressHydrationWarning>{relTime(s.created_at)} ago</p>
                  </div>
                  <div className="flex gap-4">
                    {s.weight_kg != null && (
                      <div>
                        <p className="text-[9px] text-[#edf5e2]/30 font-mono uppercase tracking-widest">Weight</p>
                        <p className="text-sm font-semibold text-[#edf5e2]">{toDisplay(s.weight_kg, m.weight_unit)}</p>
                      </div>
                    )}
                    {s.confidence != null && (
                      <div>
                        <p className="text-[9px] text-[#edf5e2]/30 font-mono uppercase tracking-widest">Confidence</p>
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
    const { data } = await supabase
      .from('program_sections')
      .select('section, content_json')
      .eq('member_id', id)
    const map: Partial<Record<Section, object | null>> = {}
    for (const row of data ?? []) map[row.section as Section] = row.content_json
    setSections(map)
    setSectionLoadKey(k => k + 1)
  }

  async function saveSection() {
    if (!selectedId) return
    setSaving(true)
    await supabase.from('program_sections').upsert(
      { member_id: selectedId, section: activeSection, content_json: sections[activeSection] ?? {}, updated_by: userId },
      { onConflict: 'member_id,section' }
    )
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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

  if (!selectedId) {
    return (
      <div>
        <p className="text-[10px] text-[#edf5e2]/30 tracking-widest uppercase font-mono mb-3">Select a member to edit their program</p>
        <div className="space-y-2">
          {members.map(m => (
            <button
              key={m.id}
              onClick={() => selectMember(m.id)}
              className="w-full bg-[#1c2e16] rounded-xl p-4 flex items-center gap-3 hover:bg-[#233019] transition text-left"
            >
              <div className="w-8 h-8 rounded-full bg-[#b0e455]/10 border border-[#b0e455]/20 flex items-center justify-center text-xs font-mono font-bold text-[#b0e455] shrink-0">
                {memberName(m).charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#edf5e2]">{memberName(m)}</p>
                <p className="text-[10px] text-[#edf5e2]/30 font-mono">Split · Food · Habits</p>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-[#edf5e2]/20 ml-auto">
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
        <button onClick={() => setSelectedId(null)} className="text-[#edf5e2]/30 hover:text-[#edf5e2] transition">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p className="text-sm font-semibold text-[#edf5e2]">{memberName(selected!)}</p>
        {activeSection === 'split' && (
          <button
            onClick={saveSection}
            disabled={saving}
            className="ml-auto text-[10px] tracking-widest uppercase font-mono text-[#b0e455] hover:text-[#c9f070] transition disabled:opacity-50"
          >
            {saved ? 'Saved ✓' : saving ? 'Saving…' : 'Save'}
          </button>
        )}
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 border-b border-[#b0e455]/8 mb-4 overflow-x-auto">
        {SECTIONS.map(s => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className={`px-4 py-2.5 text-[11px] tracking-wide font-mono capitalize whitespace-nowrap transition border-b-2 -mb-px ${
              activeSection === s ? 'border-[#b0e455] text-[#b0e455]' : 'border-transparent text-[#edf5e2]/30 hover:text-[#edf5e2]/60'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {activeSection === 'food' ? (
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
      ) : (
        <RichTextEditor
          key={`${selectedId}-${activeSection}-${sectionLoadKey}`}
          content={sections[activeSection] ?? null}
          onChange={json => setSections(prev => ({ ...prev, [activeSection]: json }))}
        />
      )}
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
}: {
  userId: string
  members: Member[]
  threads: Thread[]
  lastMessages: MsgPreview[]
  myReads: ReadReceipt[]
}) {
  const supabase = createClient()
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [lastMsgState, setLastMsgState] = useState<MsgPreview[]>(lastMessages)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
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
    setLoadError(null)
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
          <p className="text-sm text-[#edf5e2]/20">No threads yet.</p>
          <p className="text-xs text-[#edf5e2]/15 mt-1">Use Admin to set up member threads.</p>
        </div>
      )
    }
    return (
      <div className="space-y-2">
        <p className="text-[10px] text-[#edf5e2]/30 tracking-widest uppercase font-mono mb-3">Inbox</p>
        {sortedThreads.map(thread => {
          const m = memberMap[thread.member_id]
          const last = lastMsgByThread[thread.id]
          const unread = isUnread(thread.id)
          return (
            <button
              key={thread.id}
              onClick={() => openThread(thread.id)}
              className="w-full bg-[#1c2e16] rounded-xl p-4 flex items-center gap-3 hover:bg-[#233019] transition text-left"
            >
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-full bg-[#b0e455]/10 border border-[#b0e455]/20 flex items-center justify-center text-xs font-mono font-bold text-[#b0e455]">
                  {m ? memberName(m).charAt(0).toUpperCase() : '?'}
                </div>
                {unread && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#b0e455] rounded-full border-2 border-[#0f1a0c]" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${unread ? 'font-semibold text-[#edf5e2]' : 'text-[#edf5e2]/70'}`}>
                  {m ? memberName(m) : 'Unknown'}
                </p>
                {last && (
                  <p className="text-[11px] text-[#edf5e2]/30 truncate mt-0.5">{last.body || '📎 Attachment'}</p>
                )}
              </div>
              {last && (
                <p className="text-[10px] text-[#edf5e2]/25 font-mono shrink-0" suppressHydrationWarning>{relTime(last.created_at)}</p>
              )}
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
        <button onClick={() => setSelectedThreadId(null)} className="text-[#edf5e2]/30 hover:text-[#edf5e2] transition shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p className="text-sm font-semibold text-[#edf5e2]">{chatMember ? memberName(chatMember) : 'Chat'}</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 pb-4" style={{ maxHeight: 'calc(100vh - 340px)' }}>
        {loadError && (
          <div className="bg-[#f87171]/10 border border-[#f87171]/25 rounded-xl px-4 py-3 text-xs text-[#f87171]">{loadError}</div>
        )}
        {!loadError && chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-[#edf5e2]/20">No messages yet.</p>
            <p className="text-xs text-[#edf5e2]/12 mt-1">Send the first message below.</p>
          </div>
        )}
        {chatMessages.map(msg => {
          const isMine = msg.author_id === userId
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                isMine ? 'bg-[#b0e455] text-[#0f1a0c] rounded-br-sm' : 'bg-[#1c2e16] text-[#edf5e2]/85 rounded-bl-sm'
              }`}>
                {msg.body}
              </div>
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

      <div className="flex items-end gap-2 pt-3 border-t border-[#b0e455]/8">
        <textarea
          ref={textareaRef}
          value={body}
          onChange={e => { setBody(e.target.value); setSendError(null); const ta = textareaRef.current; if (ta) { ta.style.height = 'auto'; ta.style.height = `${ta.scrollHeight}px` } }}
          onKeyDown={handleKeyDown}
          placeholder="Message…"
          rows={1}
          className="flex-1 bg-[#162212] border border-[#b0e455]/12 rounded-2xl px-4 py-2.5 text-sm text-[#edf5e2] placeholder-[#edf5e2]/20 resize-none focus:outline-none focus:border-[#b0e455]/40 transition max-h-28 overflow-y-auto leading-relaxed"
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
    return <div className="py-12 text-center text-xs text-[#edf5e2]/20 font-mono">Loading…</div>
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
              <div key={m.id} className="bg-[#221b0c] border border-[#fbbf24]/25 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#fbbf24]/12 border border-[#fbbf24]/25 flex items-center justify-center text-xs font-bold text-[#fbbf24] shrink-0">
                    {profileName(m).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#edf5e2]">{profileName(m)}</p>
                    <p className="text-[10px] text-[#edf5e2]/40 font-mono truncate">{m.email}</p>
                    <p className="text-[10px] text-[#fbbf24]/70 font-mono mt-0.5">Just joined — assign a coach &amp; set up messaging</p>
                  </div>
                  <button
                    onClick={() => setNewMembers(prev => prev.filter(x => x.id !== m.id))}
                    className="text-[#edf5e2]/20 hover:text-[#edf5e2]/60 transition shrink-0 mt-0.5"
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
                      className="flex-1 bg-[#162212] border border-[#fbbf24]/15 rounded-lg px-3 py-2 text-xs text-[#edf5e2] focus:outline-none focus:border-[#fbbf24]/40 transition"
                    >
                      <option value="">Assign coach…</option>
                      {coaches.map(c => (
                        <option key={c.id} value={c.id}>{profileName(c)}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleQuickAssign(m.id)}
                      disabled={!newMemberCoach[m.id]}
                      className="px-3 py-2 rounded-lg bg-[#fbbf24]/12 border border-[#fbbf24]/25 text-[10px] tracking-widest uppercase font-mono text-[#fbbf24] hover:bg-[#fbbf24]/22 transition disabled:opacity-40 shrink-0"
                    >
                      Assign
                    </button>
                  </div>
                )}
                {alreadyAssigned && (
                  <p className="text-[10px] text-[#86efac] font-mono">Coach assigned ✓</p>
                )}

                <button
                  onClick={() => setupThread(m)}
                  disabled={hasThread || setupStatus[m.id] === 'loading' || setupStatus[m.id] === 'done'}
                  className="w-full py-2 rounded-lg border border-[#b0e455]/20 text-[10px] tracking-widest uppercase font-mono text-[#b0e455] hover:bg-[#b0e455]/8 transition disabled:opacity-40"
                >
                  {hasThread || setupStatus[m.id] === 'done'
                    ? 'Messaging Active ✓'
                    : setupStatus[m.id] === 'loading' ? 'Setting up…'
                    : setupStatus[m.id] === 'error' ? 'Error — retry'
                    : 'Setup Messaging Thread'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Coaches ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] text-[#edf5e2]/30 tracking-widest uppercase font-mono">Coaches ({coaches.length})</p>
          <button onClick={() => loadData()} className="text-[10px] text-[#edf5e2]/20 hover:text-[#edf5e2]/50 font-mono transition">Refresh</button>
        </div>
        {coaches.length === 0 ? (
          <p className="text-xs text-[#edf5e2]/20 font-mono">No coaches found. Set role to coach or head_coach in Supabase.</p>
        ) : (
          <div className="space-y-2">
            {coaches.map(c => (
              <div key={c.id} className="bg-[#1c2e16] rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#b0e455]/15 border border-[#b0e455]/25 flex items-center justify-center text-xs font-bold text-[#b0e455] shrink-0">
                  {profileName(c).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#edf5e2]">{profileName(c)}</p>
                  <p className="text-[10px] text-[#edf5e2]/30 font-mono truncate">{c.email}</p>
                </div>
                <span className="text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 rounded border text-[#b0e455] border-[#b0e455]/25 bg-[#b0e455]/8">
                  {c.role === 'head_coach' ? 'Head Coach' : 'Coach'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Members ── */}
      <div>
        <p className="text-[10px] text-[#edf5e2]/30 tracking-widest uppercase font-mono mb-3">Members ({members.length})</p>
        {members.length === 0 ? (
          <p className="text-xs text-[#edf5e2]/20 font-mono">No members yet. Invite one below.</p>
        ) : (
          <div className="space-y-2">
            {members.map(m => {
              const coach = coachName(assignMap[m.id])
              const hasThread = threadMemberIds.has(m.id)
              return (
                <div key={m.id} className="bg-[#1c2e16] rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#edf5e2]/5 border border-[#edf5e2]/10 flex items-center justify-center text-xs font-bold text-[#edf5e2]/50 shrink-0">
                    {profileName(m).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#edf5e2]">{profileName(m)}</p>
                    <p className="text-[10px] text-[#edf5e2]/30 font-mono truncate">{m.email}</p>
                    <p className="text-[10px] text-[#edf5e2]/20 font-mono mt-0.5">
                      {coach ? `Coach: ${profileName(coach)}` : 'No coach assigned'}
                      {' · '}
                      {hasThread ? 'Messaging active' : 'No thread'}
                    </p>
                  </div>
                  <span className={`text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 rounded border ${
                    hasThread
                      ? 'text-[#86efac] border-[#86efac]/20 bg-[#86efac]/8'
                      : 'text-[#edf5e2]/20 border-[#edf5e2]/8'
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
          <p className="text-[10px] text-[#edf5e2]/30 tracking-widest uppercase font-mono mb-3">Assign Member to Coach</p>
          <form onSubmit={handleAssign} className="space-y-2">
            <select
              value={assignMemberId}
              onChange={e => setAssignMemberId(e.target.value)}
              className="w-full bg-[#162212] border border-[#b0e455]/12 rounded-lg px-4 py-3 text-sm text-[#edf5e2] focus:outline-none focus:border-[#b0e455]/50 transition"
            >
              <option value="">Select member…</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{profileName(m)} ({m.email})</option>
              ))}
            </select>
            <select
              value={assignCoachId}
              onChange={e => setAssignCoachId(e.target.value)}
              className="w-full bg-[#162212] border border-[#b0e455]/12 rounded-lg px-4 py-3 text-sm text-[#edf5e2] focus:outline-none focus:border-[#b0e455]/50 transition"
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
          <p className="text-[10px] text-[#edf5e2]/30 tracking-widest uppercase font-mono mb-3">Setup Messaging Thread</p>
          <div className="space-y-2">
            {membersWithoutThread.map(m => (
              <div key={m.id} className="bg-[#1c2e16] rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#edf5e2]/5 border border-[#edf5e2]/10 flex items-center justify-center text-xs font-bold text-[#edf5e2]/50 shrink-0">
                  {profileName(m).charAt(0).toUpperCase()}
                </div>
                <p className="text-sm text-[#edf5e2] flex-1 truncate">{profileName(m)}</p>
                <button
                  onClick={() => setupThread(m)}
                  disabled={setupStatus[m.id] === 'loading' || setupStatus[m.id] === 'done'}
                  className="text-[10px] tracking-widest uppercase font-mono text-[#b0e455] hover:text-[#c9f070] transition disabled:opacity-40 shrink-0"
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
        <p className="text-[10px] text-[#edf5e2]/30 tracking-widest uppercase font-mono mb-3">Invite New Member</p>
        <form onSubmit={handleInvite} className="space-y-3">
          <input
            type="email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            placeholder="member@email.com"
            className="w-full bg-[#162212] border border-[#b0e455]/12 rounded-lg px-4 py-3 text-[#edf5e2] text-sm placeholder-[#edf5e2]/20 focus:outline-none focus:border-[#b0e455]/60 transition"
          />
          <button
            type="submit"
            disabled={inviteStatus === 'loading' || !inviteEmail.trim()}
            className="w-full py-3 rounded-lg bg-[#b0e455] text-[#0f1a0c] text-xs tracking-widest uppercase font-mono font-semibold hover:bg-[#c9f070] transition disabled:opacity-50"
          >
            {inviteStatus === 'loading' ? 'Sending…' : 'Send Invite'}
          </button>
          {inviteMsg && (
            <p className={`text-xs font-mono ${inviteStatus === 'ok' ? 'text-[#86efac]' : 'text-[#f87171]'}`}>{inviteMsg}</p>
          )}
        </form>
      </div>

      {/* ── Broadcast ── */}
      {threads.length > 0 && (
        <div>
          <p className="text-[10px] text-[#edf5e2]/30 tracking-widest uppercase font-mono mb-3">
            Broadcast to All Members ({threads.length})
          </p>
          <form onSubmit={handleBroadcast} className="space-y-3">
            <textarea
              value={broadcastBody}
              onChange={e => setBroadcastBody(e.target.value)}
              rows={3}
              placeholder="Send one message to every member's inbox…"
              className="w-full bg-[#162212] border border-[#b0e455]/12 rounded-lg px-4 py-3 text-[#edf5e2] text-sm placeholder-[#edf5e2]/20 focus:outline-none focus:border-[#b0e455]/60 transition resize-none"
            />
            <button
              type="submit"
              disabled={broadcastStatus === 'loading' || !broadcastBody.trim()}
              className="w-full py-3 rounded-lg border border-[#b0e455]/30 text-[#b0e455] text-xs tracking-widest uppercase font-mono font-semibold hover:bg-[#b0e455]/8 transition disabled:opacity-50"
            >
              {broadcastStatus === 'loading' ? 'Sending…' : broadcastStatus === 'done' ? 'Sent to All!' : 'Broadcast'}
            </button>
          </form>
        </div>
      )}

    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function CoachClient({ userId, userEmail, userRole, firstName, avatarColor, avatarUrl, members, allStats, threads, lastMessages, myReads }: Props) {
  const [activeTab, setActiveTab] = useState<CoachTab>('home')
  const [programMemberId, setProgramMemberId] = useState<string | null>(null)
  const isHeadCoach = userRole === 'head_coach'

  function openMemberProgram(memberId: string) {
    setProgramMemberId(memberId)
    setActiveTab('programs')
  }

  const TAB_TITLES: Record<CoachTab, string> = {
    home: 'Home',
    members: 'Members',
    programs: 'Programs',
    messages: 'Messages',
    admin: 'Admin',
  }

  const initials = (firstName ?? userEmail.split('@')[0]).slice(0, 1).toUpperCase()

  return (
    <div className="min-h-screen bg-[#0f1a0c] text-[#edf5e2] flex flex-col lg:pl-52">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-start justify-between lg:px-8 lg:pt-7 lg:pb-4 lg:border-b lg:border-[#b0e455]/8">
        <div>
          <p className="text-[10px] text-[#edf5e2]/30 tracking-widest uppercase font-mono">
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
          <HomeTab members={members} allStats={allStats} threads={threads} lastMessages={lastMessages} isHeadCoach={isHeadCoach} firstName={firstName} />
        )}
        {activeTab === 'members' && (
          <MembersTab members={members} allStats={allStats} threads={threads} lastMessages={lastMessages} onOpenProgram={openMemberProgram} />
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
          />
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
      />
    </div>
  )
}
