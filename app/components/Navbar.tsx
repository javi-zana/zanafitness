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
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 bg-[#0f0f0f]/85 backdrop-blur-md border-b border-white/5">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <ZanaLogo className="h-5 text-white" />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {LINKS.map(l => (
            <Link
              key={l.key}
              href={l.href}
              className={`font-mono text-[9px] tracking-[0.2em] uppercase transition-colors ${
                active === l.key ? "text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="font-mono text-[9px] tracking-widest uppercase text-gray-400 hover:text-white transition-colors px-4 py-2">
            Log In
          </Link>
          <Link href="/system" className="font-mono text-[9px] tracking-widest uppercase bg-[#b3cdff] text-[#0f0f0f] px-5 py-2.5 rounded-full font-bold hover:bg-white transition-colors">
            Get Started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-white" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-[#0f0f0f] flex flex-col pt-24 px-8 md:hidden">
          <div className="flex flex-col gap-8">
            {LINKS.map(l => (
              <Link
                key={l.key}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`font-mono text-[11px] tracking-[0.2em] uppercase transition-colors ${
                  active === l.key ? "text-white" : "text-gray-300 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-6 flex flex-col gap-3 border-t border-[#242424]">
              <Link href="/login" onClick={() => setOpen(false)} className="font-mono text-[10px] tracking-widest uppercase text-center py-3 border border-[#2e2e2e] text-gray-300 rounded-full">
                Log In
              </Link>
              <Link href="/system" onClick={() => setOpen(false)} className="font-mono text-[10px] tracking-widest uppercase bg-[#b3cdff] text-[#0f0f0f] py-3.5 rounded-full font-bold text-center">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
