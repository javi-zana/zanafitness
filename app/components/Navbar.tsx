"use client";

import Link from "next/link";
import { useState } from "react";
import { X, Menu } from "lucide-react";

const ZIcon = ({ className = "h-8" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" stroke="currentColor" strokeWidth="5" strokeMiterlimit="10">
    <path d="M0,2 H32 L18.3,14" />
    <path d="M13.7,18 L0,30 H32" />
  </svg>
);

export default function Navbar({ active }: { active?: "about" | "system" | "faq" }) {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/about", label: "About", key: "about" },
    { href: "/system", label: "The System", key: "system" },
    { href: "/faq", label: "FAQ", key: "faq" },
  ];

  return (
    <>
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-8 md:px-16 border-b border-[#2d3a4b]/50">
        <Link href="/" onClick={() => setOpen(false)}>
          <ZIcon className="h-5 md:h-6 text-white" />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center space-x-12 text-[10px] tracking-[0.2em] uppercase font-semibold text-gray-300">
          {links.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              className={`hover:text-white transition-colors ${active === l.key ? "text-white" : ""}`}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/login" className="font-mono text-[10px] tracking-[0.2em] uppercase font-bold px-6 py-2.5 rounded-full bg-[#1e2d3d] text-white border border-[#2d3a4b] hover:bg-[#2d3a4b] transition-colors">
            Log In
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white p-1"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {open && (
        <div className="fixed inset-0 z-40 bg-[#121821] flex flex-col pt-28 px-8 md:hidden">
          <div className="flex flex-col gap-8 text-[11px] uppercase tracking-[0.2em] font-semibold text-gray-300">
            {links.map((l) => (
              <Link
                key={l.key}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`hover:text-white transition-colors ${active === l.key ? "text-white" : ""}`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="mt-4 bg-[#1e2d3d] text-white font-bold px-8 py-4 rounded-full text-center border border-[#2d3a4b] hover:bg-[#2d3a4b] transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
