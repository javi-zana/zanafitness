import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SECTIONS, getModule, Blocks } from '../../content'

export function generateStaticParams() {
  return SECTIONS.flatMap((s) =>
    s.modules.map((m) => ({ slug: s.slug, module: m.id }))
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; module: string }>
}): Promise<Metadata> {
  const { slug, module } = await params
  const found = getModule(slug, module)
  if (!found) return { title: 'Classroom | ZANA Fitness' }
  return {
    title: `${found.module.title} | ${found.section.title} | ZANA Fitness`,
  }
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ slug: string; module: string }>
}) {
  const { slug, module } = await params
  const found = getModule(slug, module)
  if (!found) notFound()

  const { section, module: mod, index } = found
  const prev = index > 0 ? section.modules[index - 1] : null
  const next = index < section.modules.length - 1 ? section.modules[index + 1] : null

  return (
    <main className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] pb-28 lg:pb-12 lg:pl-52">
      <div className="max-w-5xl mx-auto px-5 md:px-8 lg:flex lg:gap-12 pt-8 pb-16">
        {/* ── Sidebar: module list (the classroom nav) ──────────────────── */}
        <aside className="lg:w-64 lg:shrink-0 mb-10 lg:mb-0">
          <div className="lg:sticky lg:top-8">
            <Link
              href={`/classroom/${section.slug}`}
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--c-text3)] hover:text-[var(--c-text)] transition-colors mb-5"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path
                  fillRule="evenodd"
                  d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                  clipRule="evenodd"
                />
              </svg>
              {section.title}
            </Link>

            <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[var(--c-text4)] mb-3">
              Section {section.num}
            </p>

            <ol className="space-y-1">
              {section.modules.map((m, i) => {
                const active = m.id === mod.id
                return (
                  <li key={m.id}>
                    <Link
                      href={`/classroom/${section.slug}/${m.id}`}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-start gap-2.5 rounded-xl px-3 py-2.5 transition-colors ${
                        active
                          ? 'bg-[var(--c-card)] border border-[var(--c-border)]'
                          : 'hover:bg-[var(--c-card)]'
                      }`}
                    >
                      <span
                        className={`font-display text-sm tabular-nums shrink-0 w-5 ${
                          active ? 'text-[#b0e455]' : 'text-[var(--c-text4)]'
                        }`}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span
                        className={`text-[13.5px] leading-snug ${
                          active
                            ? 'text-[var(--c-text)] font-semibold'
                            : 'text-[var(--c-text3)]'
                        }`}
                      >
                        {m.title}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ol>
          </div>
        </aside>

        {/* ── Lesson content ────────────────────────────────────────────── */}
        <article className="flex-1 min-w-0 max-w-2xl">
          <header className="mb-10 pb-8 border-b border-[var(--c-border)]">
            <div className="flex items-center gap-2 mb-4 text-[11px] text-[var(--c-text4)]">
              <Link
                href="/classroom"
                className="hover:text-[var(--c-text)] transition-colors"
              >
                Classroom
              </Link>
              <span>/</span>
              <Link
                href={`/classroom/${section.slug}`}
                className="hover:text-[var(--c-text)] transition-colors"
              >
                {section.title}
              </Link>
            </div>

            <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#4d8f1a] dark:text-[#b0e455] mb-3">
              {mod.kicker}
            </p>
            <h1
              className="font-display leading-[1.08] text-[var(--c-text)]"
              style={{ fontSize: 'clamp(30px, 4.6vw, 44px)' }}
            >
              {mod.title}
            </h1>
          </header>

          <Blocks blocks={mod.blocks} />

          {/* ── Prev / next module ──────────────────────────────────────── */}
          <div className="mt-16 pt-10 border-t border-[var(--c-border)] grid grid-cols-2 gap-4">
            {prev ? (
              <Link
                href={`/classroom/${section.slug}/${prev.id}`}
                className="group rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] hover:bg-[var(--c-hover)] transition-colors p-5"
              >
                <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[var(--c-text4)] mb-2">
                  ← Previous
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
                href={`/classroom/${section.slug}/${next.id}`}
                className="group rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] hover:bg-[var(--c-hover)] transition-colors p-5 text-right"
              >
                <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[var(--c-text4)] mb-2">
                  Next →
                </p>
                <p className="font-display text-base md:text-lg text-[var(--c-text)] leading-snug group-hover:text-[#b0e455] transition-colors">
                  {next.title}
                </p>
              </Link>
            ) : (
              <Link
                href={`/classroom/${section.slug}`}
                className="group rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] hover:bg-[var(--c-hover)] transition-colors p-5 text-right col-start-2"
              >
                <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[var(--c-text4)] mb-2">
                  Done →
                </p>
                <p className="font-display text-base md:text-lg text-[var(--c-text)] leading-snug group-hover:text-[#b0e455] transition-colors">
                  Back to {section.title}
                </p>
              </Link>
            )}
          </div>
        </article>
      </div>
    </main>
  )
}
