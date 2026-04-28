'use client';

import { useState } from 'react';
import { TrendingUp, Leaf, Target, Lock, X } from 'lucide-react';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';

const ZanaLogo = ({ className = "h-8" }: { className?: string }) => (
  <svg viewBox="0 0 180 32" className={className} fill="none" stroke="currentColor" strokeWidth="5" strokeMiterlimit="10">
    <path d="M0,2 H32 L18.3,14" />
    <path d="M13.7,18 L0,30 H32" />
    <path d="M48,30 L64,2 L80,30" />
    <path d="M96,30 V2 L128,30 V2" />
    <path d="M144,30 L160,2 L176,30" />
  </svg>
);

function WaitlistModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-[#1a222c] border border-[#2d3a4b] rounded-2xl p-10 md:p-14 max-w-md w-full flex flex-col items-center text-center shadow-[0_0_120px_-20px_rgba(179,205,255,0.15)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <ZanaLogo className="h-6 text-white mb-10 opacity-60" />

        <div className="w-6 h-px bg-[#b3cdff] mb-10" />

        <p className="font-mono text-[9px] uppercase tracking-widest text-[#b3cdff] mb-4">Access Requested</p>

        <h2 className="text-xl md:text-2xl font-light tracking-[0.1em] uppercase text-white leading-snug mb-6">
          You&apos;re on the list.
        </h2>

        <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400 leading-loose">
          We&apos;ll send you an email once slots<br />for ZANA Fitness open.
        </p>

        <div className="w-6 h-px bg-[#2d3a4b] mt-10 mb-10" />

        <p className="font-mono text-[9px] uppercase tracking-widest text-gray-600">
          Built for results. Not motivation.
        </p>
      </div>
    </div>
  );
}

function DuplicateModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-[#1a222c] border border-[#2d3a4b] rounded-2xl p-10 md:p-14 max-w-md w-full flex flex-col items-center text-center shadow-[0_0_120px_-20px_rgba(179,205,255,0.08)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <ZanaLogo className="h-6 text-white mb-10 opacity-60" />

        <div className="w-6 h-px bg-gray-600 mb-10" />

        <p className="font-mono text-[9px] uppercase tracking-widest text-gray-500 mb-4">Already Registered</p>

        <h2 className="text-xl md:text-2xl font-light tracking-[0.1em] uppercase text-white leading-snug mb-6">
          I love how<br />committed you are.
        </h2>

        <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400 leading-loose">
          You&apos;re already on the list.<br />We&apos;ll reach out when it&apos;s time.
        </p>

        <div className="w-6 h-px bg-[#2d3a4b] mt-10 mb-10" />

        <p className="font-mono text-[9px] uppercase tracking-widest text-gray-600">
          Built for results. Not motivation.
        </p>
      </div>
    </div>
  );
}

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
    if (res.ok) {
      setStatus('success');
      setEmail('');
    } else if (res.status === 409) {
      setStatus('duplicate');
    } else {
      setStatus('error');
    }
  };

  return (
    <main className="min-h-screen bg-[#121821] text-white selection:bg-[#b3cdff] selection:text-[#0b0f1a] font-sans">

      {status === 'success' && <WaitlistModal onClose={() => setStatus('idle')} />}
      {status === 'duplicate' && <DuplicateModal onClose={() => setStatus('idle')} />}

      <Navbar />

      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex flex-col justify-center px-8 md:px-24 bg-[#121821]">
        
        {/* Background Header Crop */}
        <div className="absolute inset-0">
          <div className="w-full h-full bg-[url('/671A2489-147A-4CFB-9BE4-8E41C0B1B66A.PNG')] bg-cover bg-[50%_30%] brightness-[0.9]"></div>
        </div>
        
        {/* Massive Gradients to fill dead space and create left-text background */}
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#121821] via-[#121821]/70 to-transparent"></div>

        {/* Content */}
        <div className="relative z-10 max-w-2xl mt-12">
          <h1 className="flex flex-col items-start tracking-[-0.02em] uppercase leading-none">
            <ZanaLogo className="h-12 md:h-16 text-white" />
            <span className="block text-[11px] md:text-sm mt-8 font-bold tracking-[1em] text-white ml-2">F I T N E S S</span>
          </h1>
          
          <div className="my-12 space-y-2 uppercase tracking-[0.2em] font-mono text-[10px] md:text-[11px] text-gray-200">
            <p>Built for results.</p>
            <p>Not motivation.</p>
          </div>
          
          <button className="bg-[#b3cdff] text-[#121821] font-bold px-10 py-4 rounded-full text-[10px] uppercase tracking-widest hover:bg-white transition-colors">
            JOIN THE SYSTEM
          </button>
        </div>

        {/* Bottom Right Absolute */}
        <div className="absolute bottom-16 right-8 md:right-24 z-10 text-right">
           <p className="text-[10px] tracking-widest uppercase font-mono text-gray-300">Coming Soon.</p>
           <div className="w-6 h-px bg-gray-400 ml-auto mt-3"></div>
        </div>
      </section>

      {/* 2. PROBLEM SECTION (01) */}
      <section className="py-24 px-6 text-center bg-[#121821]">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <p className="text-[#b3cdff] font-mono text-[10px] tracking-widest mb-10">01</p>
          <h2 className="text-xl md:text-3xl font-sans font-light tracking-[0.15em] uppercase leading-tight text-white">
            You've built the career.<br />
            You've built the income.<br />
            The body is the one thing<br />
            that hasn't caught up yet.
          </h2>
          <div className="w-8 h-px bg-gray-400 mt-16"></div>
        </div>
      </section>

      {/* 3. SHIFT SECTION (02) */}
      <section className="grid grid-cols-1 md:grid-cols-2 bg-[#1a222c]">
        {/* Left Side: Header Crop */}
        <div className="h-[60vh] md:h-auto w-full relative">
          <div className="absolute inset-0 bg-[url('/A502086F-E304-43B4-87C1-93658EDB79F0.PNG')] bg-cover bg-center brightness-[0.8]"></div>
        </div>

        {/* Right Side: Content */}
        <div className="flex flex-col justify-center p-12 md:p-32 bg-[#1a222c] z-10 relative">
          <p className="text-[#b3cdff] font-mono text-[10px] tracking-widest mb-8">02</p>
          <h2 className="text-xl md:text-3xl font-sans font-light tracking-[0.1em] uppercase leading-snug mb-10 text-white text-left">
            You look good on paper.<br />
            Not in the mirror.
          </h2>
          <div className="space-y-3 font-mono text-[11px] uppercase tracking-[0.2em] text-gray-400">
            <p>Skinny-fat.</p>
            <p>Soft in clothes.</p>
            <p>Not matching the life you've built.</p>
          </div>
          <p className="text-[#b3cdff] font-mono text-[11px] tracking-[0.2em] uppercase mt-16">
            That changes here.
          </p>
        </div>
      </section>

      {/* 4. SYSTEM SECTION (03) */}
      <section className="py-24 px-6 bg-[#121821] border-y border-[#2d3a4b]">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          <p className="text-[#b3cdff] font-mono text-[10px] tracking-widest mb-10">03</p>
          <h2 className="text-xl md:text-2xl font-sans font-light tracking-[0.15em] uppercase text-center mb-10">
            A system built on structure.
          </h2>
          <div className="grid md:grid-cols-3 gap-16 md:gap-0 w-full text-center px-4">
            
            {/* Box 1 */}
            <div className="flex flex-col items-center md:border-r border-[#2d3a4b] md:pr-16">
               <TrendingUp className="w-8 h-8 text-gray-300 stroke-1 mb-8" />
               <div className="font-mono text-[10px] tracking-widest text-[#b3cdff] mb-4">01</div>
               <h3 className="uppercase tracking-[0.2em] text-xs font-bold mb-3 text-white">Training</h3>
               <p className="font-mono text-gray-300 uppercase tracking-widest text-[9px]">Around Your Life</p>
            </div>
            
            {/* Box 2 */}
            <div className="flex flex-col items-center md:border-r border-[#2d3a4b] md:px-16">
               <Leaf className="w-8 h-8 text-gray-300 stroke-1 mb-8" />
               <div className="font-mono text-[10px] tracking-widest text-[#b3cdff] mb-4">02</div>
               <h3 className="uppercase tracking-[0.2em] text-xs font-bold mb-3 text-white">Nutrition</h3>
               <p className="font-mono text-gray-300 uppercase tracking-widest text-[9px]">Without Extremes</p>
            </div>

            {/* Box 3 */}
            <div className="flex flex-col items-center md:pl-16">
               <Target className="w-8 h-8 text-gray-300 stroke-[1.5] mb-8" />
               <div className="font-mono text-[10px] tracking-widest text-[#b3cdff] mb-4">03</div>
               <h3 className="uppercase tracking-[0.2em] text-xs font-bold mb-3 text-white">Guidance</h3>
               <p className="font-mono text-gray-300 uppercase tracking-widest text-[9px]">That Compounds</p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. CORE SECTION (04) */}
      <section className="py-24 px-6 text-center bg-[#121821]">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <p className="text-[#b3cdff] font-mono text-[10px] tracking-widest mb-10">04</p>
          <h2 className="text-xl md:text-3xl font-sans font-light tracking-[0.15em] uppercase leading-tight text-white">
            This isn't about the gym.<br />
            It's a lifestyle built around<br />
            a lean, aesthetic physique that<br />
            becomes <span className="text-[#b3cdff]">effortless.</span>
          </h2>
          <div className="w-8 h-px bg-gray-400 mt-16"></div>
        </div>
      </section>

      {/* 6. VISUAL BREAK */}
      <section className="relative h-[40vh] md:h-[70vh] flex items-center px-12 md:px-32 border-y border-[#2d3a4b] bg-[#121821]">
        <div className="absolute inset-0 bg-[url('/F52D6DDD-5F62-414C-9B2D-5E12C333F2D3.PNG')] bg-cover bg-[50%_35%] brightness-[0.8]"></div>
        
        <div className="absolute inset-0 bg-gradient-to-r from-[#121821] via-[#121821]/60 to-transparent w-full md:w-3/4"></div>

        <div className="relative z-10 flex flex-col">
          <p className="font-mono text-[10px] md:text-[11px] tracking-[0.3em] uppercase text-white">
            Built for results.
          </p>
          <div className="w-6 h-px bg-gray-400 mt-4"></div>
        </div>
      </section>

      {/* 7. PLAYLIST SECTION (05) */}
      <section className="py-20 px-6 flex flex-col items-center bg-[#121821] border-b border-[#2d3a4b]">
        <div className="max-w-2xl w-full flex flex-col items-center">
          <p className="text-[#b3cdff] font-mono text-[10px] tracking-widest mb-10">05</p>
          <h2 className="text-xl md:text-2xl font-sans font-light tracking-[0.15em] uppercase mb-3 text-white">Train to This.</h2>
          <p className="font-mono text-gray-300 uppercase tracking-[0.2em] text-[9px] mb-12">My Personal Playlist</p>
          <div className="w-full rounded-xl overflow-hidden">
            <iframe
              src="https://open.spotify.com/embed/playlist/6hJ4JJSCPrUbb0ZD17ntQJ?utm_source=generator&theme=0"
              width="100%"
              height="352"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              style={{ borderRadius: '12px' }}
            />
          </div>
        </div>
      </section>

      {/* 8. WAITLIST SECTION (06) */}
      <section className="py-24 px-6 flex flex-col items-center justify-center text-center bg-[#121821]">
        <div className="max-w-lg w-full flex flex-col items-center">
          <p className="text-[#b3cdff] font-mono text-[10px] tracking-widest mb-10">06</p>
          <h2 className="text-xl md:text-2xl font-sans font-light tracking-[0.15em] uppercase mb-4 text-white">YOUR BODY SHOULD MATCH YOUR LIFE.</h2>
          <p className="text-[#b3cdff] font-mono uppercase tracking-[0.2em] text-[10px] mb-10">Be first when doors open.</p>

          <form onSubmit={handleWaitlist} className="w-full mb-6 flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="w-full bg-[#0f141b] border border-[#2d3a4b] rounded-full font-mono px-6 py-4 text-xs tracking-[0.1em] text-white placeholder-gray-600 focus:outline-none focus:border-[#b3cdff] transition-colors"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-[#b3cdff] text-black font-bold px-8 py-4 rounded-full text-[10px] uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? 'Submitting...' : 'Join Now'}
            </button>
            {status === 'error' && (
              <p className="font-mono text-[9px] uppercase tracking-widest text-red-400 text-center">Something went wrong. Try again.</p>
            )}
          </form>

          <div className="flex items-center gap-3 text-gray-500 font-mono text-[9px] uppercase tracking-widest">
            <Lock className="w-3 h-3" />
            <p>Limited First Access.</p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
