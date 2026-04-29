'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Lock, X, Menu, ArrowUpRight } from 'lucide-react';

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
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <div className="relative bg-[#0f141b] border border-[#2d3a4b] rounded-2xl p-10 md:p-14 max-w-md w-full flex flex-col items-center text-center shadow-[0_0_120px_-20px_rgba(179,205,255,0.2)]" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
        <ZanaLogo className="h-5 text-white mb-10 opacity-50" />
        <div className="w-6 h-px bg-[#b3cdff] mb-10" />
        <p className="font-mono text-[9px] uppercase tracking-widest text-[#b3cdff] mb-4">Access Requested</p>
        <h2 className="text-2xl font-light tracking-[0.08em] uppercase text-white mb-5">You're on the list.</h2>
        <p className="font-mono text-[10px] uppercase tracking-widest text-gray-500 leading-loose">We'll reach out when slots open.</p>
        <div className="w-6 h-px bg-[#2d3a4b] mt-10 mb-10" />
        <p className="font-mono text-[9px] uppercase tracking-widest text-gray-600">Built for results. Not motivation.</p>
      </div>
    </div>
  );
}

function DuplicateModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <div className="relative bg-[#0f141b] border border-[#2d3a4b] rounded-2xl p-10 md:p-14 max-w-md w-full flex flex-col items-center text-center" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
        <ZanaLogo className="h-5 text-white mb-10 opacity-50" />
        <p className="font-mono text-[9px] uppercase tracking-widest text-gray-500 mb-4">Already Registered</p>
        <h2 className="text-2xl font-light tracking-[0.08em] uppercase text-white mb-5">I love how committed you are.</h2>
        <p className="font-mono text-[10px] uppercase tracking-widest text-gray-500 leading-loose">You're already on the list.<br />We'll reach out when it's time.</p>
      </div>
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 bg-[#0b0e14]/80 backdrop-blur-md border-b border-white/5">
        <Link href="/" className="flex items-center gap-3">
          <ZanaLogo className="h-5 text-white" />
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {[{href:"/about",label:"About"},{href:"/system",label:"The System"},{href:"/demo",label:"Preview"},{href:"/faq",label:"FAQ"}].map(l => (
            <Link key={l.href} href={l.href} className="font-mono text-[9px] tracking-[0.2em] uppercase text-gray-400 hover:text-white transition-colors">{l.label}</Link>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="font-mono text-[9px] tracking-widest uppercase text-gray-400 hover:text-white transition-colors px-4 py-2">Log In</Link>
          <Link href="/system" className="font-mono text-[9px] tracking-widest uppercase bg-[#b3cdff] text-[#0b0e14] px-5 py-2.5 rounded-full font-bold hover:bg-white transition-colors">Get Started</Link>
        </div>
        <button className="md:hidden text-white" onClick={() => setOpen(!open)}>{open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
      </nav>
      {open && (
        <div className="fixed inset-0 z-40 bg-[#0b0e14] flex flex-col pt-24 px-8 md:hidden">
          <div className="flex flex-col gap-8">
            {[{href:"/about",label:"About"},{href:"/system",label:"The System"},{href:"/demo",label:"Preview"},{href:"/faq",label:"FAQ"}].map(l => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="font-mono text-[11px] tracking-[0.2em] uppercase text-gray-300 hover:text-white transition-colors">{l.label}</Link>
            ))}
            <div className="pt-6 flex flex-col gap-3 border-t border-[#1e2a38]">
              <Link href="/login" onClick={() => setOpen(false)} className="font-mono text-[10px] tracking-widest uppercase text-center py-3 border border-[#2d3a4b] text-gray-300 rounded-full">Log In</Link>
              <Link href="/system" onClick={() => setOpen(false)} className="font-mono text-[10px] tracking-widest uppercase bg-[#b3cdff] text-[#0b0e14] py-3.5 rounded-full font-bold text-center">Get Started</Link>
            </div>
          </div>
        </div>
      )}
    </>
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
    <main className="bg-[#0b0e14] text-white selection:bg-[#b3cdff] selection:text-[#0b0e14]">

      {status === 'success'   && <WaitlistModal   onClose={() => setStatus('idle')} />}
      {status === 'duplicate' && <DuplicateModal  onClose={() => setStatus('idle')} />}

      <Nav />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-end pb-20 md:pb-28 overflow-hidden">

        {/* Background image */}
        <div className="absolute inset-0">
          <div className="w-full h-full bg-[url('/671A2489-147A-4CFB-9BE4-8E41C0B1B66A.PNG')] bg-cover bg-[60%_20%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0e14] via-[#0b0e14]/40 to-transparent" />
        </div>

        {/* Top label */}
        <div className="absolute top-32 left-6 md:left-12 z-10">
          <p className="font-mono text-[8px] tracking-[0.4em] uppercase text-[#b3cdff]">Online Coaching Program</p>
        </div>

        {/* Main content */}
        <div className="relative z-10 px-6 md:px-12 max-w-5xl">
          <h1 className="font-display leading-[0.92] uppercase mb-8" style={{ fontSize: "clamp(72px, 13vw, 180px)" }}>
            Lose<br />
            <span className="text-[#b3cdff]">3–5%</span><br />
            Body Fat.<br />
            <span className="text-gray-400">In 4 Months.</span>
          </h1>
          <p className="font-mono text-[10px] md:text-xs tracking-[0.3em] uppercase text-gray-400 mb-10 max-w-xs">
            Without overhauling your life.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/system" className="font-mono text-[9px] tracking-widest uppercase bg-[#b3cdff] text-[#0b0e14] px-8 py-4 rounded-full font-bold hover:bg-white transition-colors inline-flex items-center gap-2">
              Get Started <ArrowUpRight className="w-3 h-3" />
            </Link>
            <Link href="/demo" className="font-mono text-[9px] tracking-widest uppercase border border-white/20 text-white px-8 py-4 rounded-full hover:border-white/50 hover:bg-white/5 transition-colors">
              Preview the App
            </Link>
          </div>
        </div>

        {/* Bottom right stat */}
        <div className="absolute bottom-20 right-6 md:right-12 z-10 text-right">
          <p className="font-mono text-[8px] tracking-[0.3em] uppercase text-gray-500">Javier Lorenzana</p>
          <p className="font-mono text-[8px] tracking-[0.3em] uppercase text-gray-600 mt-1">Online Coach</p>
        </div>
      </section>

      {/* ── MARQUEE ───────────────────────────────────────────────────────── */}
      <div className="bg-[#b3cdff] text-[#0b0e14] py-3.5 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {Array(8).fill(null).map((_, i) => (
            <span key={i} className="font-display text-sm tracking-[0.2em] uppercase px-8">
              3–5% Body Fat &nbsp;·&nbsp; 4 Months &nbsp;·&nbsp; Direct Coaching &nbsp;·&nbsp; Real Results &nbsp;·&nbsp; No Fluff &nbsp;·&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ── PROBLEM ───────────────────────────────────────────────────────── */}
      <section className="py-28 md:py-40 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end gap-12 md:gap-20">
            <div className="flex-1">
              <p className="font-mono text-[8px] tracking-[0.4em] uppercase text-[#b3cdff] mb-6">The Reality</p>
              <h2 className="font-display leading-none uppercase" style={{ fontSize: "clamp(48px, 7vw, 96px)" }}>
                You've got<br />everything<br />figured out.<br />
                <span className="text-gray-500">Except<br />your body.</span>
              </h2>
            </div>
            <div className="md:w-72 space-y-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400 leading-loose">
                Skinny-fat. Soft in clothes. Not where you want to be.
              </p>
              <div className="w-8 h-px bg-[#2d3a4b]" />
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500 leading-loose">
                You know what to do. You just never had a system.
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#b3cdff]">Now you do.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SPLIT IMAGE ───────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[70vh]">
        <div className="relative h-[50vh] md:h-auto">
          <div className="absolute inset-0 bg-[url('/A502086F-E304-43B4-87C1-93658EDB79F0.PNG')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-[#0b0e14]/20" />
        </div>
        <div className="bg-[#0f141b] flex flex-col justify-center px-10 md:px-16 py-16 border-l border-[#1e2a38]">
          <p className="font-mono text-[8px] tracking-[0.4em] uppercase text-[#b3cdff] mb-8">The System</p>
          <h2 className="font-display leading-none uppercase mb-10" style={{ fontSize: "clamp(40px, 5vw, 72px)" }}>
            A framework<br />built on<br />structure.
          </h2>
          <div className="space-y-6">
            {[
              { n: "01", title: "Training", desc: "Progressive split built for your schedule. 45–60 min sessions. No fluff." },
              { n: "02", title: "Nutrition", desc: "Real food, clear macros. No extreme cuts. Fits your life wherever you are." },
              { n: "03", title: "Guidance", desc: "Weekly check-ins. Constant adjustments. A coach in your corner." },
            ].map(p => (
              <div key={p.n} className="flex gap-5 items-start">
                <span className="font-mono text-[9px] tracking-widest text-[#b3cdff] mt-0.5 shrink-0">{p.n}</span>
                <div>
                  <p className="font-mono text-[9px] tracking-widest uppercase text-white mb-1">{p.title}</p>
                  <p className="font-mono text-[9px] text-gray-500 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUOTE BREAK ───────────────────────────────────────────────────── */}
      <section className="relative py-32 md:py-48 px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0">
          <div className="w-full h-full bg-[url('/F52D6DDD-5F62-414C-9B2D-5E12C333F2D3.PNG')] bg-cover bg-[50%_30%]" />
          <div className="absolute inset-0 bg-[#0b0e14]/85" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p className="font-mono text-[8px] tracking-[0.4em] uppercase text-[#b3cdff] mb-10">The Result</p>
          <h2 className="font-display leading-none uppercase mb-6" style={{ fontSize: "clamp(40px, 6vw, 88px)" }}>
            Not a workout plan.<br />
            A system that fits<br />your life and gets<br />
            <span className="text-[#b3cdff]">you lean.</span>
          </h2>
          <div className="mt-12 inline-block border border-[#b3cdff]/30 rounded-full px-8 py-3">
            <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#b3cdff]">3–5% body fat · 4 months</p>
          </div>
        </div>
      </section>

      {/* ── APP PREVIEW ───────────────────────────────────────────────────── */}
      <section className="py-28 px-6 md:px-12 bg-[#0f141b] border-y border-[#1e2a38]">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">

            {/* Mock phone */}
            <div className="w-full max-w-[240px] mx-auto md:mx-0 shrink-0">
              <div className="bg-[#0a0f16] border border-[#2d3a4b] rounded-2xl overflow-hidden shadow-[0_0_80px_-20px_rgba(179,205,255,0.15)]">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a222c]">
                  <ZanaLogo className="h-3.5 text-white" />
                  <span className="font-mono text-[6px] tracking-widest uppercase px-2 py-0.5 border border-[#86efac]/30 text-[#86efac] rounded-sm">Member</span>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <p className="font-mono text-[7px] text-gray-600 uppercase tracking-widest">Welcome back</p>
                    <p className="text-sm font-light text-white uppercase mt-0.5">Priya.</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-[#121821] border border-[#2d3a4b] rounded p-2.5 text-center">
                      <p className="font-mono text-[6px] text-gray-600 uppercase mb-1">Streak</p>
                      <p className="text-base font-light text-[#b3cdff]">67<span className="text-[8px] text-gray-500 ml-0.5">d</span></p>
                    </div>
                    <div className="flex-1 bg-[#121821] border border-[#2d3a4b] rounded p-2.5 text-center">
                      <p className="font-mono text-[6px] text-gray-600 uppercase mb-1">Phase</p>
                      <p className="text-base font-light text-white">03</p>
                    </div>
                    <div className="flex-1 bg-[#121821] border border-[#2d3a4b] rounded p-2.5 text-center">
                      <p className="font-mono text-[6px] text-gray-600 uppercase mb-1">Check-ins</p>
                      <p className="text-base font-light text-[#86efac]">12</p>
                    </div>
                  </div>
                  <div className="bg-[#121821] border border-[#b3cdff]/20 rounded p-3">
                    <p className="font-mono text-[6px] text-[#b3cdff] uppercase tracking-widest mb-1.5">Today</p>
                    <p className="text-xs text-white">Upper Body A</p>
                    <p className="font-mono text-[7px] text-gray-500 mt-0.5">6 exercises · 55 min</p>
                    <div className="mt-2 w-full bg-[#0f141b] rounded-full h-0.5">
                      <div className="bg-[#b3cdff] h-0.5 rounded-full w-[45%]" />
                    </div>
                  </div>
                  <div className="bg-[#121821] border border-[#2d3a4b] rounded p-3">
                    <p className="font-mono text-[6px] text-gray-600 uppercase mb-2">Coach's Note</p>
                    <p className="font-mono text-[8px] text-gray-400 leading-relaxed">Control the eccentric. Drop the ego.</p>
                  </div>
                </div>
                <div className="border-t border-[#1a222c] flex">
                  {["Home","Programs","Community","Messages","Schedule"].map((t, i) => (
                    <div key={t} className={`flex-1 py-2 flex flex-col items-center gap-0.5 ${i === 0 ? "text-[#b3cdff]" : "text-gray-700"}`}>
                      <div className={`w-2.5 h-2.5 rounded-sm ${i === 0 ? "bg-[#b3cdff]/30" : "bg-[#1e2a38]"}`} />
                      <span className="font-mono text-[4.5px] uppercase">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="flex-1">
              <p className="font-mono text-[8px] tracking-[0.4em] uppercase text-[#b3cdff] mb-6">Inside the Platform</p>
              <h2 className="font-display leading-none uppercase mb-8" style={{ fontSize: "clamp(40px, 5vw, 72px)" }}>
                Everything<br />you need.<br />
                <span className="text-gray-500">Nothing<br />you don't.</span>
              </h2>
              <div className="space-y-4 mb-10">
                {[
                  "Your training plan, updated as you progress",
                  "Weekly check-ins reviewed by Javi",
                  "Direct messaging — coach + community",
                  "Community feed to stay accountable",
                  "Weekly calendar & upcoming events",
                ].map(f => (
                  <div key={f} className="flex gap-3 items-center">
                    <div className="w-1 h-1 rounded-full bg-[#b3cdff] shrink-0" />
                    <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-gray-400">{f}</p>
                  </div>
                ))}
              </div>
              <Link href="/demo" className="inline-flex items-center gap-2 font-mono text-[9px] tracking-widest uppercase text-[#b3cdff] hover:text-white transition-colors border border-[#b3cdff]/30 px-6 py-3 rounded-full hover:border-[#b3cdff]/60">
                Preview the App <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SPOTIFY ───────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-12 bg-[#0b0e14]">
        <div className="max-w-2xl mx-auto">
          <p className="font-mono text-[8px] tracking-[0.4em] uppercase text-[#b3cdff] mb-4 text-center">Train to This</p>
          <h2 className="font-display text-center uppercase mb-2" style={{ fontSize: "clamp(32px, 4vw, 56px)" }}>My Personal Playlist</h2>
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-gray-600 text-center mb-10">What I train to. What you'll train to.</p>
          <div className="rounded-2xl overflow-hidden border border-[#1e2a38]">
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
      <section className="relative py-32 md:py-40 px-6 md:px-12 overflow-hidden bg-[#0f141b] border-t border-[#1e2a38]">
        <div className="absolute inset-0 bg-[url('/asian_athlete_running_1777345213125.png')] bg-cover bg-center opacity-10" />
        <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center text-center">
          <p className="font-mono text-[8px] tracking-[0.4em] uppercase text-[#b3cdff] mb-6">Limited Access</p>
          <h2 className="font-display leading-none uppercase mb-4" style={{ fontSize: "clamp(48px, 7vw, 96px)" }}>
            Ready<br />to get<br /><span className="text-[#b3cdff]">lean?</span>
          </h2>
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-gray-500 mb-12 leading-loose">
            Join the waitlist. First access when doors open.
          </p>
          <form onSubmit={handleWaitlist} className="w-full flex flex-col gap-3">
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="Your email address"
              className="w-full bg-[#0b0e14] border border-[#2d3a4b] rounded-full font-mono px-6 py-4 text-xs tracking-[0.1em] text-white placeholder-gray-600 focus:outline-none focus:border-[#b3cdff]/50 transition-colors"
            />
            <button type="submit" disabled={status === 'loading'}
              className="w-full bg-[#b3cdff] text-[#0b0e14] font-bold font-mono px-8 py-4 rounded-full text-[10px] uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50">
              {status === 'loading' ? 'Submitting...' : 'Join the Waitlist'}
            </button>
            {status === 'error' && <p className="font-mono text-[9px] uppercase tracking-widest text-red-400 text-center">Something went wrong. Try again.</p>}
          </form>
          <div className="flex items-center gap-2 mt-6 text-gray-600 font-mono text-[9px] uppercase tracking-widest">
            <Lock className="w-3 h-3" />
            <p>Limited first access.</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="bg-[#0b0e14] border-t border-[#1e2a38] px-6 md:px-12 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <ZanaLogo className="h-4 text-gray-600" />
          <div className="flex gap-8">
            {[{href:"/terms",label:"Terms"},{href:"/privacy",label:"Privacy"},{href:"/system",label:"The System"},{href:"/about",label:"About"}].map(l => (
              <Link key={l.href} href={l.href} className="font-mono text-[8px] tracking-widest uppercase text-gray-600 hover:text-white transition-colors">{l.label}</Link>
            ))}
          </div>
          <p className="font-mono text-[8px] tracking-widest uppercase text-gray-700">© 2025 ZANA Fitness</p>
        </div>
      </footer>

    </main>
  );
}
