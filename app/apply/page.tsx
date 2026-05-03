"use client";

import { useState, FormEvent } from 'react';
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

const STEPS = [
  { label: 'Contact',     sub: 'How to reach you'         },
  { label: 'Background',  sub: 'Where you are right now'  },
  { label: 'Your Goal',   sub: 'What you\'re working towards' },
  { label: 'Commitment',  sub: 'How ready you are'        },
];

const inputCls = "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#b0e455]/40 transition-colors";
const labelCls = "block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider";

export default function ApplyPage() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    firstName: '',
    email: '',
    phone: '',
    instagram: '',
    ageRange: '',
    location: '',
    trainingFrequency: '',
    fitnessGoal: '',
    stoppedProgress: '',
    previousCoaching: '',
    commitment: 0,
  });

  const set = (field: string, value: string | number) =>
    setForm(f => ({ ...f, [field]: value }));

  const canAdvance = () => {
    if (step === 0) return form.firstName.trim() && form.email.trim() && form.phone.trim();
    if (step === 1) return form.ageRange && form.location.trim() && form.trainingFrequency;
    if (step === 2) return form.fitnessGoal.trim() && form.stoppedProgress.trim();
    if (step === 3) return form.commitment > 0;
    return false;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canAdvance()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Submission failed');
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#0b1509] text-white flex flex-col">
        <nav className="flex items-center justify-between px-8 py-5 border-b border-white/8">
          <Link href="/" className="text-white/60"><ZanaLogo className="h-4" /></Link>
        </nav>
        <div className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="max-w-sm w-full text-center space-y-6">
            <div className="w-14 h-14 rounded-full bg-[#b0e455]/10 border border-[#b0e455]/20 flex items-center justify-center mx-auto">
              <svg viewBox="0 0 24 24" fill="none" stroke="#b0e455" strokeWidth="1.5" className="w-6 h-6">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h1 className="font-display text-3xl leading-tight mb-3">Application<br />received.</h1>
              <p className="text-sm text-white/50 leading-relaxed">
                We'll review your application and be in touch within 24–48 hours to schedule a call.
              </p>
            </div>
            <div className="bg-white/5 border border-white/8 rounded-2xl px-5 py-4 text-left space-y-2">
              <p className="text-xs text-white/40 uppercase tracking-wider font-medium">What happens next</p>
              {[
                'We review your application',
                'You get a call invite within 48h',
                'We map out your plan on the call',
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#b0e455]/60">{String(i + 1).padStart(2, '0')}</span>
                  <p className="text-sm text-white/60">{s}</p>
                </div>
              ))}
            </div>
            <Link href="/" className="block text-sm text-white/30 hover:text-white/60 transition-colors">
              ← Back to sign in
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b1509] text-white flex flex-col">

      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/8">
        <Link href="/" className="text-white/60"><ZanaLogo className="h-4" /></Link>
        <Link href="/" className="text-sm text-white/30 hover:text-white/60 transition-colors">← Back</Link>
      </nav>

      {/* Progress */}
      <div className="px-6 pt-8 pb-2 max-w-lg mx-auto w-full">
        <div className="flex gap-1.5 mb-6">
          {STEPS.map((s, i) => (
            <div key={i} className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-[#b0e455]' : 'bg-white/10'}`} />
          ))}
        </div>
        <p className="text-[10px] text-[#b0e455] uppercase tracking-widest font-medium mb-1">
          Step {step + 1} of {STEPS.length} — {STEPS[step].label}
        </p>
        <p className="text-white/35 text-xs">{STEPS[step].sub}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col px-6 py-6 max-w-lg mx-auto w-full">

        {/* ── Step 1: Contact ── */}
        {step === 0 && (
          <div className="space-y-4 flex-1">
            <h2 className="font-display text-3xl leading-tight mb-6">Let's start<br />with the basics.</h2>
            <div>
              <label className={labelCls}>First name</label>
              <input type="text" value={form.firstName} onChange={e => set('firstName', e.target.value)}
                placeholder="Your first name" required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email address</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="you@example.com" required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Phone / WhatsApp</label>
              <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                placeholder="+1 234 567 8900" required className={inputCls} />
              <p className="text-[11px] text-white/25 mt-1.5 pl-1">Include country code — used to schedule your call</p>
            </div>
            <div>
              <label className={labelCls}>Instagram handle <span className="normal-case text-white/20">(optional)</span></label>
              <input type="text" value={form.instagram} onChange={e => set('instagram', e.target.value)}
                placeholder="@yourhandle" className={inputCls} />
            </div>
          </div>
        )}

        {/* ── Step 2: Background ── */}
        {step === 1 && (
          <div className="space-y-6 flex-1">
            <h2 className="font-display text-3xl leading-tight mb-6">Tell us about<br />where you are.</h2>

            <div>
              <label className={labelCls}>Age range</label>
              <div className="grid grid-cols-5 gap-2">
                {['< 20', '20–25', '26–30', '31–35', '36+'].map(opt => (
                  <button key={opt} type="button" onClick={() => set('ageRange', opt)}
                    className={`py-3 rounded-xl text-sm font-medium border transition-all ${
                      form.ageRange === opt
                        ? 'bg-[#b0e455]/10 border-[#b0e455]/40 text-[#b0e455]'
                        : 'bg-white/5 border-white/8 text-white/50 hover:border-white/20 hover:text-white/70'
                    }`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>Where are you based?</label>
              <input type="text" value={form.location} onChange={e => set('location', e.target.value)}
                placeholder="City, Country" required className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Current training frequency</label>
              <div className="grid grid-cols-2 gap-2">
                {['0 days/week', '1–2x / week', '3–4x / week', '5+ / week'].map(opt => (
                  <button key={opt} type="button" onClick={() => set('trainingFrequency', opt)}
                    className={`py-3.5 rounded-xl text-sm font-medium border transition-all text-left px-4 ${
                      form.trainingFrequency === opt
                        ? 'bg-[#b0e455]/10 border-[#b0e455]/40 text-[#b0e455]'
                        : 'bg-white/5 border-white/8 text-white/50 hover:border-white/20 hover:text-white/70'
                    }`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Goal ── */}
        {step === 2 && (
          <div className="space-y-5 flex-1">
            <h2 className="font-display text-3xl leading-tight mb-6">Your goal,<br />in your words.</h2>
            <div>
              <label className={labelCls}>What's your #1 physique or fitness goal in the next 3–6 months?</label>
              <textarea value={form.fitnessGoal} onChange={e => set('fitnessGoal', e.target.value)}
                rows={3} required placeholder="Be specific — what does success look like for you?"
                className={`${inputCls} resize-none`} />
            </div>
            <div>
              <label className={labelCls}>What's stopped you from getting there on your own?</label>
              <textarea value={form.stoppedProgress} onChange={e => set('stoppedProgress', e.target.value)}
                rows={3} required placeholder="Consistency? Nutrition? Not knowing what to do?"
                className={`${inputCls} resize-none`} />
            </div>
            <div>
              <label className={labelCls}>Have you worked with a coach before? <span className="normal-case text-white/20">(optional)</span></label>
              <textarea value={form.previousCoaching} onChange={e => set('previousCoaching', e.target.value)}
                rows={2} placeholder="If yes — what worked, what didn't?"
                className={`${inputCls} resize-none`} />
            </div>
          </div>
        )}

        {/* ── Step 4: Commitment ── */}
        {step === 3 && (
          <div className="flex-1">
            <h2 className="font-display text-3xl leading-tight mb-3">Last one.</h2>
            <p className="text-white/40 text-sm mb-8">Be honest — there's no wrong answer.</p>
            <label className={labelCls}>
              How committed are you to making this change in the next 90 days?
            </label>
            <div className="grid grid-cols-5 gap-2 mt-3 mb-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <button key={n} type="button" onClick={() => set('commitment', n)}
                  className={`aspect-square rounded-xl text-sm font-semibold border transition-all ${
                    form.commitment === n
                      ? 'bg-[#b0e455] border-[#b0e455] text-[#0f1a0c]'
                      : 'bg-white/5 border-white/8 text-white/40 hover:border-white/20 hover:text-white/70'
                  }`}>
                  {n}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-2 px-0.5">
              <p className="text-[10px] text-white/25">Not sure yet</p>
              <p className="text-[10px] text-white/25">100% ready</p>
            </div>
            {form.commitment > 0 && (
              <p className="text-sm text-[#b0e455] mt-4 font-medium">
                {form.commitment >= 8 ? "That's the energy. Let's talk." :
                 form.commitment >= 5 ? "Good. Commitment builds once you have a system." :
                 "Honest answer. That's what the consultation is for."}
              </p>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="pt-6 space-y-3">
          {error && (
            <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-sm text-red-400 text-center">{error}</p>
            </div>
          )}
          {step < 3 ? (
            <button type="button" onClick={() => setStep(s => s + 1)} disabled={!canAdvance()}
              className="w-full bg-[#b0e455] text-[#0f1a0c] font-semibold text-sm py-4 rounded-2xl hover:bg-[#c9f070] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              Continue
            </button>
          ) : (
            <button type="submit" disabled={!canAdvance() || submitting}
              className="w-full bg-[#b0e455] text-[#0f1a0c] font-semibold text-sm py-4 rounded-2xl hover:bg-[#c9f070] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              {submitting ? 'Submitting…' : 'Submit Application'}
            </button>
          )}
          {step > 0 && (
            <button type="button" onClick={() => setStep(s => s - 1)}
              className="w-full text-sm text-white/30 hover:text-white/60 transition-colors py-2">
              ← Back
            </button>
          )}
        </div>

      </form>
    </main>
  );
}
