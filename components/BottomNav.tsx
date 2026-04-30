'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

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

  function isActive(href: string) {
    return href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)
  }

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex fixed right-0 top-0 h-screen w-72 flex-col bg-[#0b1509] border-l border-[#b0e455]/12 z-50">

        {/* Logo */}
        <div className="px-6 pt-8 pb-7 border-b border-[#b0e455]/8">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#b0e455] flex items-center justify-center shrink-0">
              <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" stroke="#0b1509" strokeWidth="5.5" strokeMiterlimit="10">
                <path d="M0,2 H32 L18.3,14" />
                <path d="M13.7,18 L0,30 H32" />
              </svg>
            </div>
            <div>
              <p className="text-[#edf5e2] font-bold text-xl tracking-tight leading-none">Zana</p>
              <p className="text-[10px] text-[#edf5e2]/30 tracking-widest uppercase leading-none mt-1.5">Fitness Platform</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {NAV.map(item => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                  active
                    ? 'bg-[#b0e455] text-[#0b1509]'
                    : 'text-[#edf5e2]/40 hover:text-[#edf5e2] hover:bg-[#162212]'
                }`}
              >
                <span className={active ? 'text-[#0b1509]' : ''}>{item.icon}</span>
                <span className="text-base font-semibold">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Profile + footer */}
        <div className="px-4 py-5 border-t border-[#b0e455]/8 space-y-1">
          <Link
            href="/profile"
            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
              pathname === '/profile'
                ? 'bg-[#b0e455] text-[#0b1509]'
                : 'text-[#edf5e2]/40 hover:text-[#edf5e2] hover:bg-[#162212]'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 shrink-0">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-base font-semibold">Profile</span>
          </Link>
          <p className="text-[10px] text-[#edf5e2]/15 uppercase tracking-widest px-4 pt-2">© 2026 Zana Fitness</p>
        </div>
      </aside>

      {/* ── Mobile bottom bar ────────────────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0f1a0c]/95 backdrop-blur-md border-t border-[#b0e455]/8 flex z-50">
        {NAV.map(item => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors"
            >
              <div className={`w-12 h-7 flex items-center justify-center rounded-full transition-all ${
                active ? 'bg-[#b0e455] text-[#0f1a0c]' : 'text-[#edf5e2]/25'
              }`}>
                {item.icon}
              </div>
              <span className={`text-[9px] tracking-wide uppercase font-medium ${
                active ? 'text-[#b0e455]' : 'text-[#edf5e2]/25'
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
