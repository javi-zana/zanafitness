"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('');

  return (
    <main className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg">

        {step === 1 && (
          <div className="space-y-8 text-center">
            <span className="inline-flex items-center gap-2 bg-[#b0e455]/10 border border-[#b0e455]/20 rounded-full px-4 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b0e455]" />
              <p className="text-xs font-medium text-[#b0e455]">Welcome</p>
            </span>
            <h1 className="font-display leading-none" style={{ fontSize: "clamp(40px, 6vw, 64px)" }}>
              This is not<br />a program.
            </h1>
            <p className="text-base text-[var(--c-text3)]">It's a system.</p>
            <button
              onClick={() => setStep(2)}
              className="mt-8 bg-[#b0e455] text-[#0f1a0c] font-semibold px-10 py-4 rounded-2xl hover:bg-[#c9f070] transition-colors"
            >
              Get Started
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div className="text-center">
              <p className="text-xs font-semibold tracking-wider uppercase text-[#b0e455] mb-4">Phase 01</p>
              <h2 className="font-display leading-none mb-2" style={{ fontSize: "clamp(32px, 5vw, 52px)" }}>What's the objective?</h2>
            </div>

            <div className="space-y-3">
              {['Lose Fat', 'Build Muscle', 'Recomposition'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setGoal(opt); setStep(3); }}
                  className={`w-full text-left px-6 py-5 rounded-2xl border transition-all ${
                    goal === opt
                      ? 'border-[#b0e455] bg-[#b0e455]/8 text-[#b0e455]'
                      : 'border-[var(--c-border2)] bg-[var(--c-card)] text-[var(--c-text2)] hover:border-[#b0e455]/30'
                  }`}
                >
                  <span className="text-sm font-semibold">{opt}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 text-center">
            <div className="py-12 border border-[#b0e455]/15 bg-[var(--c-card)] rounded-3xl">
              <h2 className="font-display leading-none mb-3" style={{ fontSize: "clamp(28px, 4vw, 44px)" }}>You're set.</h2>
              <p className="text-sm font-medium text-[#b0e455] mb-10">System calibrated.</p>
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
