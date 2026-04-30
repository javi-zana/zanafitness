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
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-[#0f1a0c]/90 backdrop-blur-md border-b border-[#b0e455]/8">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <ZanaLogo className="h-5 text-[#edf5e2]" />
        </Link>

        {/* Desktop nav + CTAs (all right-aligned) */}
        <div className="hidden md:flex items-center gap-8">
          {LINKS.map(l => (
            <Link
              key={l.key}
              href={l.href}
              className={`text-sm font-medium transition-colors ${
                active === l.key ? "text-[#edf5e2]" : "text-[#edf5e2]/50 hover:text-[#edf5e2]"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <div className="flex items-center gap-3 pl-2 border-l border-[#b0e455]/15">
            <Link href="/login" className="text-sm font-medium text-[#edf5e2]/50 hover:text-[#edf5e2] transition-colors px-4 py-2">
              Log In
            </Link>
            <Link href="/system" className="text-sm font-semibold bg-[#b0e455] text-[#0f1a0c] px-5 py-2.5 rounded-full hover:bg-[#c9f070] transition-colors">
              Get Started
            </Link>
          </div>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-[#edf5e2]" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-[#0f1a0c] flex flex-col pt-24 px-8 md:hidden">
          <div className="flex flex-col gap-8">
            {LINKS.map(l => (
              <Link
                key={l.key}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`text-lg font-medium transition-colors ${
                  active === l.key ? "text-[#edf5e2]" : "text-[#edf5e2]/60 hover:text-[#edf5e2]"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-6 flex flex-col gap-3 border-t border-[#b0e455]/10">
              <Link href="/login" onClick={() => setOpen(false)} className="text-sm font-medium text-center py-3 border border-[#edf5e2]/15 text-[#edf5e2]/70 rounded-2xl">
                Log In
              </Link>
              <Link href="/system" onClick={() => setOpen(false)} className="text-sm font-semibold bg-[#b0e455] text-[#0f1a0c] py-3.5 rounded-2xl font-bold text-center">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
