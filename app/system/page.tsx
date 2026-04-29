"use client";

import { Check, TrendingUp, Leaf, Target } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const ZanaLogo = ({ className = "h-8" }: { className?: string }) => (
  <svg viewBox="0 0 180 32" className={className} fill="none" stroke="currentColor" strokeWidth="5" strokeMiterlimit="10">
    <path d="M0,2 H32 L18.3,14" />
    <path d="M13.7,18 L0,30 H32" />
    <path d="M48,30 L64,2 L80,30" />
    <path d="M96,30 V2 L128,30 V2" />
    <path d="M144,30 L160,2 L176,30" />
  </svg>
);


const features = [
  "Habit-based lifestyle system",
  "Simple, effective training split",
  "Personalised nutrition & macros",
  "Weekly check-ins with your coach",
  "Supplement & recovery guidance",
  "Direct access to Javi",
];

function PlanCard({
  label,
  price,
  commitment,
  variantId,
  featured,
}: {
  label: string;
  price: number;
  commitment: string;
  variantId: string;
  featured?: boolean;
}) {
  const checkoutUrl = `https://zana-fitness.lemonsqueezy.com/checkout/buy/${variantId}?checkout[redirect_url]=https://zanafitness.com/dashboard&embed=1`;

  return (
    <div
      className={`flex flex-col border ${
        featured ? "border-[#b3cdff] shadow-[0_0_80px_-20px_rgba(179,205,255,0.15)]" : "border-[#2d3a4b]"
      } rounded-2xl p-10 md:p-12 relative bg-[#1a222c]`}
    >
      {featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#b3cdff] text-black text-[9px] font-bold uppercase tracking-widest px-4 py-1 rounded-full whitespace-nowrap">
          Best Value
        </span>
      )}

      <p className="text-[9px] uppercase tracking-widest font-bold text-[#b3cdff] mb-2">{label}</p>
      <div className="flex items-end gap-2 mb-1">
        <span className="text-4xl md:text-5xl font-light text-white">${price}</span>
        <span className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">/mo</span>
      </div>
      <p className="text-[9px] uppercase tracking-widest text-gray-500 mb-10">{commitment}</p>

      <ul className="space-y-4 mb-12 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-3">
            <Check
              className={`w-3 h-3 flex-shrink-0 ${featured ? "text-[#b3cdff]" : "text-gray-500"}`}
              strokeWidth={2.5}
            />
            <span className="text-[10px] uppercase tracking-widest text-gray-300">{f}</span>
          </li>
        ))}
      </ul>

      <a
        href={checkoutUrl}
        className={`lemonsqueezy-button w-full py-4 rounded-full text-[10px] uppercase tracking-widest font-bold transition-colors text-center ${
          featured
            ? "bg-[#b3cdff] text-black hover:bg-white"
            : "border border-[#2d3a4b] text-gray-300 hover:border-[#b3cdff] hover:text-[#b3cdff]"
        }`}
      >
        JOIN THE SYSTEM
      </a>
    </div>
  );
}

export default function SystemPage() {
  return (
    <main className="min-h-screen bg-[#121821] text-white font-sans selection:bg-[#b3cdff] selection:text-[#121821]">

      <Navbar active="system" />

      {/* HEADER */}
      <section className="pt-40 pb-20 px-6 text-center bg-[#121821]">
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <ZanaLogo className="h-10 md:h-12 text-white mb-12" />
          <div className="w-8 h-px bg-gray-500 mb-12"></div>
          <h1 className="text-2xl md:text-4xl font-sans font-light tracking-[0.1em] uppercase leading-tight text-white mb-6">
            The System.
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#b3cdff]">Not a program. A protocol.</p>
        </div>
      </section>

      {/* SYSTEM EXPECTATIONS */}
      <section className="py-24 px-6 bg-[#1a222c] border-y border-[#2d3a4b]">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          <p className="text-[#b3cdff] font-mono text-[10px] tracking-widest mb-10">EXPECTATIONS</p>
          <h2 className="text-xl md:text-2xl font-sans font-light tracking-[0.15em] uppercase text-center mb-20">
            A framework built on structure.
          </h2>
          <div className="grid md:grid-cols-3 gap-16 md:gap-0 w-full text-center px-4">

            <div className="flex flex-col items-center md:border-r border-[#2d3a4b] md:pr-16">
               <TrendingUp className="w-8 h-8 text-gray-300 stroke-1 mb-8" />
               <div className="font-mono text-[10px] tracking-widest text-[#b3cdff] mb-4">01</div>
               <h3 className="uppercase tracking-[0.2em] text-xs font-bold mb-3 text-white">Training</h3>
               <p className="font-mono text-gray-400 uppercase tracking-widest text-[9px]">Calculated Overload</p>
               <p className="mt-4 font-inter text-xs text-gray-500 leading-snug">A simple, progressive split built for your schedule — not a bodybuilder's. 45–60 minute sessions, structured to build the lean aesthetic look: shoulders, chest, arms.</p>
            </div>

            <div className="flex flex-col items-center md:border-r border-[#2d3a4b] md:px-16">
               <Leaf className="w-8 h-8 text-gray-300 stroke-1 mb-8" />
               <div className="font-mono text-[10px] tracking-widest text-[#b3cdff] mb-4">02</div>
               <h3 className="uppercase tracking-[0.2em] text-xs font-bold mb-3 text-white">Nutrition</h3>
               <p className="font-mono text-gray-400 uppercase tracking-widest text-[9px]">Linear Alignment</p>
               <p className="mt-4 font-inter text-xs text-gray-500 leading-snug">No elimination diets. No extreme cuts. Real food, clear macro targets, and meal habits that fit your life in Singapore, Manila, Jakarta, or wherever you are.</p>
            </div>

            <div className="flex flex-col items-center md:pl-16">
               <Target className="w-8 h-8 text-gray-300 stroke-[1.5] mb-8" />
               <div className="font-mono text-[10px] tracking-widest text-[#b3cdff] mb-4">03</div>
               <h3 className="uppercase tracking-[0.2em] text-xs font-bold mb-3 text-white">Guidance</h3>
               <p className="font-mono text-gray-400 uppercase tracking-widest text-[9px]">Constant Adaptation</p>
               <p className="mt-4 font-inter text-xs text-gray-500 leading-snug">Weekly check-ins. Adjustments when life gets busy. A coach who understands your world — the travel, the client dinners, the demanding schedule.</p>
            </div>

          </div>
        </div>
      </section>

      {/* CORE STATEMENT */}
      <section className="py-24 px-6 text-center bg-[#121821]">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <p className="text-[#b3cdff] font-mono text-[10px] tracking-widest mb-10">THE RESULT</p>
          <h2 className="text-xl md:text-3xl font-sans font-light tracking-[0.15em] uppercase leading-tight text-white mb-10">
            The physique compounds into everything else<br />
            you've built — career, confidence, presence.<br />
            Start building it <span className="text-[#b3cdff]">right.</span>
          </h2>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="py-24 px-6 bg-[#0f141b]">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-20">
            <p className="text-[#b3cdff] font-mono text-[10px] tracking-widest mb-4">INSIDE THE PLATFORM</p>
            <h2 className="text-xl md:text-3xl font-sans font-light tracking-[0.15em] uppercase text-white">What You Get</h2>
          </div>

          {/* Member Dashboard */}
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 mb-28">

            {/* Mock UI — Member */}
            <div className="w-full max-w-[300px] mx-auto lg:mx-0 shrink-0">
              <div className="bg-[#0a0f16] border border-[#2d3a4b] rounded-2xl overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a222c]">
                  <svg viewBox="0 0 180 32" className="h-4 text-white" fill="none" stroke="currentColor" strokeWidth="5" strokeMiterlimit="10"><path d="M0,2 H32 L18.3,14"/><path d="M13.7,18 L0,30 H32"/><path d="M48,30 L64,2 L80,30"/><path d="M96,30 V2 L128,30 V2"/><path d="M144,30 L160,2 L176,30"/></svg>
                  <span className="font-mono text-[7px] tracking-widest uppercase px-2 py-0.5 border border-[#86efac]/30 text-[#86efac] bg-[#86efac]/5 rounded-sm">Member</span>
                </div>
                {/* Body */}
                <div className="p-4 space-y-3">
                  {/* Welcome */}
                  <div>
                    <p className="font-mono text-[7px] text-gray-500 uppercase tracking-widest">Welcome back</p>
                    <p className="text-sm font-light text-white uppercase tracking-wide mt-0.5">Priya.</p>
                  </div>
                  {/* Streak */}
                  <div className="flex gap-2">
                    <div className="flex-1 bg-[#121821] border border-[#2d3a4b] rounded p-3">
                      <p className="font-mono text-[7px] text-gray-500 uppercase tracking-widest mb-1">Streak</p>
                      <p className="text-lg font-light text-[#b3cdff]">67<span className="text-xs text-gray-500 ml-1">days</span></p>
                    </div>
                    <div className="flex-1 bg-[#121821] border border-[#2d3a4b] rounded p-3">
                      <p className="font-mono text-[7px] text-gray-500 uppercase tracking-widest mb-1">Phase</p>
                      <p className="text-lg font-light text-white">03</p>
                    </div>
                  </div>
                  {/* Today's workout */}
                  <div className="bg-[#121821] border border-[#b3cdff]/20 rounded p-3">
                    <p className="font-mono text-[7px] text-[#b3cdff] uppercase tracking-widest mb-1">Today</p>
                    <p className="text-xs text-white font-medium">Upper Body A</p>
                    <p className="font-mono text-[8px] text-gray-500 mt-0.5">6 exercises · 55 min</p>
                    <div className="mt-2 w-full bg-[#0f141b] rounded-full h-1">
                      <div className="bg-[#b3cdff] h-1 rounded-full" style={{width:"45%"}} />
                    </div>
                  </div>
                  {/* Community preview */}
                  <div className="bg-[#121821] border border-[#2d3a4b] rounded p-3">
                    <p className="font-mono text-[7px] text-gray-500 uppercase tracking-widest mb-2">Community</p>
                    <div className="flex gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#b3cdff]/15 border border-[#b3cdff]/30 flex items-center justify-center shrink-0">
                        <span className="font-mono text-[6px] text-[#b3cdff]">PS</span>
                      </div>
                      <p className="font-mono text-[8px] text-gray-400 leading-tight">Deadlifts felt strong today. Hit 145kg × 3.</p>
                    </div>
                  </div>
                  {/* DM preview */}
                  <div className="bg-[#121821] border border-[#2d3a4b] rounded p-3 flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#b3cdff] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <div>
                      <p className="font-mono text-[7px] text-gray-500 uppercase tracking-widest">Javi</p>
                      <p className="font-mono text-[8px] text-gray-300">Great work this week 💪</p>
                    </div>
                  </div>
                </div>
                {/* Bottom nav */}
                <div className="border-t border-[#1a222c] flex">
                  {["Home","Programs","Schedule","Community","Messages"].map((t, i) => (
                    <div key={t} className={`flex-1 py-2 flex flex-col items-center gap-0.5 ${i === 0 ? "text-[#b3cdff]" : "text-gray-600"}`}>
                      <div className={`w-3 h-3 rounded-sm ${i === 0 ? "bg-[#b3cdff]/30" : "bg-[#2d3a4b]/50"}`} />
                      <span className="font-mono text-[5px] uppercase tracking-wider">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Highlights — Member */}
            <div className="flex-1">
              <p className="font-mono text-[8px] tracking-[0.3em] text-[#b3cdff] uppercase mb-3">For Members</p>
              <h3 className="text-xl md:text-2xl font-light tracking-[0.1em] uppercase text-white mb-8">Your personal system,<br/>in your pocket.</h3>
              <div className="space-y-5">
                {[
                  { title: "Your Training Plan", desc: "Progressive workouts built for your schedule. Updated as you advance through phases." },
                  { title: "Weekly Check-ins", desc: "Submit your check-in every week. Javi reviews it and adjusts your plan accordingly." },
                  { title: "Direct Messaging", desc: "Message Javi or other members directly. Real-time chat, full history saved." },
                  { title: "Community Feed", desc: "Post wins, ask questions, stay accountable. Grouped by date with likes and comments." },
                  { title: "Weekly Calendar", desc: "See what's coming — training days, live calls, deadlines — all in one view." },
                  { title: "Streak Tracking", desc: "Daily check-in streak keeps you consistent. Simple but effective." },
                ].map(f => (
                  <div key={f.title} className="flex gap-4">
                    <div className="mt-1 w-1 h-1 rounded-full bg-[#b3cdff] shrink-0" />
                    <div>
                      <p className="text-sm text-white font-medium tracking-wide">{f.title}</p>
                      <p className="font-mono text-[9px] text-gray-500 mt-0.5 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Coach Dashboard */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20">

            {/* Mock UI — Coach */}
            <div className="w-full max-w-[420px] mx-auto lg:mx-0 shrink-0">
              <div className="bg-[#0a0f16] border border-[#2d3a4b] rounded-2xl overflow-hidden shadow-2xl flex">
                {/* Sidebar */}
                <div className="w-14 bg-[#060b10] border-r border-[#1a222c] flex flex-col items-center py-4 gap-1">
                  <svg viewBox="0 0 32 32" className="h-4 text-white mb-3" fill="none" stroke="currentColor" strokeWidth="5" strokeMiterlimit="10"><path d="M0,2 H32 L18.3,14"/><path d="M13.7,18 L0,30 H32"/></svg>
                  {["Ov","Mb","Co","Mg","Pr","Sc"].map((label, i) => (
                    <div key={label} className={`w-8 h-7 rounded flex items-center justify-center font-mono text-[7px] uppercase tracking-wider ${i === 0 ? "bg-[#b3cdff]/10 text-[#b3cdff] border-l-2 border-[#b3cdff]" : "text-gray-600"}`}>{label}</div>
                  ))}
                </div>
                {/* Main */}
                <div className="flex-1 p-4 space-y-3 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[7px] text-gray-500 uppercase tracking-widest">Overview</p>
                    <span className="font-mono text-[7px] tracking-widest uppercase px-2 py-0.5 border border-[#b3cdff]/30 text-[#b3cdff] bg-[#b3cdff]/5 rounded-sm">Coach</span>
                  </div>
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {[{l:"Members",v:"8",c:"#fff"},{l:"Active",v:"3",c:"#86efac"},{l:"Pending",v:"5",c:"#fbbf24"}].map(s => (
                      <div key={s.l} className="bg-[#121821] border border-[#2d3a4b] rounded p-2 text-center">
                        <p className="text-base font-light" style={{color:s.c}}>{s.v}</p>
                        <p className="font-mono text-[6px] text-gray-500 uppercase tracking-wider mt-0.5">{s.l}</p>
                      </div>
                    ))}
                  </div>
                  {/* Member rows */}
                  <div className="bg-[#121821] border border-[#2d3a4b] rounded overflow-hidden">
                    <p className="font-mono text-[7px] text-gray-500 uppercase tracking-widest px-3 py-2 border-b border-[#0f141b]">Members</p>
                    {[
                      {i:"PS",n:"Priya S.",streak:67,c:"#b3cdff",pct:88},
                      {i:"AT",n:"Aiko T.", streak:45,c:"#86efac",pct:72},
                      {i:"MC",n:"Marcus C.",streak:28,c:"#fbbf24",pct:55},
                    ].map(m => (
                      <div key={m.i} className="flex items-center gap-2 px-3 py-2 border-b border-[#0f141b] last:border-0">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center font-mono text-[6px] shrink-0" style={{color:m.c,backgroundColor:m.c+"15",border:`1px solid ${m.c}30`}}>{m.i}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-[8px] text-white truncate">{m.n}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="flex-1 h-0.5 bg-[#0f141b] rounded-full">
                              <div className="h-0.5 rounded-full" style={{width:`${m.pct}%`,backgroundColor:m.c}} />
                            </div>
                            <span className="font-mono text-[6px]" style={{color:m.c}}>{m.streak}d</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Messages preview */}
                  <div className="bg-[#121821] border border-[#2d3a4b] rounded p-2.5 flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#b3cdff] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <div className="min-w-0">
                      <p className="font-mono text-[7px] text-gray-500 uppercase tracking-widest">Priya Sharma</p>
                      <p className="font-mono text-[8px] text-gray-300 truncate">Ready for this week's session 🔥</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Highlights — Coach */}
            <div className="flex-1">
              <p className="font-mono text-[8px] tracking-[0.3em] text-[#b3cdff] uppercase mb-3">For Coaches</p>
              <h3 className="text-xl md:text-2xl font-light tracking-[0.1em] uppercase text-white mb-8">Full visibility.<br/>Zero admin overhead.</h3>
              <div className="space-y-5">
                {[
                  { title: "Member Roster", desc: "See every member's streak, phase, check-in status and last active time at a glance." },
                  { title: "Check-in Tracking", desc: "Know who's submitted and who hasn't. Pending check-ins surface automatically." },
                  { title: "Direct Messaging", desc: "Message any member or coach individually. Full history, real-time delivery." },
                  { title: "Program Management", desc: "Upload workouts, meal plans, videos and instructions. Assign to members by plan." },
                  { title: "Community Control", desc: "Post announcements, reply to members, delete any post. Full moderation tools." },
                  { title: "Schedule & Events", desc: "Manage group calls, 1:1 reviews and deadlines. Members see it all in their calendar." },
                ].map(f => (
                  <div key={f.title} className="flex gap-4">
                    <div className="mt-1 w-1 h-1 rounded-full bg-[#b3cdff] shrink-0" />
                    <div>
                      <p className="text-sm text-white font-medium tracking-wide">{f.title}</p>
                      <p className="font-mono text-[9px] text-gray-500 mt-0.5 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* PRICING */}
      <section className="py-24 px-6 bg-[#1a222c] border-y border-[#2d3a4b]" id="pricing">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-xl md:text-3xl font-sans font-light tracking-[0.15em] uppercase text-white mb-4">Choose Your Commitment Level.</h2>
            <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400">All plans include the full system. Choose how long you're in.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <PlanCard
              label="Entry"
              price={500}
              commitment="3-month commitment"
              variantId="f0300d4c-3b86-4b56-9bd3-767779edbfaf"
            />
            <PlanCard
              label="Committed"
              price={400}
              commitment="6-month commitment"
              variantId="218015ad-39b5-4d64-9158-c4864fb8038a"
            />
            <PlanCard
              label="All In"
              price={300}
              commitment="12-month commitment"
              variantId="174b1e98-247a-41e2-bcfe-7ce449e329a7"
              featured
            />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
