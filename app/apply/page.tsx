"use client";

import { useState, useEffect, useRef, FormEvent } from 'react';
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

const TOTAL = 13;

const inputCls = "w-full bg-transparent border-b-2 border-white/20 focus:border-[#b0e455] outline-none py-3 text-xl text-white placeholder-white/20 transition-colors";
const textareaCls = "w-full bg-transparent border-b-2 border-white/20 focus:border-[#b0e455] outline-none py-3 text-lg text-white placeholder-white/20 transition-colors resize-none leading-relaxed";

type Form = {
  firstName: string
  email: string
  phone: string
  instagram: string
  age: string
  location: string
  work: string
  mirrorGoal: string
  whatStopped: string
  trainingHistory: string
  commitment: number
  investmentFit: string
  whyNow: string
}

const empty: Form = {
  firstName: '', email: '', phone: '', instagram: '',
  age: '', location: '', work: '',
  mirrorGoal: '', whatStopped: '',
  trainingHistory: '',
  commitment: 0,
  investmentFit: '',
  whyNow: '',
}

function ChoiceButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`w-full text-left px-5 py-4 rounded-2xl border text-sm font-medium transition-all ${
        selected
          ? 'border-[#b0e455] bg-[#b0e455]/10 text-[#b0e455]'
          : 'border-white/12 bg-white/4 text-white/70 hover:border-white/25 hover:text-white'
      }`}>
      {label}
    </button>
  );
}

export default function ApplyPage() {
  const [step, setStep] = useState<number>(-1); // -1 = welcome
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Form>(empty);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const set = (field: keyof Form, value: string | number) =>
    setForm(f => ({ ...f, [field]: value }));

  // Focus input on step change
  useEffect(() => {
    if (step >= 0) {
      setTimeout(() => {
        inputRef.current?.focus();
        textareaRef.current?.focus();
      }, 50);
    }
  }, [step]);

  const canContinue = () => {
    if (step === 0)  return form.firstName.trim().length > 0;
    if (step === 1)  return /\S+@\S+\.\S+/.test(form.email);
    if (step === 2)  return form.phone.trim().length > 0;
    if (step === 3)  return form.instagram.trim().length > 0;
    if (step === 4)  return form.age !== '';
    if (step === 5)  return form.location.trim().length > 0;
    if (step === 6)  return form.work.trim().length > 0;
    if (step === 7)  return form.mirrorGoal.trim().length > 0;
    if (step === 8)  return form.whatStopped.trim().length > 0;
    if (step === 9)  return form.trainingHistory !== '';
    if (step === 10) return form.commitment > 0;
    if (step === 11) return form.investmentFit !== '';
    if (step === 12) return true; // optional
    return false;
  };

  const advance = () => {
    if (step < TOTAL - 1) setStep(s => s + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── End screen ───────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <main className="min-h-screen bg-[#0b1509] text-white flex flex-col">
        <nav className="flex items-center justify-between px-8 py-5 border-b border-white/8">
          <ZanaLogo className="h-4 text-white/40" />
        </nav>
        <div className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="max-w-sm w-full text-center space-y-7">
            <div className="w-14 h-14 rounded-full bg-[#b0e455]/10 border border-[#b0e455]/20 flex items-center justify-center mx-auto">
              <svg viewBox="0 0 24 24" fill="none" stroke="#b0e455" strokeWidth="1.5" className="w-6 h-6">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="space-y-4">
              <h1 className="font-display text-4xl leading-tight">Thanks for<br />applying.</h1>
              <p className="text-base text-white/55 leading-relaxed">
                I'll review this personally over the next 24 hours.
              </p>
              <p className="text-sm text-white/40 leading-relaxed">
                If it's a fit, I'll send you an email to book a call with me.<br />
                If not, I'll tell you straight. No further emails or newsletters.
              </p>
            </div>
            <button
              onClick={() => window.close()}
              className="w-full border border-white/12 text-white/50 font-medium text-sm py-4 rounded-2xl hover:border-white/25 hover:text-white/70 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ── Welcome screen ────────────────────────────────────────────────────────────
  if (step === -1) {
    return (
      <main className="min-h-screen bg-[#0b1509] text-white flex flex-col">
        <nav className="flex items-center justify-between px-8 py-5 border-b border-white/8">
          <ZanaLogo className="h-4 text-white/40" />
          <Link href="/" className="text-sm text-white/30 hover:text-white/60 transition-colors">← Back</Link>
        </nav>
        <div className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="max-w-md w-full space-y-8">
            <span className="inline-flex items-center gap-2 bg-[#b0e455]/8 border border-[#b0e455]/15 rounded-full px-4 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b0e455]" />
              <p className="text-xs font-medium text-[#b0e455]">Train with Javi — Application</p>
            </span>
            <div className="space-y-5">
              <h1 className="font-display leading-tight" style={{ fontSize: 'clamp(36px, 6vw, 52px)' }}>
                Hey, I'm Javi.
              </h1>
              <div className="space-y-4 text-[15px] text-white/60 leading-relaxed">
                <p>I've been working out for 7+ years.</p>
                <p>
                  What I'm most proud of in my fitness journey is making it effortless and automatic.
                  And I want to teach you how to do the same.
                </p>
                <p>
                  I take on a small number of 1:1 clients per month. And work with you to build a
                  fitness system that fits into your lifestyle and gets you shredded.
                </p>
                <p className="text-white/40">
                  This form is our first step. It should take about 10 minutes to fill up.
                </p>
              </div>
            </div>
            <button
              onClick={() => setStep(0)}
              className="inline-flex items-center gap-3 bg-[#b0e455] text-[#0f1a0c] font-semibold px-8 py-4 rounded-2xl hover:bg-[#c9f070] transition-colors text-sm"
            >
              Start <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg>
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ── Question screens ──────────────────────────────────────────────────────────
  const progress = ((step + 1) / TOTAL) * 100;

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && canContinue()) {
      e.preventDefault();
      advance();
    }
  };

  return (
    <main className="min-h-screen bg-[#0b1509] text-white flex flex-col">

      {/* Top bar */}
      <div className="px-6 pt-6 pb-0 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-0.5 bg-white/8 rounded-full overflow-hidden">
            <div className="h-full bg-[#b0e455] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-[11px] text-white/25 font-mono shrink-0">{step + 1} / {TOTAL}</span>
        </div>
      </div>

      {/* Question area */}
      <div className="flex-1 flex flex-col px-6 pt-4 pb-8 max-w-2xl mx-auto w-full">

        <div className="flex-1">

          {/* Q1 — First name */}
          {step === 0 && (
            <div className="space-y-8">
              <div>
                <p className="text-xs font-medium text-[#b0e455]/60 uppercase tracking-widest mb-4">Q1</p>
                <h2 className="text-2xl font-semibold text-white mb-2">What should I call you?</h2>
              </div>
              <input ref={inputRef} type="text" value={form.firstName}
                onChange={e => set('firstName', e.target.value)} onKeyDown={handleKey}
                placeholder="First name" className={inputCls} autoComplete="given-name" />
            </div>
          )}

          {/* Q2 — Email */}
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <p className="text-xs font-medium text-[#b0e455]/60 uppercase tracking-widest mb-4">Q2</p>
                <h2 className="text-2xl font-semibold text-white mb-2">Where can I reach you?</h2>
              </div>
              <input ref={inputRef} type="email" value={form.email}
                onChange={e => set('email', e.target.value)} onKeyDown={handleKey}
                placeholder="Email address" className={inputCls} autoComplete="email" />
            </div>
          )}

          {/* Q3 — Phone */}
          {step === 2 && (
            <div className="space-y-8">
              <div>
                <p className="text-xs font-medium text-[#b0e455]/60 uppercase tracking-widest mb-4">Q3</p>
                <h2 className="text-2xl font-semibold text-white mb-2">Best number for WhatsApp.</h2>
                <p className="text-sm text-white/35 leading-relaxed mt-2">
                  I send a voice note before our call — no spam, just so you know who you're meeting.
                </p>
              </div>
              <input ref={inputRef} type="tel" value={form.phone}
                onChange={e => set('phone', e.target.value)} onKeyDown={handleKey}
                placeholder="+65 9123 4567" className={inputCls} autoComplete="tel" />
            </div>
          )}

          {/* Q4 — Instagram */}
          {step === 3 && (
            <div className="space-y-8">
              <div>
                <p className="text-xs font-medium text-[#b0e455]/60 uppercase tracking-widest mb-4">Q4</p>
                <h2 className="text-2xl font-semibold text-white mb-2">Your Instagram handle.</h2>
                <p className="text-sm text-white/35 mt-2">Without the @. I always check before our call.</p>
              </div>
              <input ref={inputRef} type="text" value={form.instagram}
                onChange={e => set('instagram', e.target.value)} onKeyDown={handleKey}
                placeholder="yourhandle" className={inputCls} autoComplete="off"
                autoCorrect="off" autoCapitalize="none" />
            </div>
          )}

          {/* Q5 — Age */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-medium text-[#b0e455]/60 uppercase tracking-widest mb-4">Q5</p>
                <h2 className="text-2xl font-semibold text-white">How old are you?</h2>
              </div>
              <div className="space-y-2">
                {['18–24', '25–29', '30–34', '35–39', '40+'].map(opt => (
                  <ChoiceButton key={opt} label={opt} selected={form.age === opt}
                    onClick={() => { set('age', opt); setTimeout(advance, 180); }} />
                ))}
              </div>
            </div>
          )}

          {/* Q6 — Location */}
          {step === 5 && (
            <div className="space-y-8">
              <div>
                <p className="text-xs font-medium text-[#b0e455]/60 uppercase tracking-widest mb-4">Q6</p>
                <h2 className="text-2xl font-semibold text-white mb-2">Where are you based?</h2>
                <p className="text-sm text-white/35 mt-2">
                  City, country. I work with clients across SE Asia — Manila, Singapore, Jakarta, KL, Bangkok, etc.
                </p>
              </div>
              <input ref={inputRef} type="text" value={form.location}
                onChange={e => set('location', e.target.value)} onKeyDown={handleKey}
                placeholder="Singapore" className={inputCls} />
            </div>
          )}

          {/* Q7 — Work */}
          {step === 6 && (
            <div className="space-y-8">
              <div>
                <p className="text-xs font-medium text-[#b0e455]/60 uppercase tracking-widest mb-4">Q7</p>
                <h2 className="text-2xl font-semibold text-white mb-2">What do you do for work?</h2>
                <p className="text-sm text-white/35 mt-2">One line is fine. Helps me understand your schedule and lifestyle.</p>
              </div>
              <input ref={inputRef} type="text" value={form.work}
                onChange={e => set('work', e.target.value)} onKeyDown={handleKey}
                placeholder="e.g. Finance manager at a bank" className={inputCls} />
            </div>
          )}

          {/* Q8 — Mirror goal */}
          {step === 7 && (
            <div className="space-y-8">
              <div>
                <p className="text-xs font-medium text-[#b0e455]/60 uppercase tracking-widest mb-4">Q8</p>
                <h2 className="text-2xl font-semibold text-white leading-snug mb-2">
                  Look in the mirror. What do you want to look like in 6 months that you don't right now?
                </h2>
                <p className="text-sm text-white/30 mt-3 leading-relaxed">
                  Be specific. "Lose weight" tells me nothing. "Look good with my shirt off at Bali in October" tells me everything.
                </p>
              </div>
              <textarea ref={textareaRef} value={form.mirrorGoal} rows={4}
                onChange={e => set('mirrorGoal', e.target.value)} onKeyDown={handleKey}
                placeholder="Be honest and specific…" className={textareaCls} />
            </div>
          )}

          {/* Q9 — What stopped you */}
          {step === 8 && (
            <div className="space-y-8">
              <div>
                <p className="text-xs font-medium text-[#b0e455]/60 uppercase tracking-widest mb-4">Q9</p>
                <h2 className="text-2xl font-semibold text-white leading-snug mb-2">
                  What's the actual reason you haven't gotten there on your own?
                </h2>
                <p className="text-sm text-white/30 mt-3 leading-relaxed">
                  Diet? Inconsistency? Doesn't fit your life? Tried programs and fell off? No judgment — just need to know what we're solving.
                </p>
              </div>
              <textarea ref={textareaRef} value={form.whatStopped} rows={4}
                onChange={e => set('whatStopped', e.target.value)} onKeyDown={handleKey}
                placeholder="Be real with me…" className={textareaCls} />
            </div>
          )}

          {/* Q10 — Training history */}
          {step === 9 && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-medium text-[#b0e455]/60 uppercase tracking-widest mb-4">Q10</p>
                <h2 className="text-2xl font-semibold text-white leading-snug">Where are you with training right now?</h2>
              </div>
              <div className="space-y-2">
                {[
                  "I've never been consistent with the gym",
                  "I lift but inconsistently — fall on and off",
                  "I train 3–4×/week but don't see the results I want",
                  "I've worked with a coach before — didn't stick",
                  "I've worked with a coach before — got results but want more",
                ].map(opt => (
                  <ChoiceButton key={opt} label={opt} selected={form.trainingHistory === opt}
                    onClick={() => { set('trainingHistory', opt); setTimeout(advance, 180); }} />
                ))}
              </div>
            </div>
          )}

          {/* Q11 — Commitment scale */}
          {step === 10 && (
            <div className="space-y-8">
              <div>
                <p className="text-xs font-medium text-[#b0e455]/60 uppercase tracking-widest mb-4">Q11</p>
                <h2 className="text-2xl font-semibold text-white leading-snug mb-2">
                  On a scale of 1–10, how committed are you to making this happen in the next 90 days?
                </h2>
                <p className="text-sm text-white/30 mt-2">1 = curious, 10 = ready to start tomorrow</p>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <button key={n} type="button" onClick={() => set('commitment', n)}
                    className={`aspect-square rounded-xl text-base font-semibold border transition-all ${
                      form.commitment === n
                        ? 'bg-[#b0e455] border-[#b0e455] text-[#0f1a0c]'
                        : 'bg-white/4 border-white/10 text-white/40 hover:border-white/25 hover:text-white/70'
                    }`}>
                    {n}
                  </button>
                ))}
              </div>
              {form.commitment > 0 && (
                <p className="text-sm text-[#b0e455] font-medium">
                  {form.commitment >= 9 ? "That's the energy. Let's talk." :
                   form.commitment >= 7 ? "Good. Commitment compounds once you have a system." :
                   form.commitment >= 5 ? "Honest. That's what the consultation is for." :
                   "Appreciate the honesty. Let's talk about what's holding you back."}
                </p>
              )}
            </div>
          )}

          {/* Q12 — Investment fit */}
          {step === 11 && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-medium text-[#b0e455]/60 uppercase tracking-widest mb-4">Q12</p>
                <h2 className="text-2xl font-semibold text-white leading-snug mb-3">
                  Are you in a position to invest if it's the right fit?
                </h2>
                <div className="bg-white/4 border border-white/8 rounded-2xl px-4 py-3.5 text-sm text-white/50 leading-relaxed">
                  Coaching with me is <span className="text-white/80 font-medium">$500/month for 4 months</span> (Starter) or <span className="text-white/80 font-medium">$350/month for 12 months</span> (All In). Most clients go 12-month for the bigger transformation.
                </div>
              </div>
              <div className="space-y-2">
                {[
                  "Yes — ready to commit if we're a match",
                  "Probably — need to confirm with my partner first",
                  "Not right now — but want to stay in touch",
                  "No — not where I'm at financially",
                ].map(opt => (
                  <ChoiceButton key={opt} label={opt} selected={form.investmentFit === opt}
                    onClick={() => { set('investmentFit', opt); setTimeout(advance, 180); }} />
                ))}
              </div>
            </div>
          )}

          {/* Q13 — Why now (optional) */}
          {step === 12 && (
            <div className="space-y-8">
              <div>
                <p className="text-xs font-medium text-[#b0e455]/60 uppercase tracking-widest mb-4">Q13 — Optional</p>
                <h2 className="text-2xl font-semibold text-white leading-snug mb-2">
                  Anything else I should know before we hop on?
                </h2>
                <p className="text-sm text-white/30 mt-2">What's making you reach out now vs. 6 months ago?</p>
              </div>
              <textarea ref={textareaRef} value={form.whyNow} rows={4}
                onChange={e => set('whyNow', e.target.value)} onKeyDown={handleKey}
                placeholder="Totally optional…" className={textareaCls} />
            </div>
          )}

        </div>

        {/* Bottom nav */}
        <div className="pt-8 space-y-3">
          {error && (
            <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-sm text-red-400 text-center">{error}</p>
            </div>
          )}

          {/* Hide explicit continue for auto-advance multiple choice steps */}
          {![4, 9, 11].includes(step) && (
            <button type="button" onClick={advance}
              disabled={!canContinue() || submitting}
              className="w-full bg-[#b0e455] text-[#0f1a0c] font-semibold text-sm py-4 rounded-2xl hover:bg-[#c9f070] transition-colors disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {submitting ? 'Submitting…' : step === TOTAL - 1 ? 'Submit Application' : 'Continue'}
              {!submitting && <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg>}
            </button>
          )}

          {step > 0 && (
            <button type="button" onClick={() => setStep(s => s - 1)}
              className="w-full text-sm text-white/25 hover:text-white/50 transition-colors py-2">
              ← Back
            </button>
          )}

          {step === 0 && (
            <button type="button" onClick={() => setStep(-1)}
              className="w-full text-sm text-white/25 hover:text-white/50 transition-colors py-2">
              ← Back
            </button>
          )}
        </div>

      </div>
    </main>
  );
}
