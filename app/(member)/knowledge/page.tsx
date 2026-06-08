import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export const metadata: Metadata = {
  title: 'Knowledge | Zana',
}

type Module = {
  slug: string
  title: string
  blurb: string
  ready: boolean
}

const CORE: Module[] = [
  {
    slug: 'the-full-game',
    title: 'The Full Game Explained',
    blurb: 'BMR, protein, progressive overload — the three levers everything else hangs off.',
    ready: true,
  },
  {
    slug: 'diet-high-protein',
    title: 'Diet — High Protein',
    blurb: 'Why protein is the anchor of every meal, and how to actually hit it without thinking about it.',
    ready: false,
  },
  {
    slug: 'working-out',
    title: 'Working Out',
    blurb: 'PPL, the 1-hour rule, 8/10 intensity, training what shows in clothes.',
    ready: false,
  },
  {
    slug: 'lifestyle-recovery',
    title: 'Lifestyle & Recovery',
    blurb: 'Sleep, walking, the stuff outside the gym that quietly does most of the work.',
    ready: false,
  },
]

const BONUS: Module[] = [
  {
    slug: 'what-to-eat',
    title: 'What to Eat & What to Avoid',
    blurb: 'A practical food list. Anchors, swaps, and the stuff to leave on the shelf.',
    ready: false,
  },
  {
    slug: 'optimal-workouts',
    title: 'Optimal Workouts',
    blurb: 'The actual exercise list that builds the look — and the ones that just waste an hour.',
    ready: false,
  },
  {
    slug: 'pre-workout',
    title: 'The Pre-Workout Routine',
    blurb: 'The 15 minutes that make the next 60 worth it. Caffeine, warm-up, mental switch.',
    ready: false,
  },
]

function ModuleCard({ m, idx }: { m: Module; idx: number }) {
  const num = String(idx + 1).padStart(2, '0')
  const inner = (
    <div className="flex items-start gap-4 p-5 md:p-6 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] hover:bg-[var(--c-hover)] transition-colors h-full">
      <span className="font-display text-[#b0e455] text-sm shrink-0 pt-0.5 w-8 tracking-widest">{num}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <p className="font-semibold text-[15px] md:text-base text-[var(--c-text)] leading-snug">{m.title}</p>
          {!m.ready && (
            <span className="text-[9px] uppercase tracking-widest font-medium text-[var(--c-text4)] border border-[var(--c-border2)] rounded-full px-2 py-0.5">
              Coming soon
            </span>
          )}
        </div>
        <p className="text-[13px] md:text-[14px] text-[var(--c-text3)] leading-relaxed">{m.blurb}</p>
      </div>
      {m.ready && (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[var(--c-text4)] shrink-0 mt-1">
          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
        </svg>
      )}
    </div>
  )
  return m.ready ? (
    <Link href={`/knowledge/${m.slug}`} className="block">{inner}</Link>
  ) : (
    <div className="opacity-55 cursor-default">{inner}</div>
  )
}

export default async function KnowledgePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <main className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] pb-28 lg:pb-12 lg:pl-52">
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-12 md:pt-16">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="mb-10 md:mb-14">
          <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#b0e455] mb-3">Knowledge</p>
          <h1 className="font-display leading-[1.05] text-[var(--c-text)] mb-4" style={{ fontSize: 'clamp(34px, 5vw, 48px)' }}>
            Learn the system.
          </h1>
          <p className="text-[15px] md:text-base text-[var(--c-text3)] leading-relaxed max-w-xl">
            Short modules on the levers that move the needle. Start with the core. The bonus modules go deeper once you&apos;re running it.
          </p>
        </header>

        {/* ── Core ───────────────────────────────────────────────────────── */}
        <section className="mb-12">
          <div className="flex items-baseline gap-3 mb-4">
            <h2 className="font-display text-xl md:text-2xl text-[var(--c-text)]">Core modules</h2>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--c-text4)]">Start here</span>
          </div>
          <div className="space-y-2.5">
            {CORE.map((m, i) => <ModuleCard key={m.slug} m={m} idx={i} />)}
          </div>
        </section>

        {/* ── Bonus ──────────────────────────────────────────────────────── */}
        <section className="mb-16">
          <div className="flex items-baseline gap-3 mb-4">
            <h2 className="font-display text-xl md:text-2xl text-[var(--c-text)]">Bonus modules</h2>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--c-text4)]">Going deeper</span>
          </div>
          <div className="space-y-2.5">
            {BONUS.map((m, i) => <ModuleCard key={m.slug} m={m} idx={i} />)}
          </div>
        </section>

      </div>
    </main>
  )
}
