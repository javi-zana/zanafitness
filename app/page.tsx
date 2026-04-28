"use client";

import Link from 'next/link';
import { useState } from 'react';
import { TrendingUp, Leaf, Target, Lock } from 'lucide-react';

export default function LandingPage() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitted email:', email);
    alert('You have joined the waitlist!');
    setEmail('');
  };

  return (
    <main className="min-h-screen bg-[#06080a] text-white selection:bg-babyblue-500 selection:text-navy-900 font-sans">
      
      {/* NAVBAR */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-8 md:px-16">
        <div className="text-xl tracking-[0.4em] font-black uppercase">Z A N A</div>
        <div className="hidden md:flex items-center space-x-12 text-[10px] tracking-widest uppercase font-bold text-gray-400">
          <Link href="#about" className="hover:text-white transition-colors">About</Link>
          <Link href="#system" className="hover:text-white transition-colors">The System</Link>
          <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
          <button className="bg-[#b3cdff] text-black px-6 py-2 rounded-full hover:bg-white transition-colors">
            Join the System
          </button>
        </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex flex-col justify-center px-8 md:px-16 pt-24 border-b border-[#1a1f26]">
        <div className="absolute inset-0 bg-[url('/bg-hero.png')] bg-cover bg-center brightness-[0.35] md:brightness-50"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#06080a] via-[#06080a]/80 to-transparent"></div>
        
        <div className="relative z-10 max-w-2xl mt-12">
          <h1 className="text-6xl md:text-8xl font-black tracking-[-0.02em] uppercase leading-none">
            Z A N A
            <span className="block text-lg md:text-xl mt-4 font-normal tracking-[0.5em] text-gray-300">F I T N E S S</span>
          </h1>
          
          <div className="my-10 space-y-1 uppercase tracking-widest text-[11px] md:text-xs text-gray-300 font-bold leading-loose">
            <p>Built for results.</p>
            <p>Not motivation.</p>
          </div>
          
          <button className="bg-[#b3cdff] text-[#06080a] font-bold px-8 py-3 rounded-full text-xs uppercase tracking-widest hover:bg-white transition-colors">
            Join the System
          </button>
        </div>
        
        <div className="absolute bottom-12 right-8 md:right-16 z-10 text-right">
           <p className="text-[10px] tracking-widest uppercase font-bold text-gray-400">Coming Soon.</p>
           <div className="w-8 h-px bg-gray-500 ml-auto mt-2"></div>
        </div>
      </section>

      {/* 2. PROBLEM SECTION */}
      <section className="py-40 px-6 text-center border-b border-[#1a1f26] bg-[#06080a]">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <p className="text-[#b3cdff] text-[10px] tracking-widest font-bold mb-8">01</p>
          <h2 className="text-xl md:text-2xl font-light tracking-[0.15em] uppercase leading-loose text-white">
            You don&apos;t lack discipline.<br />
            You&apos;ve just never followed<br />
            a system that actually works.
          </h2>
          <div className="w-8 h-px bg-[#1a1f26] mt-12"></div>
        </div>
      </section>

      {/* 3. SHIFT SECTION */}
      <section className="grid grid-cols-1 md:grid-cols-2 border-b border-[#1a1f26] bg-[#06080a]">
        <div className="h-[60vh] md:h-[80vh] w-full bg-[url('/bg-moody.png')] bg-cover bg-center brightness-[0.6]"></div>
        <div className="flex flex-col justify-center p-12 md:p-24">
          <p className="text-[#b3cdff] text-[10px] tracking-widest font-bold mb-6">02</p>
          <h2 className="text-lg md:text-xl font-light tracking-[0.15em] uppercase leading-loose mb-12">
            Most people train randomly.
          </h2>
          
          <div className="space-y-2 text-[11px] uppercase tracking-widest text-gray-400 font-bold mb-12">
            <p>Random workouts.</p>
            <p>Random effort.</p>
            <p>Random results.</p>
          </div>
          
          <p className="text-[#b3cdff] text-[11px] tracking-widest uppercase font-bold">
            ZANA is different.
          </p>
        </div>
      </section>

      {/* 4. SYSTEM SECTION */}
      <section className="py-40 px-6 border-b border-[#1a1f26] bg-[#06080a]">
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          <p className="text-[#b3cdff] text-[10px] tracking-widest font-bold mb-6">03</p>
          <h2 className="text-lg md:text-xl font-light tracking-[0.15em] uppercase text-center mb-20 italic">
            A system built on structure.
          </h2>
          
          <div className="grid md:grid-cols-3 gap-16 w-full text-center px-4">
            <div className="flex flex-col items-center border-b border-transparent md:border-r md:border-b-0 border-[#1a1f26] pb-8 md:pb-0 md:pr-16">
              <TrendingUp className="w-8 h-8 text-gray-500 mb-6" strokeWidth={1} />
              <div className="text-[10px] tracking-widest font-bold text-gray-500 mb-4">01</div>
              <h3 className="uppercase tracking-[0.2em] text-xs font-bold mb-2">Training</h3>
              <p className="text-gray-500 uppercase tracking-widest text-[10px]">That Progresses</p>
            </div>
            <div className="flex flex-col items-center border-b border-transparent md:border-r md:border-b-0 border-[#1a1f26] pb-8 md:pb-0 md:pr-16">
              <Leaf className="w-8 h-8 text-gray-500 mb-6" strokeWidth={1} />
              <div className="text-[10px] tracking-widest font-bold text-gray-500 mb-4">02</div>
              <h3 className="uppercase tracking-[0.2em] text-xs font-bold mb-2">Nutrition</h3>
              <p className="text-gray-500 uppercase tracking-widest text-[10px]">That Aligns</p>
            </div>
            <div className="flex flex-col items-center">
              <Target className="w-8 h-8 text-gray-500 mb-6" strokeWidth={1} />
              <div className="text-[10px] tracking-widest font-bold text-gray-500 mb-4">03</div>
              <h3 className="uppercase tracking-[0.2em] text-xs font-bold mb-2">Guidance</h3>
              <p className="text-gray-500 uppercase tracking-widest text-[10px]">That Adapts</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CORE STATEMENT */}
      <section className="py-40 px-6 text-center border-b border-[#1a1f26] bg-[#06080a]">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <p className="text-[#b3cdff] text-[10px] tracking-widest font-bold mb-8">04</p>
          <h2 className="text-xl md:text-2xl font-light tracking-[0.15em] uppercase leading-loose text-gray-200">
            This isn&apos;t a program.<br />
            It&apos;s a system designed<br />
            to make progress <span className="text-[#b3cdff]">inevitable</span>.
          </h2>
          <div className="w-8 h-px bg-[#1a1f26] mt-12"></div>
        </div>
      </section>

      {/* 6. VISUAL BREAK */}
      <section className="relative h-[50vh] md:h-[60vh] flex items-center px-8 md:px-24">
        <div className="absolute inset-0 bg-[url('/bg-sweat.png')] bg-cover bg-center bg-fixed brightness-[0.4]"></div>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 flex flex-col">
          <p className="text-[10px] md:text-xs tracking-[0.3em] font-bold uppercase text-gray-300">
            Built for results.
          </p>
          <div className="w-8 h-px bg-gray-500 mt-4"></div>
        </div>
      </section>

      {/* 7. WAITLIST SECTION */}
      <section className="py-40 px-6 flex flex-col items-center justify-center text-center bg-[#06080a] border-b border-[#1a1f26]">
        <div className="max-w-xl w-full flex flex-col items-center">
          <p className="text-[#b3cdff] text-[10px] tracking-widest font-bold mb-8">05</p>
          <h2 className="text-xl md:text-2xl font-light tracking-[0.15em] uppercase mb-4">Join the System.</h2>
          <p className="text-[#b3cdff] uppercase tracking-widest text-[10px] font-bold mb-12">Get first access when Zana launches.</p>
          
          <form onSubmit={handleSubmit} className="w-full max-w-md">
            <div className="relative flex items-center border border-[#1a1f26] rounded-full bg-black/50 overflow-hidden">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-transparent px-6 py-4 text-xs tracking-wider text-white placeholder-gray-600 focus:outline-none"
              />
              <div className="p-1">
                <button 
                  type="submit" 
                  className="bg-[#b3cdff] text-black font-bold px-8 py-3 rounded-full text-[10px] uppercase tracking-widest hover:bg-white transition-colors"
                >
                  Join Now
                </button>
              </div>
            </div>
            <div className="flex justify-center items-center gap-2 mt-6 text-[9px] uppercase tracking-widest text-gray-600 font-bold">
               <Lock className="w-3 h-3" />
               <p>Limited first access.</p>
            </div>
          </form>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="py-16 px-8 md:px-16 bg-[#030406] flex flex-col md:flex-row justify-between items-start md:items-center text-[9px] uppercase tracking-widest text-gray-500 font-bold gap-12 md:gap-0">
        
        {/* Left */}
        <div className="space-y-4">
          <div className="text-lg tracking-[0.4em] font-black text-white">Z A N A</div>
          <p className="leading-relaxed">Built for results.<br/>Not motivation.</p>
        </div>

        {/* Center */}
        <div className="flex gap-16">
          <div className="flex flex-col gap-4">
            <Link href="#" className="hover:text-[#b3cdff] transition-colors">About</Link>
            <Link href="#" className="hover:text-[#b3cdff] transition-colors">The System</Link>
            <Link href="#" className="hover:text-[#b3cdff] transition-colors">FAQ</Link>
          </div>
          <div className="flex flex-col gap-4">
            <Link href="#" className="hover:text-[#b3cdff] transition-colors">Instagram</Link>
            <Link href="#" className="hover:text-[#b3cdff] transition-colors">TikTok</Link>
            <Link href="#" className="hover:text-[#b3cdff] transition-colors">YouTube</Link>
          </div>
        </div>

        {/* Right */}
        <div className="text-right">
          <p>&copy; 2024 Zana Fitness</p>
        </div>

      </footer>
    </main>
  );
}
