import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SECTIONS, getSection, Blocks } from '../content'

export function generateStaticParams() {
  return SECTIONS.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const section = getSection(slug)
  if (!section) return { title: 'Curriculum | ZANA Fitness' }
  return {
    title: `${section.title} | The Curriculum | ZANA Fitness`,
    description: section.summary,
  }
}

function BackLink() {
  return (
    <Link
      href="/curriculum"
      className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--c-text3)] hover:text-[var(--c-text)] transition-colors"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
        <path
          fillRule="evenodd"
          d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
          clipRule="evenodd"
        />
      </svg>
      All sections
    </Link>
  )
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const section = getSection(slug)
  if (!section) notFound()

  const idx = SECTIONS.findIndex((s) => s.slug === section.slug)
  const prev = idx > 0 ? SECTIONS[idx - 1] : null
  const next = idx < SECTIONS.length - 1 ? SECTIONS[idx + 1] : null

  return (
    <main className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)]">
      <div className="max-w-2xl mx-auto px-5 md:px-8 pt-8">
        <BackLink />
      </div>

      <article className="max-w-2xl mx-auto px-5 md:px-8 pt-10 md:pt-14 pb-16">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header className="mb-12 pb-10 border-b border-[var(--c-border)]">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#4d8f1a] dark:text-[#b0e455]">
              Section {section.num}
            </span>
            {section.readTime && (
              <>
                <span className="w-1 h-1 rounded-full bg-[var(--c-text4)]" />
                <span className="text-[11px] text-[var(--c-text4)]">{section.readTime}</span>
              </>
            )}
          </div>

          <h1
            className="font-display leading-[1.05] text-[var(--c-text)] mb-5"
            style={{ fontSize: 'clamp(34px, 5.2vw, 52px)' }}
          >
            {section.title}
          </h1>

          <p className="text-[16px] md:text-[17px] text-[var(--c-text3)] leading-relaxed italic">
            {section.tagline}
          </p>
        </header>

        {section.status === 'soon' ? (
          /* ── Coming soon ──────────────────────────────────────────────── */
          <div className="text-[16px] md:text-[17px] leading-[1.75] text-[var(--c-text2)] space-y-5">
            <p>{section.summary}</p>
            <div className="my-2 border-l-2 border-[#b0e455] pl-5 py-1">
              <p className="font-display text-lg md:text-xl leading-snug text-[var(--c-text)]">
                This section is being written. Check back soon.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* ── Intro ──────────────────────────────────────────────────── */}
            <p className="text-[17px] md:text-[18px] leading-[1.7] text-[var(--c-text2)] mb-8">
              {section.summary}
            </p>

            {section.intro && (
              <div className="space-y-5 text-[16px] md:text-[17px] leading-[1.75] text-[var(--c-text2)] mb-12">
                <Blocks blocks={section.intro} />
              </div>
            )}

            {/* ── Module contents (jump nav) ─────────────────────────────── */}
            {section.modules.length > 1 && (
              <nav className="mb-14 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] p-5 md:p-6">
                <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[var(--c-text4)] mb-4">
                  In this section
                </p>
                <ol className="space-y-2.5">
                  {section.modules.map((m, i) => (
                    <li key={m.id}>
                      <a
                        href={`#${m.id}`}
                        className="group flex items-baseline gap-3 text-[var(--c-text2)] hover:text-[var(--c-text)] transition-colors"
                      >
                        <span className="font-display text-[#b0e455] text-sm tabular-nums shrink-0 w-6">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="text-[15px] md:text-base font-medium group-hover:underline underline-offset-4">
                          {m.title}
                        </span>
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            {/* ── Modules ────────────────────────────────────────────────── */}
            {section.modules.map((m) => (
              <section key={m.id} id={m.id} className="scroll-mt-8 mb-16 last:mb-0">
                <header className="mb-8">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#4d8f1a] dark:text-[#b0e455]">
                      {m.kicker}
                    </span>
                    <span className="h-px w-8 bg-[var(--c-border2)]" />
                  </div>
                  <h2
                    className="font-display leading-[1.1] text-[var(--c-text)]"
                    style={{ fontSize: 'clamp(26px, 3.6vw, 36px)' }}
                  >
                    {m.title}
                  </h2>
                </header>
                <Blocks blocks={m.blocks} />
              </section>
            ))}
          </>
        )}

        {/* ── Pager ──────────────────────────────────────────────────────── */}
        <div className="mt-20 pt-10 border-t border-[var(--c-border)] grid grid-cols-2 gap-4">
          {prev ? (
            <Link
              href={`/curriculum/${prev.slug}`}
              className="group rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] hover:bg-[var(--c-hover)] transition-colors p-5"
            >
              <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[var(--c-text4)] mb-2">
                ← Section {prev.num}
              </p>
              <p className="font-display text-base md:text-lg text-[var(--c-text)] leading-snug group-hover:text-[#b0e455] transition-colors">
                {prev.title}
              </p>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              href={`/curriculum/${next.slug}`}
              className="group rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] hover:bg-[var(--c-hover)] transition-colors p-5 text-right"
            >
              <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[var(--c-text4)] mb-2">
                Section {next.num} →
              </p>
              <p className="font-display text-base md:text-lg text-[var(--c-text)] leading-snug group-hover:text-[#b0e455] transition-colors">
                {next.title}
              </p>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </article>
    </main>
  )
}
