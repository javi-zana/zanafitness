"use client";

import Link from "next/link";
import { useState } from "react";
import { X, Menu } from "lucide-react";

const ZanaLogo = ({ className = "h-5" }: { className?: string }) => (
  <svg viewBox="0 0 180 32" className={className} fill="none" stroke="currentColor" strokeWidth="5" strokeMiterlimit="10">
    <path d="M0,2 H32 L18.3,14" />
    <path d="M13.7,18 L0,30 H32" />
    <path d="M48,30 L64,2 L80,30" />
    <path d="M96,30 V2 L128,30 V2" />
    <path d="M144,30 L160,2 L176,30" />
  </svg>
);

const LINKS = [
  { href: "/about",  label: "About",      key: "about"  },
  { href: "/system", label: "The System", key: "system" },
  { href: "/demo",   label: "Preview",    key: "demo"   },
  { href: "/faq",    label: "FAQ",        key: "faq"    },
];

export default function Navbar({ active }: { active?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-[var(--c-backdrop)] backdrop-blur-md border-b border-[var(--c-border)]">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <ZanaLogo className="h-5 text-[var(--c-text)]" />
        </Link>

        {/* Desktop nav + CTAs */}
        <div className="hidden md:flex items-center gap-8">
          {LINKS.map(l => (
            <Link
              key={l.key}
              href={l.href}
              className={`text-sm font-medium transition-colors ${
                active === l.key
                  ? "text-[var(--c-text)]"
                  : "text-[var(--c-text3)] hover:text-[var(--c-text)]"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <div className="flex items-center gap-3 pl-2 border-l border-[var(--c-border2)]">
            <Link href="/login" className="text-sm font-medium text-[var(--c-text3)] hover:text-[var(--c-text)] transition-colors px-4 py-2">
              Log In
            </Link>
            <Link href="/system" className="text-sm font-semibold bg-[#b0e455] text-[#0f1a0c] px-5 py-2.5 rounded-full hover:bg-[#c9f070] transition-colors">
              Get Started
            </Link>
          </div>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-[var(--c-text)]" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-[var(--c-bg)] flex flex-col pt-24 px-8 md:hidden">
          <div className="flex flex-col gap-8">
            {LINKS.map(l => (
              <Link
                key={l.key}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`text-lg font-medium transition-colors ${
                  active === l.key
                    ? "text-[var(--c-text)]"
                    : "text-[var(--c-text3)] hover:text-[var(--c-text)]"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-6 flex flex-col gap-3 border-t border-[var(--c-border)]">
              <Link href="/login" onClick={() => setOpen(false)} className="text-sm font-medium text-center py-3 border border-[var(--c-border2)] text-[var(--c-text2)] rounded-2xl">
                Log In
              </Link>
              <Link href="/system" onClick={() => setOpen(false)} className="text-sm font-bold bg-[#b0e455] text-[#0f1a0c] py-3.5 rounded-2xl text-center">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
