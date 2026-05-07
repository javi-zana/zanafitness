"use client";

import Link from 'next/link';

const ZanaLogo = ({ className = "h-5" }: { className?: string }) => (
  <svg viewBox="0 0 180 32" className={className} fill="none" stroke="currentColor" strokeWidth="5" strokeMiterlimit="10">
    <path d="M0,2 H32 L18.3,14" />
    <path d="M13.7,18 L0,30 H32" />
    <path d="M48,30 L64,2 L80,30" />
    <path d="M96,30 V2 L128,30 V2" />
    <path d="M144,30 L160,2 L176,30" />
  </svg>
);

export default function PasswordConfirmedPage() {
  return (
    <main className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] flex flex-col">

      <nav className="flex items-center justify-between px-8 py-5 border-b border-[var(--c-border)]">
        <Link href="/" className="text-[var(--c-text)]"><ZanaLogo className="h-5" /></Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm text-center">

          {/* Check icon */}
          <div className="w-16 h-16 rounded-full bg-[#b0e455]/10 border border-[#b0e455]/20 flex items-center justify-center mx-auto mb-8">
            <svg viewBox="0 0 24 24" fill="none" stroke="#b0e455" strokeWidth="2" className="w-7 h-7">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <span className="inline-flex items-center gap-2 bg-[var(--c-accent-text)]/8 border border-[var(--c-border2)] rounded-full px-4 py-1.5 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--c-accent-text)]" />
            <p className="text-xs font-medium text-[var(--c-accent-text)]">You&apos;re all set</p>
          </span>

          <h1 className="font-display leading-none mb-3" style={{ fontSize: 'clamp(32px, 5vw, 48px)' }}>
            Password set.
          </h1>
          <p className="text-sm text-[var(--c-text3)] leading-relaxed mb-10">
            Now let's set up your profile<br />so we can build your program.
          </p>

          <Link
            href="/onboarding"
            className="block w-full bg-[#b0e455] text-[#0f1a0c] font-semibold text-sm py-4 rounded-2xl hover:bg-[#c9f070] transition-colors text-center"
          >
            Continue
          </Link>

        </div>
      </div>

    </main>
  );
}
