"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('');

  return (
    <main className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg">

        {/* Step indicators */}
        <div className="flex justify-center gap-2 mb-12">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1 rounded-full transition-all ${
              s < step ? 'w-8 bg-[var(--c-accent-text)]' :
              s === step ? 'w-8 bg-[var(--c-accent-text)]' :
              'w-4 bg-[var(--c-border2)]'
            }`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-8 text-center">
            <span className="inline-flex items-center gap-2 bg-[var(--c-accent-text)]/8 border border-[var(--c-border2)] rounded-full px-4 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--c-accent-text)]" />
              <p className="text-xs font-medium text-[var(--c-accent-text)]">Welcome to Zana</p>
            </span>
            <h1 className="font-display leading-none" style={{ fontSize: "clamp(40px, 6vw, 64px)" }}>
              This is not<br />a program.
            </h1>
            <p className="text-base text-[var(--c-text3)]">It's a system built around how you actually live.</p>
            <button
              onClick={() => setStep(2)}
              className="mt-6 bg-[#b0e455] text-[#0f1a0c] font-semibold px-10 py-4 rounded-2xl hover:bg-[#c9f070] transition-colors"
            >
              Get Started
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div className="text-center">
              <p className="text-xs font-semibold tracking-wider uppercase text-[var(--c-accent-text)] mb-4">Step 1 of 2</p>
              <h2 className="font-display leading-none mb-2" style={{ fontSize: "clamp(32px, 5vw, 52px)" }}>
                What's the objective?
              </h2>
              <p className="text-sm text-[var(--c-text3)] mt-2">This shapes your program from day one.</p>
            </div>

            <div className="space-y-3">
              {[
                { id: 'Lose Fat', desc: 'Get lean and see definition in 12–16 weeks' },
                { id: 'Build Muscle', desc: 'Add size and strength progressively' },
                { id: 'Recomposition', desc: 'Lose fat and build muscle simultaneously' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => { setGoal(opt.id); setStep(3); }}
                  className={`w-full text-left px-6 py-5 rounded-2xl border transition-all group ${
                    goal === opt.id
                      ? 'border-[var(--c-accent-text)] bg-[var(--c-accent-text)]/6'
                      : 'border-[var(--c-border2)] bg-[var(--c-card)] hover:border-[var(--c-accent-text)]/30 hover:bg-[var(--c-hover)]'
                  }`}
                >
                  <p className={`text-sm font-semibold ${goal === opt.id ? 'text-[var(--c-accent-text)]' : 'text-[var(--c-text)]'}`}>{opt.id}</p>
                  <p className="text-xs text-[var(--c-text4)] mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 text-center">
            <div className="py-14 px-8 bg-[var(--c-card)] shadow-sm border border-[var(--c-border)] rounded-3xl">
              <div className="w-12 h-12 rounded-full bg-[var(--c-accent-text)]/10 border border-[var(--c-accent-text)]/20 flex items-center justify-center mx-auto mb-6">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-[var(--c-accent-text)]">
                  <path d="M2 8l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="font-display leading-none mb-2" style={{ fontSize: "clamp(28px, 4vw, 44px)" }}>You're set.</h2>
              <p className="text-sm font-medium text-[var(--c-accent-text)] mb-2">System calibrated for: {goal}</p>
              <p className="text-xs text-[var(--c-text4)] mb-8">Your coach will personalise your program from here.</p>
              <Link
                href="/dashboard"
                className="bg-[#b0e455] text-[#0f1a0c] font-semibold px-10 py-4 rounded-2xl hover:bg-[#c9f070] transition-colors inline-block"
              >
                Enter Dashboard
              </Link>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
