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
    <main className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#b0e455] selection:text-[#0b1509]">
      
      {/* NAVBAR */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-8 md:px-16 overflow-hidden border-b border-gray-200">
        <Link href="/">
          <ZIcon className="h-4 md:h-5 text-gray-900 hover:text-black transition-colors" />
        </Link>
        <div className="hidden md:flex items-center space-x-12 text-[10px] tracking-[0.2em] uppercase font-semibold text-gray-500">
          <Link href="/about" className="hover:text-gray-900 transition-colors">About</Link>
          <Link href="/system" className="hover:text-gray-900 transition-colors">The System</Link>
          <Link href="/faq" className="hover:text-gray-900 transition-colors">FAQ</Link>
          <Link href="/apply" className="bg-[#0b1509] text-white font-bold px-8 py-2.5 rounded-full hover:bg-black transition-colors">
            APPLY FOR COACHING
          </Link>
        </div>
      </nav>

      {/* HERO HEADER */}
      <section className="pt-40 pb-16 px-6 text-center bg-white">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <span className="inline-flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0b1509]" />
            <p className="text-xs font-medium text-[#0b1509] uppercase tracking-wider">Case Study & Framework</p>
          </span>
          <h1 className="font-display leading-tight text-gray-900 mb-6" style={{ fontSize: 'clamp(32px, 5vw, 64px)' }}>
            How I helped build my girlfriend the body she wanted.
          </h1>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed">(The exact protocol I put MJ on)</p>
        </div>
      </section>

      {/* DISCLAIMER */}
      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto bg-gray-50 border border-gray-200 rounded-2xl p-8 md:p-10 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 w-1 h-full bg-gray-300"></div>
          <div className="flex items-start gap-4">
            <AlertCircle className="text-gray-500 w-6 h-6 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-gray-700 text-sm uppercase tracking-widest mb-3">Disclaimer Before The Internet Cancels Me</p>
              <p className="text-gray-600 text-[15px] leading-relaxed">
                I love my girlfriend exactly the way she is, and I thought she looked perfect before. She specifically came to me complaining that she felt "flabby" despite being skinny, and explicitly asked me to write her a program. I am just a boyfriend following instructions so my girlfriend stays happy. Please do not cancel me. 😅
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* NARRATIVE INTRO */}
      <section className="px-6 py-12 border-t border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto text-[15px] text-gray-600 leading-relaxed space-y-6">
          <p>
            <span className="text-gray-900 font-semibold">Hey, I'm Javi.</span> I'm a fitness coach, and yes, I'm the guy who "made" my girlfriend change her body (because she asked me to, I promise).
          </p>
          <p>
            When MJ first came to me, she had a very common problem: <strong className="text-gray-900">She was skinny, but she wasn't in shape.</strong>
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
      <section className="py-24 px-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-20">
            <ZanaLogo className="h-5 mx-auto text-gray-300 mb-6" />
            <h2 className="font-display text-3xl md:text-5xl text-gray-900">The Protocol</h2>
          </div>

          <div className="space-y-32">
            
            {/* PHASE 1 */}
            <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
              <div className="order-2 md:order-1 grid grid-cols-2 gap-4">
                <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 shadow-sm">
                  <Image src="/before-after/before_IMG_3936.jpg" alt="Before" fill className="object-cover" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-gray-200 text-[9px] uppercase tracking-widest text-gray-600 font-semibold">Before</div>
                </div>
                <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 mt-8 shadow-sm">
                  <Image src="/before-after/before_IMG_6112.jpg" alt="Before" fill className="object-cover" />
                </div>
              </div>
              <div className="order-1 md:order-2">
                <span className="inline-block font-mono text-[10px] tracking-widest text-gray-500 bg-gray-200 border border-gray-300 px-3 py-1 rounded-full mb-6">PHASE 1</span>
                <h3 className="font-display text-3xl text-gray-900 mb-6">Fixing the "Skinny-Fat" Diet</h3>
                <p className="text-[15px] text-gray-600 mb-8 pb-8 border-b border-gray-200 leading-relaxed">
                  Most girls think the answer to looking "toned" is eating salads and doing the treadmill. It's the exact opposite.
                </p>
                <ul className="space-y-6">
                  <li className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                    <p className="text-[15px] text-gray-600 leading-relaxed"><strong className="text-gray-900">We stopped the starvation:</strong> I actually made her EAT MORE. To build a shape, you need building blocks. We bumped up her calories so she was eating enough to actually fuel her body.</p>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                    <p className="text-[15px] text-gray-600 leading-relaxed"><strong className="text-gray-900">Protein became a non-negotiable:</strong> She wasn't eating nearly enough protein. We set a strict target (about 0.8g to 1g per pound of her goal body weight) to ensure the weight she was putting on was lean muscle, not fat.</p>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                    <p className="text-[15px] text-gray-600 leading-relaxed"><strong className="text-gray-900">No more "good" or "bad" foods:</strong> I taught her how to track her macros so she could still eat the foods she loved without the guilt.</p>
                  </li>
                </ul>
              </div>
            </div>

            {/* PHASE 2 */}
            <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
              <div>
                <span className="inline-block font-mono text-[10px] tracking-widest text-gray-500 bg-gray-200 border border-gray-300 px-3 py-1 rounded-full mb-6">PHASE 2</span>
                <h3 className="font-display text-3xl text-gray-900 mb-6">Training for Shape, Not Sweat</h3>
                <p className="text-[15px] text-gray-600 mb-8 pb-8 border-b border-gray-200 leading-relaxed">
                  Sweating a lot does not equal a good workout. We ditched the endless cardio and moved to the weight room.
                </p>
                <ul className="space-y-6">
                  <li className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                    <p className="text-[15px] text-gray-600 leading-relaxed"><strong className="text-gray-900">Progressive Overload:</strong> We picked a few core exercises (RDLs, hip thrusts, split squats, shoulder presses) and focused on getting stronger at them every single week.</p>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                    <p className="text-[15px] text-gray-600 leading-relaxed"><strong className="text-gray-900">Building the "Illusion":</strong> To get that hourglass, "snatched" look, we focused heavily on building her glutes and her shoulders. When your shoulders and glutes grow, your waist naturally looks smaller.</p>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                    <p className="text-[15px] text-gray-600 leading-relaxed"><strong className="text-gray-900">Rest Days:</strong> I forced her to take rest days. You don't grow in the gym; you grow when you recover.</p>
                  </li>
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 mb-8 shadow-sm">
                  <Image src="/before-after/before_IMG_1275.jpg" alt="Before" fill className="object-cover" />
                  <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-gray-200 text-[9px] uppercase tracking-widest text-gray-600 font-semibold">Before</div>
                </div>
                <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-[#0b1509]/20 bg-gray-100 mt-8 shadow-md">
                  <Image src="/before-after/after_IMG_4277.jpg" alt="After Progress" fill className="object-cover" />
                  <div className="absolute top-3 right-3 bg-[#0b1509] px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-white shadow-sm">After</div>
                </div>
              </div>
            </div>

            {/* PHASE 3 */}
            <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
              <div className="order-2 md:order-1 grid grid-cols-2 gap-4">
                <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-[#0b1509]/20 bg-gray-100 mt-8 shadow-md">
                  <Image src="/before-after/after_IMG_4865.jpg" alt="After" fill className="object-cover" />
                  <div className="absolute bottom-3 left-3 bg-[#0b1509] px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-white shadow-sm">After</div>
                </div>
                <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-[#0b1509]/20 bg-gray-100 shadow-md">
                  <Image src="/before-after/after_IMG_5492.jpg" alt="After" fill className="object-cover" />
                </div>
              </div>
              <div className="order-1 md:order-2">
                <span className="inline-block font-mono text-[10px] tracking-widest text-gray-500 bg-gray-200 border border-gray-300 px-3 py-1 rounded-full mb-6">PHASE 3</span>
                <h3 className="font-display text-3xl text-gray-900 mb-6">The Mindset Shift</h3>
                <p className="text-[15px] text-gray-600 mb-8 pb-8 border-b border-gray-200 leading-relaxed">
                  The hardest part wasn't the workouts—it was the mental shift of seeing the scale go UP, but realizing her body looked tighter, leaner, and better than ever.
                </p>
                <ul className="space-y-6">
                  <li className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                    <p className="text-[15px] text-gray-600 leading-relaxed"><strong className="text-gray-900">Throw away the scale:</strong> Muscle is denser than fat. She gained weight, but she dropped dress sizes.</p>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                    <p className="text-[15px] text-gray-600 leading-relaxed"><strong className="text-gray-900">Consistency over perfection:</strong> We didn't aim for 100% perfection. We aimed for 80% consistency over a long period of time.</p>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA / OUTRO */}
      <section className="py-32 px-6 bg-white border-t border-gray-200 text-center relative overflow-hidden">
        <div className="max-w-2xl mx-auto relative z-10 flex flex-col items-center">
          
          <div className="flex justify-center gap-4 mb-12">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-[3px] border-white shadow-lg">
              <Image src="/before-after/after_IMG_4688.jpg" alt="Final Result" fill className="object-cover" />
            </div>
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-[3px] border-white shadow-lg">
              <Image src="/before-after/after_IMG_5533.jpg" alt="Final Result" fill className="object-cover" />
            </div>
          </div>

          <Heart className="text-gray-300 w-8 h-8 mb-8" />
          <h2 className="font-display text-4xl md:text-5xl text-gray-900 mb-6">
            Want me to do for you what I did for MJ?
          </h2>
          <p className="text-[15px] text-gray-500 leading-relaxed mb-12 max-w-lg mx-auto">
            I don't just train my girlfriend. I run a full online coaching program helping people stop guessing and actually build a physique that commands respect. If you want the exact step-by-step coaching, accountability, and custom programming to build your dream body...
          </p>
          
          <Link href="/apply" className="group flex items-center gap-4 bg-[#0b1509] text-white font-semibold px-10 py-5 rounded-2xl hover:bg-black transition-all hover:scale-105 shadow-md">
            <span className="text-sm">Apply For Coaching</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-[11px] text-gray-400 mt-6 tracking-wider uppercase">(Let me know MJ sent you!)</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-10 md:px-24 bg-gray-50 flex flex-col md:flex-row items-center justify-between border-t border-gray-200 text-[11px] font-mono tracking-widest uppercase text-gray-400 gap-6">
        <div className="flex-1 flex justify-center md:justify-start w-full md:w-auto">
          <p>&copy; 2026 Zana Fitness</p>
        </div>
        <div className="flex-1 flex justify-center">
          <ZanaLogo className="h-3 text-gray-300" />
        </div>
        <div className="flex-1 flex justify-center md:justify-end gap-5 w-full md:w-auto">
          <a href="https://www.instagram.com/javi_zana/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 transition-colors">Instagram</a>
          <a href="https://www.tiktok.com/@javi_zana?lang=en" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 transition-colors">TikTok</a>
        </div>
      </footer>

    </main>
  );
}
