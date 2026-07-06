'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

// Classroom read-tracking. localStorage only — progress is a reading aid,
// not coaching data, so it stays on the device. Key: "<sectionSlug>/<moduleId>" → epoch ms.
const KEY = 'zana_classroom_read'

function readMap(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, number>
  } catch {
    return {}
  }
}

/** Drop into a module page: records the visit. */
export function MarkRead({ slug, moduleId }: { slug: string; moduleId: string }) {
  useEffect(() => {
    const m = readMap()
    m[`${slug}/${moduleId}`] = Date.now()
    try {
      localStorage.setItem(KEY, JSON.stringify(m))
    } catch {
      /* private mode — tracking is best-effort */
    }
  }, [slug, moduleId])
  return null
}

/** Lime check shown next to modules the member has opened. */
export function ReadCheck({ slug, moduleId }: { slug: string; moduleId: string }) {
  const [read, setRead] = useState(false)
  useEffect(() => setRead(Boolean(readMap()[`${slug}/${moduleId}`])), [slug, moduleId])
  if (!read) return null
  return (
    <span className="w-5 h-5 rounded-full bg-[#b0e455]/15 flex items-center justify-center shrink-0" aria-label="Read">
      <svg viewBox="0 0 24 24" fill="none" stroke="#b0e455" strokeWidth="3" className="w-3 h-3">
        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

/** "3/6 read" chip for section cards on the classroom index. */
export function SectionProgress({ slug, moduleIds }: { slug: string; moduleIds: string[] }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const m = readMap()
    setCount(moduleIds.filter((id) => m[`${slug}/${id}`]).length)
  }, [slug, moduleIds])
  if (count === 0) return null
  const done = count === moduleIds.length
  return (
    <span
      className={`text-[9px] uppercase tracking-widest font-medium rounded-full px-2 py-0.5 border ${
        done
          ? 'text-[#4d8f1a] dark:text-[#b0e455] border-[#b0e455]/40'
          : 'text-[var(--c-text4)] border-[var(--c-border2)]'
      }`}
    >
      {done ? 'Completed' : `${count}/${moduleIds.length} read`}
    </span>
  )
}

type SectionData = { slug: string; title: string; modules: Array<{ id: string; title: string }> }

/** "Pick up where you left off" card for the classroom index. */
export function ContinueReading({ sections }: { sections: SectionData[] }) {
  const [target, setTarget] = useState<{ href: string; section: string; module: string } | null>(null)

  useEffect(() => {
    const m = readMap()
    let latest: { key: string; at: number } | null = null
    for (const [key, at] of Object.entries(m)) {
      if (!latest || at > latest.at) latest = { key, at }
    }
    if (!latest) return
    const [slug] = latest.key.split('/')
    const sec = sections.find((s) => s.slug === slug)
    if (!sec) return
    // Point at the next unread module in that section; if all read, stay quiet.
    const lastIdx = sec.modules.findIndex((mm) => `${slug}/${mm.id}` === latest!.key)
    const nextUnread =
      sec.modules.slice(lastIdx + 1).find((mm) => !m[`${slug}/${mm.id}`]) ??
      sec.modules.find((mm) => !m[`${slug}/${mm.id}`])
    if (!nextUnread) return
    setTarget({ href: `/classroom/${slug}/${nextUnread.id}`, section: sec.title, module: nextUnread.title })
  }, [sections])

  if (!target) return null
  return (
    <Link
      href={target.href}
      className="group flex items-center gap-4 mb-8 p-4 md:p-5 rounded-2xl border border-[#b0e455]/40 bg-[#b0e455]/8 hover:bg-[#b0e455]/12 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#4d8f1a] dark:text-[#b0e455] mb-1">
          Continue reading
        </p>
        <p className="font-display text-base md:text-lg text-[var(--c-text)] leading-snug truncate">
          {target.section} — {target.module}
        </p>
      </div>
      <span className="text-[var(--c-text3)] text-sm transition-transform group-hover:translate-x-0.5 shrink-0">→</span>
    </Link>
  )
}
