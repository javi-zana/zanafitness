import type { Metadata } from 'next'
import Link from 'next/link'
import { SECTIONS } from './content'

export const metadata: Metadata = {
  title: 'The Curriculum | ZANA Fitness',
  description:
    'The system, written out section by section. The Game, Diet, Fitness, Lifestyle, and Bonus Resources — the levers that make getting lean effortless.',
}

const ZanaLogo = ({ className = 'h-5' }: { className?: string }) => (
  <svg
    viewBox="0 0 180 32"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="5"
    strokeMiterlimit="10"
  >
    <path d="M0,2 H32 L18.3,14" />
    <path d="M13.7,18 L0,30 H32" />
    <path d="M48,30 L64,2 L80,30" />
    <path d="M96,30 V2 L128,30 V2" />
    <path d="M144,30 L160,2 L176,30" />
  </svg>
)

function SectionCard({
  section,
}: {
  section: (typeof SECTIONS)[number]
}) {
  const ready = section.status === 'ready'
  const moduleLabel = ready
    ? `${section.modules.length} ${section.modules.length === 1 ? 'module' : 'modules'}`
    : 'Coming soon'

  const inner = (
    <div className="group flex items-start gap-5 p-5 md:p-7 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] transition-colors h-full data-[ready=true]:hover:bg-[var(--c-hover)]"
      data-ready={ready}
    >
      <span className="font-display text-[#b0e455] text-lg md:text-xl shrink-0 pt-0.5 tracking-widest tabular-nums">
        {section.num}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
          <h2 className="font-display text-[19px] md:text-[22px] text-[var(--c-text)] leading-snug">
            {section.title}
          </h2>
          <span
            className="text-[9px] uppercase tracking-widest font-medium rounded-full px-2 py-0.5 data-[ready=true]:text-[#4d8f1a] data-[ready=true]:dark:text-[#b0e455] data-[ready=true]:border-[#b0e455]/40 text-[var(--c-text4)] border border-[var(--c-border2)]"
            data-ready={ready}
          >
            {moduleLabel}
          </span>
        </div>
        <p className="text-[14px] md:text-[15px] text-[var(--c-text3)] leading-relaxed">
          {section.tagline}
        </p>
      </div>
      {ready && (
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4 text-[var(--c-text4)] shrink-0 mt-1.5 transition-transform group-hover:translate-x-0.5"
        >
          <path
            fillRule="evenodd"
            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </div>
  )

  return ready ? (
    <Link href={`/curriculum/${section.slug}`} className="block">
      {inner}
    </Link>
  ) : (
    <div className="opacity-55 cursor-default">{inner}</div>
  )
}

export default function CurriculumPage() {
  return (
    <main className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)]">
      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-6 md:px-8 py-5 border-b border-[var(--c-border)]">
        <Link
          href="/"
          className="text-[var(--c-text4)] hover:text-[var(--c-text)] transition-colors"
        >
          <ZanaLogo />
        </Link>
        <Link
          href="/apply"
          className="text-xs font-semibold tracking-wide text-[#4d8f1a] dark:text-[#b0e455] hover:opacity-80 transition-opacity"
        >
          Apply →
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-14 md:pt-20 pb-24">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="mb-12 md:mb-16">
          <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#4d8f1a] dark:text-[#b0e455] mb-3">
            The Curriculum
          </p>
          <h1
            className="font-display leading-[1.05] text-[var(--c-text)] mb-5"
            style={{ fontSize: 'clamp(36px, 5.5vw, 56px)' }}
          >
            Learn the system,
            <br />
            section by section.
          </h1>
          <p className="text-[16px] md:text-[17px] text-[var(--c-text3)] leading-relaxed max-w-xl">
            The whole thing runs on a small number of levers. Start with The Game,
            then go deeper on diet, training, and the lifestyle that ties it all
            together. More sections going live as I write them.
          </p>
        </header>

        {/* ── Sections ───────────────────────────────────────────────────── */}
        <div className="space-y-3">
          {SECTIONS.map((section) => (
            <SectionCard key={section.slug} section={section} />
          ))}
        </div>
      </div>
    </main>
  )
}
