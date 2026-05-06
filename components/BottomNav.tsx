'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useTheme } from '@/app/providers'

const NAV = [
  {
    href: '/dashboard',
    label: 'Home',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/stats',
    label: 'Track',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/program',
    label: 'Program',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path d="M9 12h6M9 16h6M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2M9 4a2 2 0 002 2h2a2 2 0 002-2M9 4a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/messages',
    label: 'Messages',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/community',
    label: 'Community',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const [unread, setUnread] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    async function checkUnread() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Collect all thread IDs: via member_id (legacy) and thread_participants
      const [{ data: legacyThread }, { data: participations }] = await Promise.all([
        supabase.from('threads').select('id').eq('member_id', user.id).maybeSingle(),
        supabase.from('thread_participants').select('thread_id').eq('user_id', user.id),
      ])
      const ids = Array.from(new Set([
        ...(legacyThread ? [legacyThread.id as string] : []),
        ...((participations ?? []).map(p => p.thread_id as string)),
      ]))
      if (!ids.length) { setUnread(false); return }

      const [{ data: reads }, { data: messages }] = await Promise.all([
        supabase.from('message_reads').select('thread_id, last_read_at').eq('user_id', user.id).in('thread_id', ids),
        supabase.from('messages').select('thread_id, created_at').in('thread_id', ids).neq('author_id', user.id).order('created_at', { ascending: false }).limit(ids.length),
      ])

      const readMap = Object.fromEntries((reads ?? []).map(r => [r.thread_id as string, r.last_read_at as string]))
      const hasUnread = (messages ?? []).some(m => {
        const read = readMap[m.thread_id as string]
        return !read || new Date(m.created_at as string) > new Date(read)
      })
      setUnread(hasUnread)
    }

    checkUnread()

    const channel = supabase.channel('bottomnav-unread')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, checkUnread)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'message_reads' }, checkUnread)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  function isActive(href: string) {
    return href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)
  }

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────────────── */}
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
              <p className="text-[9px] text-[var(--c-text4)] tracking-widest uppercase leading-none mt-1">Platform</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(item => {
            const active = isActive(item.href)
            const showBadge = item.href === '/messages' && unread
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  active
                    ? 'bg-[#b0e455] text-[#0b1509]'
                    : 'text-[var(--c-text3)] hover:text-[var(--c-text)] hover:bg-[var(--c-card)]'
                }`}
              >
                <span className={`relative ${active ? 'text-[#0b1509]' : ''}`}>
                  {item.icon}
                  {showBadge && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#f87171] rounded-full border-2 border-[var(--c-sidebar)]" />}
                </span>
                <span className="text-sm font-semibold">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Profile + footer */}
        <div className="px-3 py-4 border-t border-[var(--c-border)] space-y-0.5">
          <Link
            href="/profile"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              pathname === '/profile'
                ? 'bg-[#b0e455] text-[#0b1509]'
                : 'text-[var(--c-text3)] hover:text-[var(--c-text)] hover:bg-[var(--c-card)]'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 shrink-0">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
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

      {/* ── Mobile bottom bar ────────────────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--c-backdrop)] backdrop-blur-md border-t border-[var(--c-border)] flex z-50">
        {NAV.map(item => {
          const active = isActive(item.href)
          const showBadge = item.href === '/messages' && unread
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors"
            >
              <div className={`relative w-12 h-7 flex items-center justify-center rounded-full transition-all ${
                active ? 'bg-[#b0e455] text-[#0f1a0c]' : 'text-[var(--c-text4)]'
              }`}>
                {item.icon}
                {showBadge && <span className="absolute top-0 right-1.5 w-2 h-2 bg-[#f87171] rounded-full border border-[var(--c-backdrop)]" />}
              </div>
              <span className={`text-[9px] tracking-wide uppercase font-medium ${
                active ? 'text-[#b0e455]' : 'text-[var(--c-text4)]'
              }`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
