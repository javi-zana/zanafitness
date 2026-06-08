'use client'

import { useState, useEffect, useRef, useCallback, FormEvent, KeyboardEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { SplitBuilder, StructuredSplit } from '@/components/SplitBuilder'
import { useTheme } from '@/app/providers'

// ─── Types ────────────────────────────────────────────────────────────────────

type Member = {
  id: string; first_name: string | null; email: string; role: string;
  weight_unit: string | null; avatar_url: string | null; avatar_color: string | null;
  // Intake / onboarding (all optional — null until member finishes onboarding)
  gender?: string | null; age?: number | null; height_cm?: number | null;
  location?: string | null; occupation?: string | null; work_schedule?: string | null;
  starting_weight_kg?: number | null; starting_body_fat_pct?: number | null;
  waist_cm?: number | null; chest_cm?: number | null; hips_cm?: number | null;
  mirror_goal?: string | null; target_date?: string | null;
  why_motivation?: string | null; success_vision?: string | null;
  training_years?: string | null; training_frequency_per_week?: number | null;
  training_current_state?: string | null; training_access?: string | null;
  training_equipment?: string | null; training_injuries?: string | null;
  diet_typical_day?: string | null; diet_meals_per_day?: number | null;
  diet_who_cooks?: string | null; diet_restrictions?: string | null;
  diet_dislikes?: string | null; diet_alcohol_frequency?: string | null;
  diet_supplements?: string | null; diet_eating_out_frequency?: string | null;
  lifestyle_sleep_hours?: number | null; lifestyle_sleep_quality?: string | null;
  lifestyle_stress_level?: number | null; lifestyle_travel_frequency?: string | null;
  lifestyle_energy_level?: string | null;
  intake_notes?: string | null;
  onboarded_at?: string | null;
}
export type MemberWithIntake = Member
type Stat = { id: string; member_id: string; weight_kg: number | null; confidence: number | null; created_at: string }
type CoachTab = 'home' | 'members' | 'programs' | 'inbox' | 'applications' | 'admin' | 'more'
type Section = 'split' | 'food' | 'notes'

type CoachNote = {
  id: string
  author_id: string
  author_name: string
  body: string
  created_at: string
  updated_at: string
}

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

type OkrData = {
  type: 'okr'
  objective: string
  key_results: [string, string, string]
}

type Props = {
  userId: string
  userEmail: string
  userRole: string
  firstName: string | null
  avatarColor: string
  avatarUrl: string | null
  members: Member[]
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

// ─── OKR section (coach Programs > pinned above tabs) ────────────────────────

function OkrSection({ initial, onSave, saving, saved }: {
  initial: OkrData | null
  onSave: (data: OkrData) => void
  saving: boolean
  saved: boolean
}) {
  const [objective, setObjective] = useState(initial?.objective ?? '')
  const [krs, setKrs] = useState<[string, string, string]>([
    initial?.key_results?.[0] ?? '',
    initial?.key_results?.[1] ?? '',
    initial?.key_results?.[2] ?? '',
  ])

  const dirty =
    objective !== (initial?.objective ?? '') ||
    krs[0] !== (initial?.key_results?.[0] ?? '') ||
    krs[1] !== (initial?.key_results?.[1] ?? '') ||
    krs[2] !== (initial?.key_results?.[2] ?? '')

  function updateKr(i: 0 | 1 | 2, v: string) {
    setKrs(prev => {
      const next: [string, string, string] = [prev[0], prev[1], prev[2]]
      next[i] = v
      return next
    })
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--c-border2)] bg-gradient-to-br from-[var(--c-card)] to-[var(--c-card2)] p-4 lg:p-5 mb-5 space-y-3 shadow-sm">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#b0e455]/40 to-transparent" />
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-[var(--c-accent-text)] font-mono uppercase tracking-[0.2em]">Objective &amp; Key Results</p>
        <p className="text-[9px] text-[var(--c-text5)] font-mono uppercase tracking-widest">Member sees this at top</p>
      </div>

      <div className="space-y-1.5">
        <label className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-widest">Objective</label>
        <input
          type="text"
          value={objective}
          onChange={e => setObjective(e.target.value)}
          placeholder="e.g. Cut to 12% by July without losing strength"
          className="w-full bg-[var(--c-bg)] border border-[var(--c-border2)] rounded-lg px-3 py-2.5 text-sm text-[var(--c-text)] placeholder-[var(--c-text5)] focus:outline-none focus:border-[#b0e455]/40 transition"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-widest">Key Results</label>
        {([0, 1, 2] as const).map(i => (
          <div key={i} className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-[var(--c-accent-text)] w-6 shrink-0 text-right tabular-nums">0{i + 1}</span>
            <input
              type="text"
              value={krs[i]}
              onChange={e => updateKr(i, e.target.value)}
              placeholder={`Key result ${i + 1}`}
              className="flex-1 bg-[var(--c-bg)] border border-[var(--c-border2)] rounded-lg px-3 py-2 text-sm text-[var(--c-text)] placeholder-[var(--c-text5)] focus:outline-none focus:border-[#b0e455]/40 transition"
            />
          </div>
        ))}
      </div>

      <button
        onClick={() => onSave({ type: 'okr', objective: objective.trim(), key_results: [krs[0].trim(), krs[1].trim(), krs[2].trim()] })}
        disabled={saving || !dirty}
        className="w-full py-2.5 rounded-lg bg-[#b0e455] text-[#0f1a0c] text-xs tracking-widest uppercase font-mono font-semibold hover:bg-[#c9f070] transition disabled:opacity-40"
      >
        {saved ? 'Saved ✓' : saving ? 'Saving…' : 'Save OKR'}
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

function CoachNav({ active, onChange, isHeadCoach, firstName, avatarColor, avatarUrl, userEmail }: {
  active: CoachTab
  onChange: (t: CoachTab) => void
  isHeadCoach: boolean
  firstName: string | null
  avatarColor: string
  avatarUrl: string | null
  userEmail: string
}) {
  const { theme, toggleTheme } = useTheme()
  const tabs: { id: CoachTab; label: string; icon: JSX.Element }[] = [
    { id: 'home', label: 'Home', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" /></svg> },
    { id: 'members', label: 'Members', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87" strokeLinecap="round" strokeLinejoin="round" /></svg> },
    { id: 'programs', label: 'Programs', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M9 12h6M9 16h6M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2M9 4a2 2 0 002 2h2a2 2 0 002-2M9 4a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" /></svg> },
  ]

  const moreIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></svg>
  const showAdmin = isHeadCoach && userEmail === 'me@javilorenzana.com'
  // 'More' visually highlights when viewing any of its hidden sub-tabs
  const moreActive = active === 'more' || active === 'applications' || active === 'admin'

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
              </span>
              <span className="text-sm font-semibold">{t.label}</span>
            </button>
          ))}
          {showAdmin && (
            <button
              onClick={() => onChange('more')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                moreActive
                  ? 'bg-[#b0e455] text-[#0b1509]'
                  : 'text-[var(--c-text3)] hover:text-[var(--c-text)] hover:bg-[var(--c-card)]'
              }`}
            >
              {moreIcon}
              <span className="text-sm font-semibold">More</span>
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
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all w-full text-[var(--c-text3)] hover:text-[var(--c-text)] hover:bg-[var(--c-card)]"
          >
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 shrink-0">
                <circle cx="12" cy="12" r="5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 shrink-0">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            <span className="text-sm font-semibold">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
          </button>
          <p className="text-[9px] text-[var(--c-text5)] uppercase tracking-widest px-3 pt-2">© 2026 Zana</p>
        </div>
      </aside>

      {/* ── Mobile bottom bar ─────────────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--c-backdrop)] backdrop-blur-md border-t border-[var(--c-border)] flex z-50">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className="flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors"
          >
            <div className={`relative w-10 h-7 flex items-center justify-center rounded-full transition-all ${
              active === t.id ? 'bg-[#b0e455] text-[#0f1a0c]' : 'text-[var(--c-text4)]'
            }`}>
              {t.icon}
            </div>
            <span className={`text-[9px] uppercase font-medium ${
              active === t.id ? 'text-[var(--c-accent-text)]' : 'text-[var(--c-text4)]'
            }`}>
              {t.label}
            </span>
          </button>
        ))}
        {showAdmin && (
          <button
            onClick={() => onChange('more')}
            className="flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors"
          >
            <div className={`w-10 h-7 flex items-center justify-center rounded-full transition-all ${
              moreActive ? 'bg-[#b0e455] text-[#0f1a0c]' : 'text-[var(--c-text4)]'
            }`}>
              {moreIcon}
            </div>
            <span className={`text-[9px] uppercase font-medium ${
              moreActive ? 'text-[var(--c-accent-text)]' : 'text-[var(--c-text4)]'
            }`}>More</span>
          </button>
        )}
      </nav>
    </>
  )
}

// ─── Home tab ─────────────────────────────────────────────────────────────────

function HomeTab({ members, allStats, isHeadCoach, firstName, snoozes, onMarkAddressed, onUndoAddressed }: {
  members: Member[]
  allStats: Stat[]
  userId: string
  isHeadCoach: boolean
  firstName: string | null
  snoozes: Record<string, string>
  onMarkAddressed: (memberId: string) => void
  onUndoAddressed: (memberId: string) => void
}) {
  const name = firstName ?? 'Coach'
  const h = new Date().getHours()
  const greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'

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

  const attentionMembers = latestPerMember.filter(({ member, stat }) =>
    needsAttention(stat, snoozes[member.id]) || snoozes[member.id]
  )

  // Empty state — no members yet
  if (members.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 lg:py-20 space-y-6 text-center">
        <h1 className="font-display leading-none text-4xl lg:text-5xl">
          {greet}, {name}.
        </h1>
        <p className="text-sm text-[var(--c-text3)] max-w-md mx-auto leading-relaxed">
          {isHeadCoach
            ? 'No clients yet. Head to Admin to onboard your first member — once they post, this is where you\'ll watch them work.'
            : 'No clients assigned yet. Once you have members, their activity will live here.'}
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Greeting */}
      <div className="space-y-1">
        <p className="text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono" suppressHydrationWarning>{greet}</p>
        <h1 className="font-display leading-none text-3xl lg:text-4xl">{name}.</h1>
        <p className="text-sm text-[var(--c-text3)] mt-2">
          {members.length} {members.length === 1 ? 'client' : 'clients'}
          {' · '}
          <span className={needAttention > 0 ? 'text-[#f87171] font-semibold' : ''}>
            {needAttention} need{needAttention === 1 ? 's' : ''} attention
          </span>
          {' · '}
          {activeThisWeek} active this week
        </p>
      </div>

      {/* Needs Attention — only render if there's something */}
      {attentionMembers.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono">Needs Attention</p>
          {attentionMembers.map(({ member, stat }) => {
            const attn = needsAttention(stat, snoozes[member.id])
            const snoozed = !!snoozes[member.id]
            const daysQuiet = stat ? Math.floor((Date.now() - new Date(stat.created_at).getTime()) / 86_400_000) : null
            const lowConf = stat?.confidence != null && stat.confidence <= 3
            return (
              <div key={member.id} className={`flex items-center gap-3 rounded-2xl px-4 py-3 border ${attn ? 'bg-[#f87171]/8 border-[#f87171]/30' : 'bg-[var(--c-card)] border-[var(--c-border)]'}`}>
                <div className="w-8 h-8 rounded-full overflow-hidden bg-[var(--c-accent-text)]/10 border border-[var(--c-border2)] flex items-center justify-center text-[11px] font-bold text-[var(--c-accent-text)] shrink-0">
                  {member.avatar_url ? <img src={member.avatar_url} alt="" className="w-full h-full object-cover" /> : memberName(member).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--c-text)] truncate">{memberName(member)}</p>
                  <p className={`text-[11px] ${attn ? 'text-[#f87171]' : 'text-[var(--c-text4)]'}`}>
                    {attn
                      ? (daysQuiet !== null
                          ? `${daysQuiet}d quiet${lowConf ? ` · ${stat?.confidence}/10 confidence` : ''}`
                          : 'No posts yet')
                      : 'Addressed'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {attn ? (
                    <button
                      onClick={() => onMarkAddressed(member.id)}
                      className="text-[10px] font-mono tracking-widest uppercase text-[var(--c-text4)] border border-[var(--c-border2)] rounded-lg px-3 py-1.5 hover:bg-[var(--c-hover)] transition active:scale-95"
                    >
                      Done
                    </button>
                  ) : snoozed ? (
                    <button
                      onClick={() => onUndoAddressed(member.id)}
                      className="text-[10px] font-mono tracking-widest uppercase text-[var(--c-text4)] border border-[var(--c-border2)] rounded-lg px-3 py-1.5 hover:bg-[var(--c-hover)] transition active:scale-95"
                    >
                      Undo
                    </button>
                  ) : null}
                </div>
              </div>
            )
          })}
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

function computeExerciseProgression(logs: WorkoutLog[]): { move: string; sessions: { date: string; kg: number | null }[] }[] {
  const map = new Map<string, { move: string; sessions: { date: string; kg: number | null }[] }>()
  for (const log of [...logs].reverse()) {
    for (const ex of parseExercises(log.notes)) {
      if (!ex.move?.trim()) continue
      const key = ex.move.trim().toLowerCase()
      if (!map.has(key)) map.set(key, { move: ex.move.trim(), sessions: [] })
      map.get(key)!.sessions.push({ date: log.logged_date, kg: ex.kg ? parseFloat(ex.kg) : null })
    }
  }
  return Array.from(map.values())
    .filter(e => e.sessions.length >= 2)
    .sort((a, b) => b.sessions.length - a.sessions.length)
    .slice(0, 6)
}

// ─── Intake card (member onboarding data shown to coach) ─────────────────────

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value == null || value === '') return null
  return (
    <div className="space-y-1">
      <p className="text-[9px] uppercase tracking-widest font-mono text-[var(--c-text5)]">{label}</p>
      <p className="text-sm text-[var(--c-text)] whitespace-pre-wrap break-words">{value}</p>
    </div>
  )
}

function IntakeCard({ member }: { member: Member }) {
  const [open, setOpen] = useState(false)

  const hasAny = !!(
    member.gender || member.age || member.height_cm || member.location || member.occupation || member.work_schedule ||
    member.starting_weight_kg || member.starting_body_fat_pct || member.waist_cm || member.chest_cm || member.hips_cm ||
    member.mirror_goal || member.target_date || member.why_motivation || member.success_vision ||
    member.training_years || member.training_frequency_per_week || member.training_current_state ||
    member.training_access || member.training_equipment || member.training_injuries ||
    member.diet_typical_day || member.diet_meals_per_day || member.diet_who_cooks ||
    member.diet_restrictions || member.diet_dislikes || member.diet_alcohol_frequency ||
    member.diet_supplements || member.diet_eating_out_frequency ||
    member.lifestyle_sleep_hours || member.lifestyle_sleep_quality || member.lifestyle_stress_level ||
    member.lifestyle_travel_frequency || member.lifestyle_energy_level || member.intake_notes
  )

  if (!hasAny) {
    return (
      <div className="bg-[var(--c-card)] shadow-sm rounded-2xl p-4 border border-[var(--c-border)]">
        <div className="flex items-center justify-between">
          <p className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-widest">Intake</p>
          <p className="text-[10px] text-[var(--c-text5)]">Not completed</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[var(--c-card)] shadow-sm rounded-2xl border border-[var(--c-border)]">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 hover:bg-[var(--c-hover)] rounded-2xl transition"
      >
        <div className="flex items-center gap-2">
          <p className="text-[9px] text-[var(--c-text4)] font-mono uppercase tracking-widest">Intake</p>
          {member.onboarded_at && (
            <p className="text-[10px] text-[var(--c-text5)]">
              · completed {new Date(member.onboarded_at).toLocaleDateString()}
            </p>
          )}
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`w-4 h-4 text-[var(--c-text4)] transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-5 space-y-5">
          {/* Basics */}
          <div className="space-y-3">
            <p className="text-[10px] text-[var(--c-accent-text)] font-mono uppercase tracking-widest">Basics</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <Field label="Gender" value={member.gender} />
              <Field label="Age" value={member.age} />
              <Field label="Height" value={member.height_cm ? `${member.height_cm} cm` : null} />
              <Field label="Location" value={member.location} />
              <Field label="Occupation" value={member.occupation} />
            </div>
            <Field label="Work schedule" value={member.work_schedule} />
          </div>

          {/* Starting metrics */}
          <div className="space-y-3 pt-3 border-t border-[var(--c-border)]">
            <p className="text-[10px] text-[var(--c-accent-text)] font-mono uppercase tracking-widest">Starting Metrics</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <Field label="Starting weight" value={member.starting_weight_kg ? `${member.starting_weight_kg} kg` : null} />
              <Field label="Body fat (est)" value={member.starting_body_fat_pct ? `${member.starting_body_fat_pct}%` : null} />
            </div>
          </div>

          {/* Goal */}
          <div className="space-y-3 pt-3 border-t border-[var(--c-border)]">
            <p className="text-[10px] text-[var(--c-accent-text)] font-mono uppercase tracking-widest">Goal</p>
            <Field label="Mirror goal" value={member.mirror_goal} />
            <Field label="Target date" value={member.target_date ? new Date(member.target_date).toLocaleDateString() : null} />
          </div>

          {/* Training */}
          <div className="space-y-3 pt-3 border-t border-[var(--c-border)]">
            <p className="text-[10px] text-[var(--c-accent-text)] font-mono uppercase tracking-widest">Training</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <Field label="Years training" value={member.training_years} />
              <Field label="Sessions / week" value={member.training_frequency_per_week} />
            </div>
            <Field label="Access" value={member.training_access} />
            <Field label="Current state" value={member.training_current_state} />
            <Field label="Equipment" value={member.training_equipment} />
            <Field label="Injuries / limitations" value={member.training_injuries} />
          </div>

          {/* Diet */}
          <div className="space-y-3 pt-3 border-t border-[var(--c-border)]">
            <p className="text-[10px] text-[var(--c-accent-text)] font-mono uppercase tracking-widest">Diet</p>
            <Field label="Typical day" value={member.diet_typical_day} />
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <Field label="Meals / day" value={member.diet_meals_per_day} />
              <Field label="Who cooks" value={member.diet_who_cooks} />
              <Field label="Alcohol" value={member.diet_alcohol_frequency} />
              <Field label="Eating out" value={member.diet_eating_out_frequency} />
            </div>
            <Field label="Restrictions" value={member.diet_restrictions} />
            <Field label="Dislikes" value={member.diet_dislikes} />
            <Field label="Supplements" value={member.diet_supplements} />
          </div>

          {/* Lifestyle */}
          <div className="space-y-3 pt-3 border-t border-[var(--c-border)]">
            <p className="text-[10px] text-[var(--c-accent-text)] font-mono uppercase tracking-widest">Lifestyle</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <Field label="Sleep" value={member.lifestyle_sleep_hours ? `${member.lifestyle_sleep_hours} hrs` : null} />
              <Field label="Stress" value={member.lifestyle_stress_level ? `${member.lifestyle_stress_level} / 10` : null} />
              <Field label="Sleep quality" value={member.lifestyle_sleep_quality} />
              <Field label="Travel" value={member.lifestyle_travel_frequency} />
            </div>
            <Field label="Daytime energy" value={member.lifestyle_energy_level} />
          </div>

          {/* Notes */}
          {member.intake_notes && (
            <div className="space-y-3 pt-3 border-t border-[var(--c-border)]">
              <p className="text-[10px] text-[var(--c-accent-text)] font-mono uppercase tracking-widest">Notes</p>
              <Field label="From the member" value={member.intake_notes} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function MemberDetailPanel({ member, stat, snoozedAt, onOpenProgram, onClose, onMarkAddressed, onUndoAddressed, onDeleted, canDelete }: {
  member: Member
  stat: Stat | null
  snoozedAt: string | null
  onOpenProgram: (id: string) => void
  onClose: () => void
  onMarkAddressed: () => void
  onUndoAddressed: () => void
  onDeleted: () => void
  canDelete: boolean
}) {
  const supabase = createClient()
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteState, setDeleteState] = useState<'idle' | 'confirm' | 'deleting' | 'error'>('idle')
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    supabase
      .from('progress_photos')
      .select('id, photo_url, photo_type, taken_at, created_at')
      .eq('member_id', member.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setProgressPhotos((data ?? []) as ProgressPhoto[])
        setLoading(false)
      })
  }, [member.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const beforePhoto = progressPhotos.find(p => p.photo_type === 'before') ?? null
  const weeklyPhotos = progressPhotos.filter(p => p.photo_type === 'weekly')
  const latestWeekly = weeklyPhotos[weeklyPhotos.length - 1] ?? null

  // Quick stats
  const daysIntoProgram = member.onboarded_at
    ? Math.floor((Date.now() - new Date(member.onboarded_at).getTime()) / 86_400_000)
    : null
  const memberDisplayName = member.first_name ?? member.email.split('@')[0]

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Top bar — close + program edit */}
      <div className="flex items-center justify-between">
        <button onClick={onClose} className="flex items-center gap-1.5 text-[var(--c-text4)] hover:text-[var(--c-text)] transition">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[11px] uppercase tracking-widest font-mono">Roster</span>
        </button>
        <button
          onClick={() => onOpenProgram(member.id)}
          className="text-[10px] font-mono tracking-widest uppercase text-[var(--c-accent-text)] hover:opacity-75 transition border border-[var(--c-accent-text)]/40 rounded-lg px-3 py-1.5 hover:bg-[var(--c-accent-text)]/10 active:scale-95"
        >
          Edit Program
        </button>
      </div>

      {/* Client profile header */}
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-[var(--c-accent-text)]/10 border border-[var(--c-border2)] flex items-center justify-center text-xl font-bold text-[var(--c-accent-text)] shrink-0">
          {member.avatar_url ? <img src={member.avatar_url} alt="" className="w-full h-full object-cover" /> : memberDisplayName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-display leading-none truncate">{memberDisplayName}.</h2>
          <p className="text-xs text-[var(--c-text4)] truncate mt-1">{member.email}</p>
          <div className="flex items-center gap-3 mt-2.5 text-[11px] text-[var(--c-text4)] flex-wrap">
            {daysIntoProgram !== null && (
              <span><span className="text-[var(--c-text2)] font-semibold">{daysIntoProgram}</span>d in program</span>
            )}
          </div>
        </div>
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

      <IntakeCard member={member} />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-5 h-5 border-2 border-[var(--c-border2)] border-t-[#b0e455]/60 rounded-full animate-spin" />
        </div>
      ) : (
        <>
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
        </>
      )}

      {canDelete && (
        <div className="pt-6 mt-2 border-t border-[var(--c-border)] space-y-2">
          <p className="text-[9px] text-[#dc2626] font-mono uppercase tracking-widest mb-2">Danger Zone</p>
          {deleteState === 'idle' && (
            <button
              type="button"
              onClick={() => setDeleteState('confirm')}
              className="w-full text-xs font-mono tracking-widest uppercase text-[#dc2626] border border-[#dc2626]/30 hover:bg-[#dc2626]/8 rounded-lg py-3 transition"
            >
              Delete Member
            </button>
          )}
          {deleteState === 'confirm' && (
            <div className="space-y-2">
              <p className="text-xs text-[var(--c-text3)] leading-relaxed">
                This will permanently delete <span className="text-[var(--c-text)] font-medium">{member.first_name ?? member.email}</span> and all their data — workouts, photos, messages, intake. The email becomes free to invite again.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setDeleteState('idle'); setDeleteError('') }}
                  className="text-xs font-mono tracking-widest uppercase text-[var(--c-text4)] border border-[var(--c-border)] hover:bg-[var(--c-hover)] rounded-lg py-3 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setDeleteState('deleting')
                    setDeleteError('')
                    try {
                      const res = await fetch('/api/admin-action', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'delete_member', memberId: member.id }),
                      })
                      const json = await res.json().catch(() => ({}))
                      if (!res.ok) throw new Error(json.error ?? 'Delete failed')
                      onDeleted()
                    } catch (err) {
                      setDeleteState('error')
                      setDeleteError(err instanceof Error ? err.message : 'Delete failed')
                    }
                  }}
                  className="text-xs font-mono tracking-widest uppercase bg-[#dc2626] text-white hover:bg-[#b91c1c] rounded-lg py-3 transition"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          )}
          {deleteState === 'deleting' && (
            <div className="flex items-center justify-center gap-2 py-3">
              <div className="w-3.5 h-3.5 border-2 border-[var(--c-border2)] border-t-[#dc2626] rounded-full animate-spin" />
              <p className="text-xs text-[var(--c-text3)]">Deleting…</p>
            </div>
          )}
          {deleteState === 'error' && (
            <div className="space-y-2">
              <p className="text-xs text-[#dc2626]">{deleteError}</p>
              <button
                type="button"
                onClick={() => { setDeleteState('idle'); setDeleteError('') }}
                className="text-xs text-[var(--c-text3)] underline"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Members tab ──────────────────────────────────────────────────────────────

function MembersTab({ members, allStats, userId, userEmail, onOpenProgram, snoozes, onMarkAddressed, onUndoAddressed }: {
  members: Member[]
  allStats: Stat[]
  userId: string
  userEmail: string
  onOpenProgram: (memberId: string) => void
  snoozes: Record<string, string>
  onMarkAddressed: (memberId: string) => void
  onUndoAddressed: (memberId: string) => void
}) {
  const [stats] = useState<Stat[]>(allStats)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)

  const latestPerMember = members.map(m => ({
    member: m,
    stat: stats.find(s => s.member_id === m.id) ?? null,
  }))

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
      <div className="max-w-2xl mx-auto py-12 lg:py-20 space-y-4 text-center">
        <h1 className="font-display leading-none text-3xl lg:text-4xl">No clients yet.</h1>
        <p className="text-sm text-[var(--c-text3)] max-w-md mx-auto leading-relaxed">
          Head to More → Admin to onboard your first member. Once they sign in, you&apos;ll see them here.
        </p>
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
        canDelete={userEmail === 'me@javilorenzana.com'}
        onOpenProgram={(id) => { setSelectedMember(null); onOpenProgram(id) }}
        onClose={() => setSelectedMember(null)}
        onMarkAddressed={() => onMarkAddressed(selectedMember.id)}
        onUndoAddressed={() => onUndoAddressed(selectedMember.id)}
        onDeleted={() => { setSelectedMember(null); window.location.reload() }}
      />
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="space-y-1">
        <p className="text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono">Roster</p>
        <h1 className="font-display leading-none text-3xl lg:text-4xl">{totalMembers} {totalMembers === 1 ? 'client' : 'clients'}.</h1>
        <p className="text-sm text-[var(--c-text3)] mt-2">
          <span className={needAttention > 0 ? 'text-[#f87171] font-semibold' : ''}>
            {needAttention} need{needAttention === 1 ? 's' : ''} attention
          </span>
          {' · '}
          {activeThisWeek} active this week
        </p>
      </div>

      {/* Roster — richer rows */}
      <div className="space-y-2">
        {sortedMembers.map(({ member, stat }) => {
          const status = checkinStatus(stat)
          const daysQuiet = stat ? Math.floor((Date.now() - new Date(stat.created_at).getTime()) / 86_400_000) : null
          return (
            <button
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className="w-full bg-[var(--c-card)] shadow-sm rounded-2xl p-4 flex items-center gap-4 border border-[var(--c-border)] hover:border-[var(--c-accent-text)]/30 hover:bg-[var(--c-hover)] transition text-left active:scale-[0.99]"
            >
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-full overflow-hidden bg-[var(--c-accent-text)]/10 border border-[var(--c-border2)] flex items-center justify-center text-sm font-mono font-bold text-[var(--c-accent-text)]">
                  {member.avatar_url ? <img src={member.avatar_url} alt="" className="w-full h-full object-cover" /> : memberName(member).charAt(0).toUpperCase()}
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--c-card)] ${STATUS_DOT[status]}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[var(--c-text)] truncate">{memberName(member)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {daysQuiet !== null && daysQuiet >= 3 && (
                  <span className={`text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full ${
                    daysQuiet >= 7 ? 'text-[#dc2626] bg-[#dc2626]/10'
                    : 'text-[#b45309] bg-[#b45309]/10'
                  }`}>
                    {daysQuiet}d quiet
                  </span>
                )}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-[var(--c-text4)]">
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Programs tab ─────────────────────────────────────────────────────────────

function ProgramsTab({ members, userId, initialMemberId, isHeadCoach }: { members: Member[]; userId: string; initialMemberId?: string | null; isHeadCoach: boolean }) {
  const supabase = createClient()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<Section>('split')
  const [sections, setSections] = useState<Partial<Record<Section, object | null>>>({})
  const [okr, setOkr] = useState<OkrData | null>(null)
  const [sectionLoadKey, setSectionLoadKey] = useState(0)
  const [loadingSections, setLoadingSections] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const selected = members.find(m => m.id === selectedId) ?? null
  const SECTIONS: Section[] = ['split', 'food', 'notes']

  useEffect(() => {
    if (initialMemberId && initialMemberId !== selectedId) {
      selectMember(initialMemberId)
    }
  }, [initialMemberId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function selectMember(id: string) {
    setSelectedId(id)
    setActiveSection('split')
    setSections({})
    setOkr(null)
    setLoadingSections(true)
    const { data } = await supabase
      .from('program_sections')
      .select('section, content_json')
      .eq('member_id', id)
    const map: Partial<Record<Section, object | null>> = {}
    let loadedOkr: OkrData | null = null
    for (const row of data ?? []) {
      if (row.section === 'okr') {
        const c = row.content_json as { type?: string } | null
        if (c?.type === 'okr') loadedOkr = c as OkrData
      } else {
        map[row.section as Section] = row.content_json
      }
    }
    setSections(map)
    setOkr(loadedOkr)
    setLoadingSections(false)
    setSectionLoadKey(k => k + 1)
  }

  async function saveOkrSection(data: OkrData) {
    if (!selectedId) return
    setSaving(true)
    await supabase.from('program_sections').upsert(
      { member_id: selectedId, section: 'okr', content_json: data, updated_by: userId },
      { onConflict: 'member_id,section' }
    )
    setOkr(data)
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
    if (members.length === 0) {
      return (
        <div className="max-w-2xl mx-auto py-12 lg:py-20 space-y-4 text-center">
          <h1 className="font-display leading-none text-3xl lg:text-4xl">Programs.</h1>
          <p className="text-sm text-[var(--c-text3)] max-w-md mx-auto leading-relaxed">
            No clients yet. Once you invite members, you'll come here to build their split and set calorie targets.
          </p>
        </div>
      )
    }
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-1">
          <p className="text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono">Programs</p>
          <h1 className="font-display leading-none text-3xl lg:text-4xl">Pick a client.</h1>
          <p className="text-sm text-[var(--c-text3)] mt-2">Build their split and food plan.</p>
        </div>
        <div className="space-y-2">
          {members.map(m => (
            <button
              key={m.id}
              onClick={() => selectMember(m.id)}
              className="w-full bg-[var(--c-card)] shadow-sm rounded-2xl p-4 flex items-center gap-4 border border-[var(--c-border)] hover:border-[var(--c-accent-text)]/30 hover:bg-[var(--c-hover)] transition text-left active:scale-[0.99]"
            >
              <div className="w-11 h-11 rounded-full overflow-hidden bg-[var(--c-accent-text)]/10 border border-[var(--c-border2)] flex items-center justify-center text-sm font-mono font-bold text-[var(--c-accent-text)] shrink-0">
                {m.avatar_url ? <img src={m.avatar_url} alt="" className="w-full h-full object-cover" /> : memberName(m).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--c-text)] truncate">{memberName(m)}</p>
                <p className="text-[11px] text-[var(--c-text4)] mt-0.5">Split · Food · Notes</p>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-[var(--c-text4)] shrink-0">
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

      <OkrSection
        key={`${selectedId}-okr-${sectionLoadKey}`}
        initial={okr}
        onSave={saveOkrSection}
        saving={saving}
        saved={saved}
      />

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
      ) : activeSection === 'notes' ? (
        <CoachNotesSection
          key={`${selectedId}-notes`}
          memberId={selectedId!}
          currentUserId={userId}
          isHeadCoach={isHeadCoach}
        />
      ) : null}
    </div>
  )
}

// ─── Coach notes section (composer + feed) ──────────────────────────────────

function noteRelTime(iso: string) {
  const d = new Date(iso)
  const diffDays = Math.floor((Date.now() - d.getTime()) / 86_400_000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: new Date().getFullYear() === d.getFullYear() ? undefined : 'numeric' })
}

type CoachNoteRow = {
  id: string
  author_id: string
  body: string
  created_at: string
  updated_at: string
  author: { first_name: string | null; email: string } | { first_name: string | null; email: string }[] | null
}

function rowToNote(n: CoachNoteRow): CoachNote {
  const a = Array.isArray(n.author) ? n.author[0] : n.author
  return {
    id: n.id,
    author_id: n.author_id,
    author_name: a?.first_name ?? a?.email?.split('@')[0] ?? 'Coach',
    body: n.body,
    created_at: n.created_at,
    updated_at: n.updated_at,
  }
}

function CoachNotesSection({ memberId, currentUserId, isHeadCoach }: { memberId: string; currentUserId: string; isHeadCoach: boolean }) {
  const supabase = createClient()
  const [notes, setNotes] = useState<CoachNote[]>([])
  const [loading, setLoading] = useState(true)
  const [body, setBody] = useState('')
  const [posting, setPosting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editBody, setEditBody] = useState('')
  const [error, setError] = useState<string | null>(null)

  const NOTES_QUERY = 'id, author_id, body, created_at, updated_at, author:profiles!coach_notes_author_id_fkey(first_name, email)'

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const { data, error: fetchErr } = await supabase
        .from('coach_notes')
        .select(NOTES_QUERY)
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })
      if (cancelled) return
      if (fetchErr) {
        setError('Failed to load notes.')
      } else {
        setNotes((data ?? []).map((n) => rowToNote(n as unknown as CoachNoteRow)))
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [memberId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function postNote() {
    const trimmed = body.trim()
    if (!trimmed) return
    setPosting(true)
    setError(null)
    const { data, error: insertErr } = await supabase
      .from('coach_notes')
      .insert({ member_id: memberId, author_id: currentUserId, body: trimmed })
      .select(NOTES_QUERY)
      .single()
    if (insertErr || !data) {
      setError('Failed to add note — please try again.')
      setPosting(false)
      return
    }
    setNotes(prev => [rowToNote(data as unknown as CoachNoteRow), ...prev])
    setBody('')
    setPosting(false)
  }

  function startEdit(note: CoachNote) {
    setEditingId(note.id)
    setEditBody(note.body)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditBody('')
  }

  async function saveEdit(noteId: string) {
    const trimmed = editBody.trim()
    if (!trimmed) return
    setError(null)
    const { data, error: updateErr } = await supabase
      .from('coach_notes')
      .update({ body: trimmed })
      .eq('id', noteId)
      .select(NOTES_QUERY)
      .single()
    if (updateErr || !data) {
      setError('Failed to save edit.')
      return
    }
    const updated = rowToNote(data as unknown as CoachNoteRow)
    setNotes(prev => prev.map(n => n.id === noteId ? updated : n))
    cancelEdit()
  }

  async function deleteNote(noteId: string) {
    if (!confirm('Delete this note? This cannot be undone.')) return
    setError(null)
    const { error: delErr } = await supabase.from('coach_notes').delete().eq('id', noteId)
    if (delErr) {
      setError('Failed to delete note.')
      return
    }
    setNotes(prev => prev.filter(n => n.id !== noteId))
  }

  return (
    <div className="space-y-4">
      {/* Composer */}
      <div className="bg-[var(--c-card)] shadow-sm rounded-2xl border border-[var(--c-border)] p-4 space-y-3">
        <p className="text-[10px] text-[var(--c-text4)] font-mono uppercase tracking-widest">New note</p>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          maxLength={5000}
          rows={4}
          placeholder="What did you discuss? What are they focused on next?"
          className="w-full bg-[var(--c-bg)] border border-[var(--c-border2)] rounded-xl px-3 py-2.5 text-sm text-[var(--c-text)] placeholder-[var(--c-text5)] focus:outline-none focus:border-[#b0e455]/40 transition resize-none"
        />
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-[var(--c-text4)]">{body.length}/5000</p>
          <button
            onClick={postNote}
            disabled={posting || !body.trim()}
            className="px-4 py-2 rounded-xl bg-[#b0e455] text-[#0f1a0c] text-xs font-semibold hover:bg-[#c9f070] transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {posting ? 'Saving…' : 'Add note'}
          </button>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      {/* Feed */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-5 h-5 border-2 border-[var(--c-border2)] border-t-[#b0e455]/60 rounded-full animate-spin" />
        </div>
      ) : notes.length === 0 ? (
        <div className="bg-[var(--c-card2)] rounded-2xl p-5 text-center">
          <p className="text-sm text-[var(--c-text4)]">No notes yet. Drop the first one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map(note => {
            const canEdit = note.author_id === currentUserId || isHeadCoach
            const isEditing = editingId === note.id
            return (
              <div key={note.id} className="bg-[var(--c-card)] shadow-sm rounded-2xl border border-[var(--c-border)] p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-[var(--c-accent-text)]">{note.author_name}</p>
                  <p className="text-[10px] text-[var(--c-text4)] font-mono uppercase tracking-widest" suppressHydrationWarning>{noteRelTime(note.created_at)}</p>
                </div>
                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={editBody}
                      onChange={e => setEditBody(e.target.value)}
                      maxLength={5000}
                      rows={4}
                      className="w-full bg-[var(--c-bg)] border border-[var(--c-border2)] rounded-xl px-3 py-2.5 text-sm text-[var(--c-text)] focus:outline-none focus:border-[#b0e455]/40 transition resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={cancelEdit} className="px-3 py-1.5 rounded-lg text-xs text-[var(--c-text3)] hover:text-[var(--c-text)] transition">Cancel</button>
                      <button
                        onClick={() => saveEdit(note.id)}
                        disabled={!editBody.trim()}
                        className="px-3 py-1.5 rounded-lg bg-[#b0e455] text-[#0f1a0c] text-xs font-semibold hover:bg-[#c9f070] transition disabled:opacity-40"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-[var(--c-text2)] leading-relaxed whitespace-pre-wrap">{note.body}</p>
                    {canEdit && (
                      <div className="flex justify-end gap-3 mt-3 pt-3 border-t border-[var(--c-border)]">
                        <button onClick={() => startEdit(note)} className="text-[10px] font-mono uppercase tracking-widest text-[var(--c-text4)] hover:text-[var(--c-text)] transition">Edit</button>
                        <button onClick={() => deleteNote(note.id)} className="text-[10px] font-mono uppercase tracking-widest text-[var(--c-text4)] hover:text-red-400 transition">Delete</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Applications Kanban ──────────────────────────────────────────────────────

type Application = {
  id: string
  created_at: string
  status: 'pending' | 'accepted' | 'declined' | 'call_booked' | 'waiting' | 'won' | 'lost' | 'rejected' | 'closed'
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

type KanbanColKey = 'new' | 'email_sent' | 'call_booked' | 'waiting' | 'closed' | 'lost' | 'rejected'
type MoveStatus = 'accepted' | 'call_booked' | 'waiting' | 'won' | 'lost' | 'rejected'

function appRelTime(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

function columnKey(status: Application['status']): KanbanColKey {
  // 'accepted' = acceptance email sent, call not booked yet
  if (status === 'accepted') return 'email_sent'
  if (status === 'call_booked') return 'call_booked'
  if (status === 'waiting') return 'waiting'
  if (status === 'won') return 'closed'
  if (status === 'lost') return 'lost'
  // 'rejected' (you said no), legacy 'declined' and legacy 'closed' (old decline-email auto-status) all land in Rejected
  if (['rejected', 'declined', 'closed'].includes(status)) return 'rejected'
  return 'new'
}

function colToStatus(col: KanbanColKey): MoveStatus | null {
  if (col === 'email_sent') return 'accepted'
  if (col === 'call_booked') return 'call_booked'
  if (col === 'waiting') return 'waiting'
  if (col === 'closed') return 'won'
  if (col === 'lost') return 'lost'
  if (col === 'rejected') return 'rejected'
  return null
}

const KANBAN_COLS: { key: KanbanColKey; label: string; accent: string; dim: string }[] = [
  { key: 'new',        label: 'New',         accent: '#fbbf24', dim: '#fbbf24/15' },
  { key: 'email_sent', label: 'Email Sent',  accent: '#c084fc', dim: '#c084fc/15' },
  { key: 'call_booked',label: 'Call Booked', accent: '#b0e455', dim: '#b0e455/15' },
  { key: 'waiting',    label: 'Waiting',     accent: '#60a5fa', dim: '#60a5fa/15' },
  { key: 'closed',     label: 'Closed',      accent: '#22c55e', dim: '#22c55e/15' },
  { key: 'lost',       label: 'Lost',        accent: '#94a3b8', dim: '#94a3b8/15' },
  { key: 'rejected',   label: 'Rejected',    accent: '#6b7280', dim: '#6b7280/15' },
]

function ApplicationsSection() {
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [actionState, setActionState] = useState<Record<string, 'idle' | 'loading' | 'done' | 'error'>>({})
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [dragAppId, setDragAppId] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<KanbanColKey | null>(null)
  const [moveError, setMoveError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollVxRef = useRef(0)

  useEffect(() => {
    fetch('/api/admin-applications')
      .then(r => r.json())
      .then(json => setApps(json.applications ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Edge auto-scroll while dragging — browsers don't auto-scroll custom overflow containers
  useEffect(() => {
    if (!dragAppId) { scrollVxRef.current = 0; return }
    let raf = 0
    const step = () => {
      const el = scrollRef.current
      const vx = scrollVxRef.current
      if (el && vx !== 0) el.scrollLeft += vx
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => { cancelAnimationFrame(raf); scrollVxRef.current = 0 }
  }, [dragAppId])

  // Keep selectedApp in sync when apps list updates
  useEffect(() => {
    if (selectedApp) {
      const updated = apps.find(a => a.id === selectedApp.id)
      if (updated) setSelectedApp(updated)
    }
  }, [apps]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-dismiss move error toast
  useEffect(() => {
    if (!moveError) return
    const t = setTimeout(() => setMoveError(null), 5000)
    return () => clearTimeout(t)
  }, [moveError])

  async function handleAccept(appId: string) {
    setActionState(s => ({ ...s, [appId]: 'loading' }))
    try {
      const res = await fetch('/api/application-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: appId }),
      })
      const json = await res.json().catch(() => ({}))
      if (res.ok) {
        setApps(prev => prev.map(a => a.id === appId ? { ...a, status: 'accepted', responded_at: new Date().toISOString() } : a))
        setActionState(s => ({ ...s, [appId]: 'done' }))
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

  async function handleMove(appId: string, status: MoveStatus) {
    // Optimistic update — move the card immediately
    const prevApps = [...apps]
    setApps(prev => prev.map(a => a.id === appId ? { ...a, status, responded_at: new Date().toISOString() } : a))
    // Close detail modal on reject so the card visually moves
    if (status === 'rejected') setSelectedApp(null)
    try {
      const res = await fetch('/api/move-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: appId, status }),
      })
      if (!res.ok) {
        // Revert on failure
        setApps(prevApps)
        setMoveError(`Failed to move — server returned ${res.status}`)
      }
    } catch {
      setApps(prevApps)
      setMoveError('Network error — could not reach the server')
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

  function handleDrop(targetCol: KanbanColKey) {
    if (!dragAppId || targetCol === 'new') return
    const app = apps.find(a => a.id === dragAppId)
    if (!app || columnKey(app.status) === targetCol) return
    const status = colToStatus(targetCol)
    if (status) handleMove(dragAppId, status)
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
  const wonCount = colApps('closed').length
  const lostCount = colApps('lost').length
  const qualified = wonCount + lostCount
  const closeRate = qualified > 0 ? Math.round((wonCount / qualified) * 100) : null

  return (
    <div className="space-y-5">
      {/* Error toast */}
      {moveError && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#f87171]/10 border border-[#f87171]/25 text-xs text-[#f87171]">
          <span className="flex-1">{moveError}</span>
          <button onClick={() => setMoveError(null)} className="shrink-0 hover:text-[#fca5a5] transition">✕</button>
        </div>
      )}

      {/* Close-rate stat — won / (won + lost), ignoring rejects */}
      <div className="flex items-center justify-end gap-3 px-1 text-[10px] font-mono text-[var(--c-text4)]">
        <span>
          <span className="text-[#22c55e]">{wonCount}</span> won · <span className="text-[var(--c-text3)]">{lostCount}</span> lost
        </span>
        {closeRate !== null && (
          <span className="text-[var(--c-text3)]">
            close rate <span className="font-semibold text-[var(--c-text)]">{closeRate}%</span>
          </span>
        )}
      </div>

      {/* Kanban board — horizontal scroll on mobile */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1"
        onDragOver={e => {
          if (!dragAppId) return
          const el = scrollRef.current
          if (!el) return
          const r = el.getBoundingClientRect()
          const EDGE = 80
          if (e.clientX - r.left < EDGE) scrollVxRef.current = -12
          else if (r.right - e.clientX < EDGE) scrollVxRef.current = 12
          else scrollVxRef.current = 0
        }}
      >
        {KANBAN_COLS.map(col => {
          const items = colApps(col.key)
          const isWonCol = col.key === 'closed'
          return (
            <div
              key={col.key}
              className={`flex-none w-60 space-y-2 rounded-2xl ${isWonCol ? 'p-2 ring-1 ring-[#22c55e]/25' : ''}`}
              style={isWonCol ? { backgroundColor: '#22c55e14' } : undefined}
            >
              {/* Column header */}
              <div className="flex items-center gap-2 px-1">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: col.accent }} />
                <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--c-text3)] flex-1">{col.label}</p>
                {items.length > 0 && (
                  <span className="text-[10px] font-mono text-[var(--c-text4)] bg-[var(--c-card2)] px-1.5 py-0.5 rounded-full border border-[var(--c-border)]">{items.length}</span>
                )}
              </div>

              {/* Cards — drop zone */}
              <div
                className="space-y-2 min-h-[80px] rounded-xl transition-colors p-1"
                style={dragOverCol === col.key && dragAppId ? { backgroundColor: `${col.accent}18` } : {}}
                onDragOver={e => { e.preventDefault(); setDragOverCol(col.key) }}
                onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverCol(null) }}
                onDrop={() => { handleDrop(col.key); setDragOverCol(null) }}
              >
                {items.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-[var(--c-border)] px-3 py-6 flex items-center justify-center">
                    <p className="text-[10px] text-[var(--c-text5)] font-mono">Drop here</p>
                  </div>
                )}
                {items.map(app => {
                  const isSelected = selectedApp?.id === app.id
                  const state = actionState[app.id] ?? 'idle'
                  return (
                    <div
                      key={app.id}
                      draggable
                      onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', app.id); setDragAppId(app.id) }}
                      onDragEnd={() => { setDragAppId(null); setDragOverCol(null) }}
                      className={`rounded-2xl border p-3 transition-all select-none ${
                        dragAppId === app.id ? 'opacity-40 cursor-grabbing' : 'cursor-grab'
                      } ${
                        isSelected
                          ? 'bg-[var(--c-card)] border-[var(--c-accent-text)]/30 shadow-md'
                          : isWonCol
                            ? 'border-[#22c55e]/30 hover:border-[#22c55e]/50 shadow-sm'
                            : 'bg-[var(--c-card)] border-[var(--c-border)] hover:border-[var(--c-border2)] shadow-sm'
                      }`}
                      style={isWonCol && !isSelected ? { backgroundColor: '#22c55e0f' } : undefined}
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

                      {/* Investment fit */}
                      {app.investment_fit && (
                        <p className="text-[10px] text-[var(--c-text4)] mb-2 truncate">
                          <span className="text-[9px] text-[var(--c-text5)] font-mono uppercase tracking-widest mr-1">Invest:</span>
                          {app.investment_fit}
                        </p>
                      )}

                      {/* Action buttons */}
                      {col.key === 'new' && (
                        <div className="flex gap-1.5 mt-2.5">
                          <button
                            onClick={e => { e.stopPropagation(); handleMove(app.id, 'rejected') }}
                            disabled={state === 'loading'}
                            className="flex-1 py-1.5 rounded-xl border border-[var(--c-border2)] text-[10px] font-mono text-[var(--c-text4)] hover:text-[var(--c-text)] hover:border-[var(--c-border)] transition disabled:opacity-40"
                          >
                            Reject
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); handleAccept(app.id) }}
                            disabled={state === 'loading'}
                            className="flex-1 py-1.5 rounded-xl text-[10px] font-mono font-semibold transition disabled:opacity-40"
                            style={{ backgroundColor: col.accent, color: '#0f1a0c' }}
                          >
                            {state === 'loading' ? '…' : state === 'done' ? '✓' : 'Accept'}
                          </button>
                        </div>
                      )}
                      {col.key === 'email_sent' && (
                        <div className="flex gap-1.5 mt-2.5">
                          <button
                            onClick={e => { e.stopPropagation(); handleMove(app.id, 'lost') }}
                            disabled={state === 'loading'}
                            className="flex-1 py-1.5 rounded-xl border border-[var(--c-border2)] text-[10px] font-mono text-[var(--c-text4)] hover:text-[var(--c-text)] transition disabled:opacity-40"
                          >
                            → Lost
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); handleMove(app.id, 'call_booked') }}
                            disabled={state === 'loading'}
                            className="flex-1 py-1.5 rounded-xl text-[10px] font-mono font-semibold text-[#0f1a0c] bg-[#b0e455] hover:bg-[#9fd13e] transition disabled:opacity-40"
                          >
                            → Booked
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
                            onClick={e => { e.stopPropagation(); handleMove(app.id, 'won') }}
                            disabled={state === 'loading'}
                            className="flex-1 py-1.5 rounded-xl text-[10px] font-mono font-semibold text-[#0f1a0c] bg-[#22c55e] hover:bg-[#16a34a] transition disabled:opacity-40"
                          >
                            → Won
                          </button>
                        </div>
                      )}
                      {col.key === 'waiting' && (
                        <div className="flex gap-1.5 mt-2.5">
                          <button
                            onClick={e => { e.stopPropagation(); handleMove(app.id, 'lost') }}
                            disabled={state === 'loading'}
                            className="flex-1 py-1.5 rounded-xl border border-[var(--c-border2)] text-[10px] font-mono text-[var(--c-text4)] hover:text-[var(--c-text)] transition disabled:opacity-40"
                          >
                            → Lost
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); handleMove(app.id, 'won') }}
                            disabled={state === 'loading'}
                            className="flex-1 py-1.5 rounded-xl text-[10px] font-mono font-semibold text-[#0f1a0c] bg-[#22c55e] hover:bg-[#16a34a] transition disabled:opacity-40"
                          >
                            → Won
                          </button>
                        </div>
                      )}
                      {(col.key === 'closed' || col.key === 'lost' || col.key === 'rejected') && (
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

      {/* Application detail modal */}
      {selectedApp && (() => {
        const app = selectedApp
        const state = actionState[app.id] ?? 'idle'
        const colKey = columnKey(app.status)
        const col = KANBAN_COLS.find(c => c.key === colKey)!
        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={() => setSelectedApp(null)}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div className="relative bg-[var(--c-card)] rounded-t-2xl sm:rounded-2xl border border-[var(--c-border)] shadow-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Modal header */}
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
                    <a
                      href={`https://instagram.com/${app.instagram.replace(/^@/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[var(--c-accent-text)] hover:underline"
                    >
                      @{app.instagram.replace(/^@/, '')}
                    </a>
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
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleMove(app.id, 'rejected')}
                      disabled={state === 'loading'}
                      className="flex-1 py-3 rounded-2xl border border-[var(--c-border2)] text-sm text-[var(--c-text3)] hover:text-[var(--c-text)] hover:border-[var(--c-border)] transition disabled:opacity-40"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleAccept(app.id)}
                      disabled={state === 'loading'}
                      className="flex-1 py-3 rounded-2xl bg-[#b0e455] text-[#0f1a0c] text-sm font-semibold hover:bg-[#c9f070] transition disabled:opacity-40"
                    >
                      {state === 'loading' ? 'Sending…' : state === 'done' ? 'Sent ✓' : 'Accept — Send Invite'}
                    </button>
                  </div>
                  <p className="text-[10px] text-[var(--c-text5)] font-mono text-center">Reject moves the card to Rejected — no email is sent.</p>
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
  const [loading, setLoading] = useState(true)

  // New member notifications
  const [newMembers, setNewMembers] = useState<AdminProfile[]>([])
  const [newMemberCoach, setNewMemberCoach] = useState<Record<string, string>>({})
  const knownMemberIds = useRef<Set<string>>(new Set())
  const isFirstLoad = useRef(true)

  // Invite member
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteFirstName, setInviteFirstName] = useState('')
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [inviteMsg, setInviteMsg] = useState('')
  const [inviteCredentials, setInviteCredentials] = useState<{ email: string; password: string; first_name: string | null } | null>(null)
  const [copiedField, setCopiedField] = useState<'email' | 'password' | 'both' | null>(null)

  // Invite coach
  const [coachInviteEmail, setCoachInviteEmail] = useState('')
  const [coachInviteFirstName, setCoachInviteFirstName] = useState('')
  const [coachInviteStatus, setCoachInviteStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [coachInviteMsg, setCoachInviteMsg] = useState('')
  const [coachInviteCredentials, setCoachInviteCredentials] = useState<{ email: string; password: string; first_name: string | null } | null>(null)
  const [coachCopiedField, setCoachCopiedField] = useState<'email' | 'password' | 'both' | null>(null)

  // Assign
  const [assignMemberId, setAssignMemberId] = useState('')
  const [assignCoachId, setAssignCoachId] = useState('')
  const [assignStatus, setAssignStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

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

  function profileName(p: AdminProfile) { return p.first_name ?? p.email.split('@')[0] }
  function coachName(id: string) { return coaches.find(c => c.id === id) }

  async function handleInvite(e: FormEvent) {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setInviteStatus('loading')
    setInviteMsg('')
    try {
      const res = await fetch('/api/invite-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-coach-email': userEmail },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          plan: 'member',
          first_name: inviteFirstName.trim() || null,
        }),
      })
      const json = await res.json()
      if (res.ok) {
        setInviteStatus('ok')
        setInviteCredentials({ email: json.email, password: json.password, first_name: json.first_name })
        setInviteEmail('')
        setInviteFirstName('')
        setTimeout(() => loadData(), 2000)
      } else {
        setInviteStatus('error')
        setInviteMsg(json.error ?? 'Failed to create account.')
        setTimeout(() => { setInviteStatus('idle'); setInviteMsg('') }, 4000)
      }
    } catch {
      setInviteStatus('error'); setInviteMsg('Network error.')
      setTimeout(() => { setInviteStatus('idle'); setInviteMsg('') }, 4000)
    }
  }

  function copyToClipboard(text: string, field: 'email' | 'password' | 'both') {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 1500)
    })
  }

  async function handleInviteCoach(e: FormEvent) {
    e.preventDefault()
    if (!coachInviteEmail.trim()) return
    setCoachInviteStatus('loading')
    setCoachInviteMsg('')
    try {
      const res = await fetch('/api/invite-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-coach-email': userEmail },
        body: JSON.stringify({
          email: coachInviteEmail.trim(),
          first_name: coachInviteFirstName.trim() || null,
        }),
      })
      const json = await res.json()
      if (res.ok) {
        setCoachInviteStatus('ok')
        setCoachInviteCredentials({ email: json.email, password: json.password, first_name: json.first_name })
        setCoachInviteEmail('')
        setCoachInviteFirstName('')
        setTimeout(() => loadData(), 2000)
      } else {
        setCoachInviteStatus('error')
        setCoachInviteMsg(json.error ?? 'Failed to create account.')
        setTimeout(() => { setCoachInviteStatus('idle'); setCoachInviteMsg('') }, 4000)
      }
    } catch {
      setCoachInviteStatus('error'); setCoachInviteMsg('Network error.')
      setTimeout(() => { setCoachInviteStatus('idle'); setCoachInviteMsg('') }, 4000)
    }
  }

  function copyCoachToClipboard(text: string, field: 'email' | 'password' | 'both') {
    navigator.clipboard.writeText(text).then(() => {
      setCoachCopiedField(field)
      setTimeout(() => setCoachCopiedField(null), 1500)
    })
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

  if (loading) {
    return <div className="py-12 text-center text-xs text-[var(--c-text4)] font-mono">Loading…</div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">

      {/* Header */}
      <div className="space-y-1">
        <p className="text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono">Admin</p>
        <h1 className="font-display leading-none text-3xl lg:text-4xl">Tools.</h1>
        <p className="text-sm text-[var(--c-text3)] mt-2">Onboard new clients, assign coaches, send updates.</p>
      </div>

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

      {/* ── Invite a coach ── */}
      <div>
        <p className="text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono mb-1">Adding a new coach?</p>
        <p className="text-xs text-[var(--c-text4)] mb-3">Create their account and share the credentials. They&apos;ll land in the coach dashboard on first sign-in.</p>

        {coachInviteCredentials ? (
          <div className="space-y-3">
            <div className="bg-[#b0e455]/8 border border-[#b0e455]/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#b0e455]/20 flex items-center justify-center">
                  <svg viewBox="0 0 16 16" className="w-3 h-3 text-[#b0e455]" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 8l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-[var(--c-text)]">
                  Coach account created{coachInviteCredentials.first_name ? ` for ${coachInviteCredentials.first_name}` : ''}
                </p>
              </div>
              <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">
                Share these credentials. They&apos;ll log in at zanafitness.com and land in the coach dashboard.
              </p>

              <div className="bg-[var(--c-bg)] border border-[var(--c-border)] rounded-lg px-3 py-2.5 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] uppercase tracking-widest font-mono text-[var(--c-text5)] mb-0.5">Email</p>
                  <p className="text-sm text-[var(--c-text)] font-mono truncate">{coachInviteCredentials.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyCoachToClipboard(coachInviteCredentials.email, 'email')}
                  className="text-[10px] font-mono tracking-widest uppercase text-[var(--c-text4)] hover:text-[var(--c-accent-text)] transition shrink-0"
                >
                  {coachCopiedField === 'email' ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="bg-[var(--c-bg)] border border-[var(--c-border)] rounded-lg px-3 py-2.5 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] uppercase tracking-widest font-mono text-[var(--c-text5)] mb-0.5">Password</p>
                  <p className="text-sm text-[var(--c-text)] font-mono truncate select-all">{coachInviteCredentials.password}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyCoachToClipboard(coachInviteCredentials.password, 'password')}
                  className="text-[10px] font-mono tracking-widest uppercase text-[var(--c-text4)] hover:text-[var(--c-accent-text)] transition shrink-0"
                >
                  {coachCopiedField === 'password' ? 'Copied' : 'Copy'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => copyCoachToClipboard(`Email: ${coachInviteCredentials.email}\nPassword: ${coachInviteCredentials.password}`, 'both')}
                className="w-full py-2.5 rounded-lg bg-[#b0e455] text-[#0f1a0c] text-[11px] tracking-widest uppercase font-mono font-semibold hover:bg-[#c9f070] transition"
              >
                {coachCopiedField === 'both' ? 'Copied to clipboard ✓' : 'Copy Both'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => { setCoachInviteCredentials(null); setCoachInviteStatus('idle') }}
              className="w-full py-2.5 rounded-lg border border-[var(--c-border)] text-[var(--c-text3)] text-[11px] tracking-widest uppercase font-mono hover:bg-[var(--c-hover)] transition"
            >
              Add Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleInviteCoach} className="space-y-3">
            <input
              type="text"
              value={coachInviteFirstName}
              onChange={e => setCoachInviteFirstName(e.target.value)}
              placeholder="First name (optional)"
              autoComplete="given-name"
              className="w-full bg-[var(--c-card)] border border-[var(--c-border)] rounded-lg px-4 py-3 text-[var(--c-text)] text-sm placeholder-[var(--c-text5)] focus:outline-none focus:border-[#b0e455]/60 transition"
            />
            <input
              type="email"
              value={coachInviteEmail}
              onChange={e => setCoachInviteEmail(e.target.value)}
              placeholder="coach@email.com"
              required
              autoComplete="email"
              className="w-full bg-[var(--c-card)] border border-[var(--c-border)] rounded-lg px-4 py-3 text-[var(--c-text)] text-sm placeholder-[var(--c-text5)] focus:outline-none focus:border-[#b0e455]/60 transition"
            />
            <button
              type="submit"
              disabled={coachInviteStatus === 'loading' || !coachInviteEmail.trim()}
              className="w-full py-3 rounded-lg bg-[#b0e455] text-[#0f1a0c] text-xs tracking-widest uppercase font-mono font-semibold hover:bg-[#c9f070] transition disabled:opacity-50"
            >
              {coachInviteStatus === 'loading' ? 'Creating…' : 'Create Coach Account'}
            </button>
            {coachInviteMsg && (
              <p className={`text-xs font-medium ${coachInviteStatus === 'ok' ? 'text-[#15803d]' : 'text-[#dc2626]'}`}>{coachInviteMsg}</p>
            )}
          </form>
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

      {/* ── Create member account ── */}
      <div>
        <p className="text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono mb-1">Onboarding a new client?</p>
        <p className="text-xs text-[var(--c-text4)] mb-3">Create their account on the call. We&apos;ll generate a password you can share — they&apos;ll be guided into onboarding the moment they sign in.</p>

        {inviteCredentials ? (
          <div className="space-y-3">
            <div className="bg-[#b0e455]/8 border border-[#b0e455]/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#b0e455]/20 flex items-center justify-center">
                  <svg viewBox="0 0 16 16" className="w-3 h-3 text-[#b0e455]" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 8l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-[var(--c-text)]">
                  Account created{inviteCredentials.first_name ? ` for ${inviteCredentials.first_name}` : ''}
                </p>
              </div>
              <p className="text-[11px] text-[var(--c-text3)] leading-relaxed">
                Share these credentials with the member. They&apos;ll log in at zanafitness.com and be guided through onboarding.
              </p>

              {/* Email row */}
              <div className="bg-[var(--c-bg)] border border-[var(--c-border)] rounded-lg px-3 py-2.5 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] uppercase tracking-widest font-mono text-[var(--c-text5)] mb-0.5">Email</p>
                  <p className="text-sm text-[var(--c-text)] font-mono truncate">{inviteCredentials.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(inviteCredentials.email, 'email')}
                  className="text-[10px] font-mono tracking-widest uppercase text-[var(--c-text4)] hover:text-[var(--c-accent-text)] transition shrink-0"
                >
                  {copiedField === 'email' ? 'Copied' : 'Copy'}
                </button>
              </div>

              {/* Password row */}
              <div className="bg-[var(--c-bg)] border border-[var(--c-border)] rounded-lg px-3 py-2.5 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] uppercase tracking-widest font-mono text-[var(--c-text5)] mb-0.5">Password</p>
                  <p className="text-sm text-[var(--c-text)] font-mono truncate select-all">{inviteCredentials.password}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(inviteCredentials.password, 'password')}
                  className="text-[10px] font-mono tracking-widest uppercase text-[var(--c-text4)] hover:text-[var(--c-accent-text)] transition shrink-0"
                >
                  {copiedField === 'password' ? 'Copied' : 'Copy'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => copyToClipboard(`Email: ${inviteCredentials.email}\nPassword: ${inviteCredentials.password}`, 'both')}
                className="w-full py-2.5 rounded-lg bg-[#b0e455] text-[#0f1a0c] text-[11px] tracking-widest uppercase font-mono font-semibold hover:bg-[#c9f070] transition"
              >
                {copiedField === 'both' ? 'Copied to clipboard ✓' : 'Copy Both'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => { setInviteCredentials(null); setInviteStatus('idle') }}
              className="w-full py-2.5 rounded-lg border border-[var(--c-border)] text-[var(--c-text3)] text-[11px] tracking-widest uppercase font-mono hover:bg-[var(--c-hover)] transition"
            >
              Create Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleInvite} className="space-y-3">
            <input
              type="text"
              value={inviteFirstName}
              onChange={e => setInviteFirstName(e.target.value)}
              placeholder="First name (optional)"
              autoComplete="given-name"
              className="w-full bg-[var(--c-card)] border border-[var(--c-border)] rounded-lg px-4 py-3 text-[var(--c-text)] text-sm placeholder-[var(--c-text5)] focus:outline-none focus:border-[#b0e455]/60 transition"
            />
            <input
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              placeholder="member@email.com"
              required
              autoComplete="email"
              className="w-full bg-[var(--c-card)] border border-[var(--c-border)] rounded-lg px-4 py-3 text-[var(--c-text)] text-sm placeholder-[var(--c-text5)] focus:outline-none focus:border-[#b0e455]/60 transition"
            />
            <button
              type="submit"
              disabled={inviteStatus === 'loading' || !inviteEmail.trim()}
              className="w-full py-3 rounded-lg bg-[#b0e455] text-[#0f1a0c] text-xs tracking-widest uppercase font-mono font-semibold hover:bg-[#c9f070] transition disabled:opacity-50"
            >
              {inviteStatus === 'loading' ? 'Creating…' : 'Create Account'}
            </button>
            {inviteMsg && (
              <p className={`text-xs font-medium ${inviteStatus === 'ok' ? 'text-[#15803d]' : 'text-[#dc2626]'}`}>{inviteMsg}</p>
            )}
          </form>
        )}
      </div>

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

// ─── More page (houses Applications + Admin under one nav slot) ──────────────

function MorePage({ onChange }: { onChange: (t: CoachTab) => void }) {
  const items: { id: CoachTab; label: string; description: string; icon: JSX.Element }[] = [
    {
      id: 'applications',
      label: 'Applications',
      description: 'New leads who applied to join — review and follow up.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5 text-[var(--c-accent-text)]">
          <path d="M9 12h6M9 16h3M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2M9 4a2 2 0 002 2h2a2 2 0 002-2M9 4a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'admin',
      label: 'Admin',
      description: 'Create members, assign coaches, broadcast updates.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5 text-[var(--c-accent-text)]">
          <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-1">
        <p className="text-[10px] text-[var(--c-text4)] tracking-widest uppercase font-mono">More</p>
        <h1 className="font-display leading-none text-3xl lg:text-4xl">Tools.</h1>
      </div>
      <div className="space-y-2">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className="w-full text-left bg-[var(--c-card)] border border-[var(--c-border)] rounded-2xl p-4 hover:border-[var(--c-accent-text)]/30 hover:bg-[var(--c-hover)] transition flex items-start gap-4 active:scale-[0.99]"
          >
            <div className="shrink-0 w-10 h-10 rounded-xl bg-[var(--c-accent-text)]/8 border border-[var(--c-border2)] flex items-center justify-center">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--c-text)]">{item.label}</p>
              <p className="text-xs text-[var(--c-text3)] mt-0.5 leading-relaxed">{item.description}</p>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 text-[var(--c-text4)] mt-2 shrink-0">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function CoachClient({ userId, userEmail, userRole, firstName, avatarColor, avatarUrl, members, snoozeMap }: Props) {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<CoachTab>('home')
  const [programMemberId, setProgramMemberId] = useState<string | null>(null)
  const [snoozes, setSnoozes] = useState<Record<string, string>>(snoozeMap)
  const isHeadCoach = userRole === 'head_coach'

  // Members no longer post activity; attention scaffolding renders empty.
  const allStats: Stat[] = []

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

  const TAB_TITLES: Record<CoachTab, string> = {
    home: 'Home',
    members: 'Members',
    programs: 'Programs',
    inbox: 'DM Inbox',
    applications: 'Applications',
    admin: 'Admin',
    more: 'More',
  }

  const initials = (firstName ?? userEmail.split('@')[0]).slice(0, 1).toUpperCase()

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] flex flex-col lg:pl-52">
      {/* Header — minimal: just the current tab + avatar on mobile */}
      <div className="px-5 pt-10 pb-3 flex items-center justify-between lg:hidden">
        <p className="text-[11px] text-[var(--c-text4)] tracking-widest uppercase font-mono">{TAB_TITLES[activeTab]}</p>
        <Link href="/profile" className="shrink-0">
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
          <HomeTab members={members} allStats={allStats} userId={userId} isHeadCoach={isHeadCoach} firstName={firstName} snoozes={snoozes} onMarkAddressed={markAddressed} onUndoAddressed={undoAddressed} />
        )}
        {activeTab === 'members' && (
          <MembersTab members={members} allStats={allStats} userId={userId} userEmail={userEmail} onOpenProgram={openMemberProgram} snoozes={snoozes} onMarkAddressed={markAddressed} onUndoAddressed={undoAddressed} />
        )}
        {activeTab === 'programs' && (
          <ProgramsTab members={members} userId={userId} initialMemberId={programMemberId} isHeadCoach={isHeadCoach} />
        )}
{activeTab === 'applications' && isHeadCoach && userEmail === 'me@javilorenzana.com' && (
          <ApplicationsSection />
        )}
        {activeTab === 'admin' && isHeadCoach && userEmail === 'me@javilorenzana.com' && (
          <AdminTab userEmail={userEmail} />
        )}
        {activeTab === 'more' && isHeadCoach && userEmail === 'me@javilorenzana.com' && (
          <MorePage onChange={setActiveTab} />
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
