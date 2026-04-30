'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Lock, X, ArrowUpRight } from 'lucide-react';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';

// ─── Logo ─────────────────────────────────────────────────────────────────────

const ZanaLogo = ({ className = "h-8" }: { className?: string }) => (
  <svg viewBox="0 0 180 32" className={className} fill="none" stroke="currentColor" strokeWidth="5" strokeMiterlimit="10">
    <path d="M0,2 H32 L18.3,14" />
    <path d="M13.7,18 L0,30 H32" />
    <path d="M48,30 L64,2 L80,30" />
    <path d="M96,30 V2 L128,30 V2" />
    <path d="M144,30 L160,2 L176,30" />
  </svg>
);

// ─── Modals ───────────────────────────────────────────────────────────────────

function WaitlistModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <div className="relative bg-[#162212] border border-[#b0e455]/15 rounded-3xl p-10 md:p-14 max-w-md w-full flex flex-col items-center text-center shadow-[0_0_120px_-20px_rgba(176,228,85,0.2)]" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-5 right-5 text-[#edf5e2]/30 hover:text-[#edf5e2] transition-colors"><X className="w-4 h-4" /></button>
        <ZanaLogo className="h-5 text-[#edf5e2] mb-10 opacity-40" />
        <div className="w-8 h-px bg-[#b0e455]/30 mb-8" />
        <p className="text-xs font-medium text-[#b0e455] mb-3 tracking-wider uppercase">You're on the list</p>
        <h2 className="text-2xl font-bold text-[#edf5e2] mb-4">We'll be in touch soon.</h2>
        <p className="text-sm text-[#edf5e2]/50 leading-relaxed">We'll reach out when slots open. Get ready.</p>
        <div className="w-8 h-px bg-[#b0e455]/10 mt-8 mb-8" />
        <p className="text-xs text-[#edf5e2]/30">Built for results. Not motivation.</p>
      </div>
    </div>
  );
}

function DuplicateModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <div className="relative bg-[#162212] border border-[#b0e455]/15 rounded-3xl p-10 md:p-14 max-w-md w-full flex flex-col items-center text-center" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-5 right-5 text-[#edf5e2]/30 hover:text-[#edf5e2] transition-colors"><X className="w-4 h-4" /></button>
        <ZanaLogo className="h-5 text-[#edf5e2] mb-10 opacity-40" />
        <p className="text-xs text-[#edf5e2]/40 mb-3">Already Registered</p>
        <h2 className="text-2xl font-bold text-[#edf5e2] mb-4">Love the commitment.</h2>
        <p className="text-sm text-[#edf5e2]/50 leading-relaxed">You're already on the list.<br />We'll reach out when it's time.</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle');

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    const res = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (res.ok) { setStatus('success'); setEmail(''); }
    else if (res.status === 409) { setStatus('duplicate'); }
    else { setStatus('error'); }
  };

  return (
    <main className="bg-[#0f1a0c] text-[#edf5e2] selection:bg-[#b0e455] selection:text-[#0f1a0c]">

      {status === 'success'   && <WaitlistModal   onClose={() => setStatus('idle')} />}
      {status === 'duplicate' && <DuplicateModal  onClose={() => setStatus('idle')} />}

      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-end pb-20 md:pb-28 overflow-hidden">

        {/* Background image */}
        <div className="absolute inset-0">
          <div className="w-full h-full bg-[url('/671A2489-147A-4CFB-9BE4-8E41C0B1B66A.PNG')] bg-cover bg-[60%_20%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f1a0c] via-[#0f1a0c]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f1a0c] via-[#0f1a0c]/40 to-transparent" />
        </div>

        {/* Top label */}
        <div className="absolute top-32 left-6 md:left-12 z-10">
          <span className="inline-flex items-center gap-2 bg-[#b0e455]/10 border border-[#b0e455]/20 rounded-full px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b0e455]" />
            <p className="text-xs font-medium text-[#b0e455]">Online Coaching Program</p>
          </span>
        </div>

        {/* Main content */}
        <div className="relative z-10 px-6 md:px-12 max-w-5xl">
          <h1 className="font-display leading-[0.95] mb-6" style={{ fontSize: "clamp(52px, 7vw, 88px)" }}>
            Lose 3-5%<br />
            <span className="text-[#b0e455]">Body Fat.</span><br />
            In 4 Months.
          </h1>
          <p className="text-base text-[#edf5e2]/60 mb-10 max-w-xs leading-relaxed">
            Without overhauling your life. A system built around how you actually live.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/system" className="inline-flex items-center gap-2 bg-[#b0e455] text-[#0f1a0c] px-7 py-3.5 rounded-full font-semibold text-sm hover:bg-[#c9f070] transition-colors">
              Get Started <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link href="/demo" className="inline-flex items-center gap-2 border border-[#edf5e2]/20 text-[#edf5e2] px-7 py-3.5 rounded-full text-sm hover:border-[#edf5e2]/40 hover:bg-[#edf5e2]/5 transition-colors">
              Preview the App
            </Link>
          </div>
        </div>

        {/* Bottom right credit */}
        <div className="absolute bottom-20 right-6 md:right-12 z-10 text-right">
          <p className="text-xs text-[#edf5e2]/35">Javier Lorenzana</p>
          <p className="text-xs text-[#edf5e2]/25 mt-0.5">Online Coach</p>
        </div>
      </section>

      {/* ── MARQUEE ───────────────────────────────────────────────────────── */}
      <div className="bg-[#b0e455] text-[#0f1a0c] py-3 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {Array(8).fill(null).map((_, i) => (
            <span key={i} className="text-sm font-semibold tracking-wide px-8">
              3-5% Body Fat &nbsp;·&nbsp; 4 Months &nbsp;·&nbsp; Direct Coaching &nbsp;·&nbsp; Real Results &nbsp;·&nbsp; No Fluff &nbsp;·&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ── WHO IT'S FOR ──────────────────────────────────────────────────── */}
      <section className="py-24 md:py-36 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end gap-12 md:gap-20">
            <div className="flex-1">
              <p className="text-xs font-semibold tracking-wider uppercase text-[#b0e455] mb-5">The Reality</p>
              <h2 className="font-display leading-none" style={{ fontSize: "clamp(40px, 5.5vw, 72px)" }}>
                You've built<br />a great life.<br />
                <span className="text-[#edf5e2]/40">Your body<br />hasn't kept up.</span>
              </h2>
            </div>
            <div className="md:w-80 space-y-5">
              <p className="text-base text-[#edf5e2]/60 leading-relaxed">
                Skinny-fat. Soft in clothes. Not where you want to be - despite having the income, the wardrobe, the career.
              </p>
              <div className="w-8 h-px bg-[#b0e455]/20" />
              <p className="text-base text-[#edf5e2]/45 leading-relaxed">
                You know what to do. You just never had a system that fit your actual life.
              </p>
              <p className="text-base font-semibold text-[#b0e455]">Now you do.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SPLIT - SYSTEM PILLARS ────────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[70vh]">
        <div className="relative h-[50vh] md:h-auto">
          <div className="absolute inset-0 bg-[url('/A502086F-E304-43B4-87C1-93658EDB79F0.PNG')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-[#0f1a0c]/25" />
        </div>
        <div className="bg-[#162212] flex flex-col justify-center px-10 md:px-16 py-16 border-l border-[#b0e455]/8">
          <p className="text-xs font-semibold tracking-wider uppercase text-[#b0e455] mb-8">How It Works</p>
          <h2 className="font-display leading-none mb-10" style={{ fontSize: "clamp(36px, 4.5vw, 60px)" }}>
            A system<br />built on<br />structure.
          </h2>
          <div className="space-y-8">
            {[
              { n: "01", title: "Training", desc: "Progressive split built for your schedule. 45-60 min sessions, no fluff, structured for the lean aesthetic look." },
              { n: "02", title: "Nutrition", desc: "Real food, clear macros. No extreme cuts. Fits your life in Singapore, Manila, Jakarta, or wherever you are." },
              { n: "03", title: "Guidance", desc: "Weekly check-ins. Constant adjustments. A coach who understands your world - the travel, the client dinners." },
            ].map(p => (
              <div key={p.n} className="flex gap-5 items-start">
                <span className="text-sm text-[#b0e455] mt-0.5 shrink-0 font-semibold">{p.n}</span>
                <div>
                  <p className="text-sm font-semibold text-[#edf5e2] mb-1">{p.title}</p>
                  <p className="text-sm text-[#edf5e2]/50 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FULL-WIDTH QUOTE ──────────────────────────────────────────────── */}
      <section className="relative py-28 md:py-44 px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0">
          <div className="w-full h-full bg-[url('/F52D6DDD-5F62-414C-9B2D-5E12C333F2D3.PNG')] bg-cover bg-[50%_30%]" />
          <div className="absolute inset-0 bg-[#0f1a0c]/88" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-wider uppercase text-[#b0e455] mb-8">The Outcome</p>
          <h2 className="font-display leading-none mb-6" style={{ fontSize: "clamp(36px, 5vw, 68px)" }}>
            Not a workout plan.<br />
            A system that fits<br />your life and gets<br />
            <span className="text-[#b0e455]">you lean.</span>
          </h2>
          <div className="mt-10 inline-flex items-center gap-3 bg-[#b0e455]/10 border border-[#b0e455]/25 rounded-full px-6 py-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b0e455]" />
            <p className="text-sm text-[#b0e455] font-medium">3-5% body fat · 4 months</p>
          </div>
        </div>
      </section>

      {/* ── APP PREVIEW ───────────────────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-12 bg-[#162212] border-y border-[#b0e455]/8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">

            {/* Mock phone */}
            <div className="w-full max-w-[240px] mx-auto md:mx-0 shrink-0">
              <div className="bg-[#0f1a0c] border border-[#b0e455]/12 rounded-3xl overflow-hidden shadow-[0_0_80px_-20px_rgba(176,228,85,0.18)]">
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#b0e455]/8">
                  <ZanaLogo className="h-3.5 text-[#edf5e2]" />
                  <span className="text-[9px] font-semibold px-2 py-0.5 bg-[#86efac]/10 border border-[#86efac]/25 text-[#86efac] rounded-full">Member</span>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-[10px] text-[#edf5e2]/35 uppercase tracking-wider mb-0.5">Welcome back</p>
                    <p className="text-sm font-semibold text-[#edf5e2]">Priya.</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-[#1c2e16] border border-[#b0e455]/8 rounded-xl p-2.5 text-center">
                      <p className="text-[9px] text-[#edf5e2]/35 uppercase mb-1">Streak</p>
                      <p className="text-base font-bold text-[#b0e455]">67<span className="text-[9px] text-[#edf5e2]/30 ml-0.5">d</span></p>
                    </div>
                    <div className="flex-1 bg-[#1c2e16] border border-[#b0e455]/8 rounded-xl p-2.5 text-center">
                      <p className="text-[9px] text-[#edf5e2]/35 uppercase mb-1">Phase</p>
                      <p className="text-base font-bold text-[#edf5e2]">03</p>
                    </div>
                    <div className="flex-1 bg-[#1c2e16] border border-[#b0e455]/8 rounded-xl p-2.5 text-center">
                      <p className="text-[9px] text-[#edf5e2]/35 uppercase mb-1">Check-ins</p>
                      <p className="text-base font-bold text-[#86efac]">12</p>
                    </div>
                  </div>
                  <div className="bg-[#1c2e16] border border-[#b0e455]/20 rounded-xl p-3">
                    <p className="text-[9px] text-[#b0e455] uppercase tracking-wide mb-1.5">Today</p>
                    <p className="text-xs font-semibold text-[#edf5e2]">Upper Body A</p>
                    <p className="text-[9px] text-[#edf5e2]/40 mt-0.5">6 exercises · 55 min</p>
                    <div className="mt-2.5 w-full bg-[#0f1a0c] rounded-full h-1">
                      <div className="bg-[#b0e455] h-1 rounded-full w-[45%]" />
                    </div>
                  </div>
                  <div className="bg-[#1c2e16] border border-[#b0e455]/8 rounded-xl p-3">
                    <p className="text-[9px] text-[#edf5e2]/35 uppercase mb-1.5">Coach's Note</p>
                    <p className="text-[10px] text-[#edf5e2]/60 leading-relaxed">Control the eccentric. Drop the ego.</p>
                  </div>
                </div>
                <div className="border-t border-[#b0e455]/8 flex">
                  {["Home","Programs","Community","Messages","Schedule"].map((t, i) => (
                    <div key={t} className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 ${i === 0 ? "text-[#b0e455]" : "text-[#edf5e2]/20"}`}>
                      <div className={`w-2.5 h-2.5 rounded-sm ${i === 0 ? "bg-[#b0e455]/30" : "bg-[#1c2e16]"}`} />
                      <span className="text-[5px] uppercase tracking-wide">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="flex-1">
              <p className="text-xs font-semibold tracking-wider uppercase text-[#b0e455] mb-5">Inside the Platform</p>
              <h2 className="font-display leading-none mb-8" style={{ fontSize: "clamp(36px, 4.5vw, 60px)" }}>
                Everything<br />you need.<br />
                <span className="text-[#edf5e2]/35">Nothing<br />you don't.</span>
              </h2>
              <div className="space-y-4 mb-10">
                {[
                  "Your training plan, updated as you progress",
                  "Weekly check-ins reviewed by Javi",
                  "Direct messaging - coach + community",
                  "Community feed to stay accountable",
                  "Weekly calendar & upcoming events",
                ].map(f => (
                  <div key={f} className="flex gap-3 items-center">
                    <div className="w-5 h-5 rounded-full bg-[#b0e455]/12 border border-[#b0e455]/25 flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                        <path d="M2 6l3 3 5-5" stroke="#b0e455" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <p className="text-sm text-[#edf5e2]/65">{f}</p>
                  </div>
                ))}
              </div>
              <Link href="/demo" className="inline-flex items-center gap-2 text-sm font-medium text-[#b0e455] hover:text-[#c9f070] transition-colors border border-[#b0e455]/25 px-6 py-3 rounded-full hover:border-[#b0e455]/50">
                Preview the App <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SPOTIFY ───────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-12 bg-[#0f1a0c]">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold tracking-wider uppercase text-[#b0e455] mb-3 text-center">Train to This</p>
          <h2 className="font-display text-center mb-2" style={{ fontSize: "clamp(28px, 3.5vw, 44px)" }}>My Personal Playlist</h2>
          <p className="text-sm text-[#edf5e2]/40 text-center mb-10">What I train to. What you'll train to.</p>
          <div className="rounded-3xl overflow-hidden border border-[#b0e455]/10">
            <iframe
              src="https://open.spotify.com/embed/playlist/6hJ4JJSCPrUbb0ZD17ntQJ?utm_source=generator&theme=0"
              width="100%" height="352"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* ── WAITLIST ──────────────────────────────────────────────────────── */}
      <section className="relative py-28 md:py-40 px-6 md:px-12 overflow-hidden bg-[#162212] border-t border-[#b0e455]/8">
        <div className="absolute inset-0 bg-[url('/asian_athlete_running_1777345213125.png')] bg-cover bg-center opacity-8" />
        <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 bg-[#b0e455]/10 border border-[#b0e455]/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b0e455]" />
            <p className="text-xs font-medium text-[#b0e455]">Limited Access</p>
          </span>
          <h2 className="font-display leading-none mb-5" style={{ fontSize: "clamp(40px, 6vw, 76px)" }}>
            Ready to<br />get <span className="text-[#b0e455]">lean?</span>
          </h2>
          <p className="text-base text-[#edf5e2]/50 mb-10 leading-relaxed">
            Join the waitlist. First access when doors open.
          </p>
          <form onSubmit={handleWaitlist} className="w-full flex flex-col gap-3">
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="Your email address"
              className="w-full bg-[#0f1a0c] border border-[#b0e455]/15 rounded-2xl px-6 py-4 text-sm text-[#edf5e2] placeholder-[#edf5e2]/25 focus:outline-none focus:border-[#b0e455]/40 transition-colors"
            />
            <button type="submit" disabled={status === 'loading'}
              className="w-full bg-[#b0e455] text-[#0f1a0c] font-semibold px-8 py-4 rounded-2xl text-sm hover:bg-[#c9f070] transition-colors disabled:opacity-50">
              {status === 'loading' ? 'Submitting...' : 'Join the Waitlist'}
            </button>
            {status === 'error' && <p className="text-xs text-red-400 text-center">Something went wrong. Try again.</p>}
          </form>
          <div className="flex items-center gap-2 mt-5 text-[#edf5e2]/30 text-xs">
            <Lock className="w-3 h-3" />
            <p>Limited first access.</p>
          </div>
        </div>
      </section>

      <Footer />

    </main>
  );
}
