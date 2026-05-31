"use client";

import Link from "next/link";
import Image from "next/image";
import { AlertCircle, ArrowRight, Heart } from "lucide-react";

const ZanaLogo = ({ className = "h-8" }: { className?: string }) => (
  <svg viewBox="0 0 180 32" className={className} fill="none" stroke="currentColor" strokeWidth="5" strokeMiterlimit="10">
    <path d="M0,2 H32 L18.3,14" />
    <path d="M13.7,18 L0,30 H32" />
    <path d="M48,30 L64,2 L80,30" />
    <path d="M96,30 V2 L128,30 V2" />
    <path d="M144,30 L160,2 L176,30" />
  </svg>
);

const ZIcon = ({ className = "h-8" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" stroke="currentColor" strokeWidth="5" strokeMiterlimit="10">
    <path d="M0,2 H32 L18.3,14" />
    <path d="M13.7,18 L0,30 H32" />
  </svg>
);

export default function GFProtocolPage() {
  return (
    <main className="min-h-screen bg-[#121821] text-white font-sans selection:bg-[#b3cdff] selection:text-[#121821]">
      
      {/* NAVBAR */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-8 md:px-16 overflow-hidden border-b border-[#2d3a4b]/50">
        <Link href="/">
          <ZIcon className="h-5 md:h-6 text-white" />
        </Link>
        <div className="hidden md:flex items-center space-x-12 text-[10px] tracking-[0.2em] font-inter uppercase font-semibold text-gray-300">
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <Link href="/system" className="hover:text-white transition-colors">The System</Link>
          <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
          <Link href="/system" className="bg-[#b3cdff] text-[#121821] font-bold px-8 py-2.5 rounded-full hover:bg-white transition-colors">
            JOIN THE SYSTEM
          </Link>
        </div>
      </nav>

      {/* HERO HEADER */}
      <section className="pt-40 pb-16 px-6 text-center bg-[#121821]">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#b3cdff] mb-8">Case Study & Framework</p>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-sans font-light tracking-[0.05em] uppercase leading-[1.1] text-white mb-6">
            How I helped build my girlfriend the body she wanted.
          </h1>
          <p className="font-inter text-gray-400 italic text-sm md:text-base">(The exact protocol I put MJ on)</p>
        </div>
      </section>

      {/* DISCLAIMER */}
      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto bg-[#1a222c] border border-[#2d3a4b] rounded-2xl p-8 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#b3cdff]"></div>
          <div className="flex items-start gap-4">
            <AlertCircle className="text-[#b3cdff] w-6 h-6 flex-shrink-0 mt-1" />
            <div>
              <p className="font-bold text-[#b3cdff] text-xs tracking-widest uppercase mb-3">Disclaimer Before The Internet Cancels Me</p>
              <p className="font-inter text-gray-400 text-sm leading-relaxed">
                I love my girlfriend exactly the way she is, and I thought she looked perfect before. She specifically came to me complaining that she felt "flabby" despite being skinny, and explicitly asked me to write her a program. I am just a boyfriend following instructions so my girlfriend stays happy. Please do not cancel me. 😅
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* NARRATIVE INTRO */}
      <section className="px-6 py-12">
        <div className="max-w-2xl mx-auto font-inter text-gray-300 text-base md:text-lg leading-relaxed space-y-6">
          <p>
            <span className="text-white font-bold">Hey, I'm Javi.</span> I'm a fitness coach, and yes, I'm the guy who "made" my girlfriend change her body (because she asked me to, I promise).
          </p>
          <p>
            When MJ first came to me, she had a very common problem: <strong className="text-white">She was skinny, but she wasn't in shape.</strong>
          </p>
          <p>
            She was eating like a bird, doing random cardio, and feeling frustrated that she still felt "soft" or "flabby." She didn't need to lose weight—she needed to completely change her body composition.
          </p>
          <p>
            Here is the exact framework I used to help her fix her eating habits, build the right kind of curves, and finally feel confident in her own skin.
          </p>
        </div>
      </section>

      {/* THE PROTOCOL (PHASES) */}
      <section className="py-24 px-6 bg-[#1a222c] border-y border-[#2d3a4b]">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-16">
            <ZanaLogo className="h-6 mx-auto text-[#b3cdff] mb-6 opacity-50" />
            <h2 className="text-xl md:text-2xl font-sans font-light tracking-[0.15em] uppercase text-white">
              The Protocol
            </h2>
          </div>

          <div className="space-y-12">
            
            {/* PHASE 1 */}
            <div className="border border-[#2d3a4b] bg-[#121821] p-8 md:p-12 rounded-2xl">
              <div className="flex items-center gap-4 mb-6">
                <span className="font-mono text-[10px] tracking-widest text-[#b3cdff] border border-[#b3cdff] px-3 py-1 rounded-full">PHASE 1</span>
                <h3 className="uppercase tracking-[0.15em] text-lg font-bold text-white">Fixing the "Skinny-Fat" Diet</h3>
              </div>
              <p className="font-inter text-sm text-gray-400 mb-8 pb-8 border-b border-[#2d3a4b]">
                Most girls think the answer to looking "toned" is eating salads and doing the treadmill. It's the exact opposite.
              </p>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#b3cdff] mt-2 flex-shrink-0"></div>
                  <p className="font-inter text-sm text-gray-300 leading-relaxed"><strong className="text-white">We stopped the starvation:</strong> I actually made her EAT MORE. To build a shape, you need building blocks. We bumped up her calories so she was eating enough to actually fuel her body.</p>
                </li>
                <li className="flex gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#b3cdff] mt-2 flex-shrink-0"></div>
                  <p className="font-inter text-sm text-gray-300 leading-relaxed"><strong className="text-white">Protein became a non-negotiable:</strong> She wasn't eating nearly enough protein. We set a strict target (about 0.8g to 1g per pound of her goal body weight) to ensure the weight she was putting on was lean muscle, not fat.</p>
                </li>
                <li className="flex gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#b3cdff] mt-2 flex-shrink-0"></div>
                  <p className="font-inter text-sm text-gray-300 leading-relaxed"><strong className="text-white">No more "good" or "bad" foods:</strong> I taught her how to track her macros so she could still eat the foods she loved without the guilt.</p>
                </li>
              </ul>
            </div>

            {/* PHASE 2 */}
            <div className="border border-[#2d3a4b] bg-[#121821] p-8 md:p-12 rounded-2xl">
              <div className="flex items-center gap-4 mb-6">
                <span className="font-mono text-[10px] tracking-widest text-[#b3cdff] border border-[#b3cdff] px-3 py-1 rounded-full">PHASE 2</span>
                <h3 className="uppercase tracking-[0.15em] text-lg font-bold text-white">Training for Shape, Not Sweat</h3>
              </div>
              <p className="font-inter text-sm text-gray-400 mb-8 pb-8 border-b border-[#2d3a4b]">
                Sweating a lot does not equal a good workout. We ditched the endless cardio and moved to the weight room.
              </p>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#b3cdff] mt-2 flex-shrink-0"></div>
                  <p className="font-inter text-sm text-gray-300 leading-relaxed"><strong className="text-white">Progressive Overload:</strong> We picked a few core exercises (RDLs, hip thrusts, split squats, shoulder presses) and focused on getting stronger at them every single week.</p>
                </li>
                <li className="flex gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#b3cdff] mt-2 flex-shrink-0"></div>
                  <p className="font-inter text-sm text-gray-300 leading-relaxed"><strong className="text-white">Building the "Illusion":</strong> To get that hourglass, "snatched" look, we focused heavily on building her glutes and her shoulders. When your shoulders and glutes grow, your waist naturally looks smaller.</p>
                </li>
                <li className="flex gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#b3cdff] mt-2 flex-shrink-0"></div>
                  <p className="font-inter text-sm text-gray-300 leading-relaxed"><strong className="text-white">Rest Days:</strong> I forced her to take rest days. You don't grow in the gym; you grow when you recover.</p>
                </li>
              </ul>
            </div>

            {/* PHASE 3 */}
            <div className="border border-[#2d3a4b] bg-[#121821] p-8 md:p-12 rounded-2xl">
              <div className="flex items-center gap-4 mb-6">
                <span className="font-mono text-[10px] tracking-widest text-[#b3cdff] border border-[#b3cdff] px-3 py-1 rounded-full">PHASE 3</span>
                <h3 className="uppercase tracking-[0.15em] text-lg font-bold text-white">The Mindset Shift</h3>
              </div>
              <p className="font-inter text-sm text-gray-400 mb-8 pb-8 border-b border-[#2d3a4b]">
                The hardest part wasn't the workouts—it was the mental shift of seeing the scale go UP, but realizing her body looked tighter, leaner, and better than ever.
              </p>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#b3cdff] mt-2 flex-shrink-0"></div>
                  <p className="font-inter text-sm text-gray-300 leading-relaxed"><strong className="text-white">Throw away the scale:</strong> Muscle is denser than fat. She gained weight, but she dropped dress sizes.</p>
                </li>
                <li className="flex gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#b3cdff] mt-2 flex-shrink-0"></div>
                  <p className="font-inter text-sm text-gray-300 leading-relaxed"><strong className="text-white">Consistency over perfection:</strong> We didn't aim for 100% perfection. We aimed for 80% consistency over a long period of time.</p>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="py-24 px-6 bg-[#121821]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-xl md:text-3xl font-sans font-light tracking-[0.15em] uppercase text-white mb-4">The Result.</h2>
            <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400">Consistent application of the protocol.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {/* Before Column */}
            <div className="space-y-4 md:space-y-8">
              <div className="bg-[#1a222c] border border-[#2d3a4b] rounded-2xl p-4 text-center">
                <p className="font-mono text-[10px] tracking-widest text-gray-400 uppercase">Before Protocol</p>
              </div>
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-[#2d3a4b]">
                <Image src="/before-after/before_IMG_3936.jpg" alt="Before" fill className="object-cover" />
              </div>
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-[#2d3a4b]">
                <Image src="/before-after/before_IMG_6112.jpg" alt="Before" fill className="object-cover" />
              </div>
            </div>

            {/* After Column */}
            <div className="space-y-4 md:space-y-8">
              <div className="bg-[#b3cdff] border border-[#b3cdff] rounded-2xl p-4 text-center shadow-[0_0_40px_-10px_rgba(179,205,255,0.3)]">
                <p className="font-mono text-[10px] tracking-widest text-black font-bold uppercase">After Protocol</p>
              </div>
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-[#b3cdff]">
                <Image src="/before-after/after_IMG_4865.jpg" alt="After" fill className="object-cover" />
              </div>
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-[#b3cdff]">
                <Image src="/before-after/after_IMG_5492.jpg" alt="After" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA / OUTRO */}
      <section className="py-32 px-6 bg-[#0f141b] border-t border-[#2d3a4b] text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#b3cdff] via-[#0f141b] to-[#0f141b]"></div>
        
        <div className="max-w-2xl mx-auto relative z-10 flex flex-col items-center">
          <Heart className="text-[#b3cdff] w-8 h-8 mb-8" />
          <h2 className="text-2xl md:text-4xl font-sans font-light tracking-[0.1em] uppercase leading-tight text-white mb-6">
            Want me to do for you what I did for MJ?
          </h2>
          <p className="font-inter text-gray-400 text-sm md:text-base leading-relaxed mb-12 max-w-lg mx-auto">
            I don't just train my girlfriend. I run a full online coaching program helping people stop guessing and actually build a physique that commands respect. If you want the exact step-by-step coaching, accountability, and custom programming to build your dream body...
          </p>
          
          <Link href="/system" className="group flex items-center gap-4 bg-[#b3cdff] text-[#121821] font-bold px-10 py-5 rounded-full hover:bg-white transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(179,205,255,0.4)]">
            <span className="text-xs tracking-widest uppercase">Apply For Coaching</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="font-mono text-[10px] text-gray-500 mt-6 tracking-widest uppercase">(Let me know MJ sent you!)</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-16 px-10 md:px-24 bg-[#0f141b] flex flex-col md:flex-row items-center justify-between border-t border-[#2d3a4b] text-[9px] font-mono tracking-[0.2em] uppercase text-gray-500 gap-8">
        <div className="flex-1 flex justify-center md:justify-start w-full md:w-auto">
          <p>&copy; 2026 Zana Fitness</p>
        </div>
        <div className="flex-1 flex justify-center py-6 md:py-0">
          <ZanaLogo className="h-4 md:h-5 text-white" />
        </div>
        <div className="flex-1 flex justify-center md:justify-end gap-5 w-full md:w-auto">
          <a href="https://www.instagram.com/javi_zana/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
          <a href="https://www.tiktok.com/@javi_zana?lang=en" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">TikTok</a>
        </div>
      </footer>

    </main>
  );
}
