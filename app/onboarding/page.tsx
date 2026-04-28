"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('');
  
  return (
    <main className="min-h-screen bg-navy-900 text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg">
        
        {step === 1 && (
          <div className="space-y-8 animate-fade-in text-center">
            <p className="text-babyblue-500 text-sm tracking-widest font-bold">WELCOME</p>
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight uppercase leading-snug">
              This is not<br />a program.
            </h1>
            <p className="text-gray-400 tracking-wider">It&apos;s a system.</p>
            <button 
              onClick={() => setStep(2)}
              className="mt-8 bg-babyblue-500 text-navy-900 font-bold px-10 py-4 rounded-full uppercase tracking-widest hover:bg-babyblue-400 transition-colors"
            >
              Initialize Base
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-fade-in">
            <p className="text-babyblue-500 text-sm tracking-widest font-bold text-center">PHASE 01</p>
            <h2 className="text-3xl font-medium tracking-wide uppercase text-center mb-8">What is the objective?</h2>
            
            <div className="space-y-4">
              {['Lose Fat', 'Build Muscle', 'Recomposition'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setGoal(opt);
                    setStep(3);
                  }}
                  className={`w-full text-left px-6 py-5 rounded-xl border transition-all ${
                    goal === opt ? 'border-babyblue-500 bg-navy-800 text-babyblue-500' : 'border-navy-700 bg-navy-800/50 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <span className="uppercase tracking-widest text-sm font-bold">{opt}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-fade-in text-center">
            <div className="py-12 border border-navy-700 bg-navy-800 rounded-2xl">
              <h2 className="text-2xl font-medium tracking-wide uppercase mb-2">Target Acquired</h2>
              <p className="text-babyblue-500 font-bold tracking-widest uppercase mb-12">System Calibrated</p>
              
              <Link 
                href="/dashboard"
                className="bg-white text-navy-900 font-bold px-10 py-4 rounded-full uppercase tracking-widest hover:bg-gray-200 transition-colors inline-block"
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
