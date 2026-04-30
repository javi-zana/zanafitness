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
  checkoutUrl,
  featured,
}: {
  label: string;
  price: number;
  commitment: string;
  checkoutUrl: string;
  featured?: boolean;
}) {

  return (
    <div
      className={`flex flex-col rounded-3xl p-8 md:p-10 relative ${
        featured
          ? "bg-[#b0e455] text-[#0f1a0c]"
          : "bg-[#1c2e16] border border-[#b0e455]/12 text-[#edf5e2]"
      }`}
    >
      {featured && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0f1a0c] text-[#b0e455] text-xs font-semibold px-4 py-1.5 rounded-full whitespace-nowrap border border-[#b0e455]/20">
          Best Value
        </span>
      )}

      <p className={`text-xs font-semibold tracking-wider uppercase mb-2 ${featured ? "text-[#0f1a0c]/60" : "text-[#b0e455]"}`}>{label}</p>
      <div className="flex items-end gap-2 mb-1">
        <span className={`text-5xl font-bold ${featured ? "text-[#0f1a0c]" : "text-[#edf5e2]"}`}>${price}</span>
        <span className={`text-sm mb-2 ${featured ? "text-[#0f1a0c]/50" : "text-[#edf5e2]/40"}`}>/mo</span>
      </div>
      <p className={`text-xs mb-10 ${featured ? "text-[#0f1a0c]/50" : "text-[#edf5e2]/40"}`}>{commitment}</p>

      <ul className="space-y-3 mb-10 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${featured ? "bg-[#0f1a0c]/10" : "bg-[#b0e455]/12"}`}>
              <Check
                className={`w-3 h-3 flex-shrink-0 ${featured ? "text-[#0f1a0c]" : "text-[#b0e455]"}`}
                strokeWidth={2.5}
              />
            </div>
            <span className={`text-sm ${featured ? "text-[#0f1a0c]/80" : "text-[#edf5e2]/70"}`}>{f}</span>
          </li>
        ))}
      </ul>

      <a
        href={checkoutUrl}
        className={`w-full py-4 rounded-2xl text-sm font-semibold transition-colors text-center ${
          featured
            ? "bg-[#0f1a0c] text-[#b0e455] hover:bg-[#162212]"
            : "bg-[#b0e455] text-[#0f1a0c] hover:bg-[#c9f070]"
        }`}
      >
        Join the System
      </a>
    </div>
  );
}

export default function SystemPage() {
  return (
    <main className="min-h-screen bg-[#0f1a0c] text-[#edf5e2] font-sans selection:bg-[#b0e455] selection:text-[#0f1a0c]">

      <Navbar active="system" />

      {/* HEADER */}
      <section className="pt-40 pb-20 px-6 text-center">
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <ZanaLogo className="h-10 md:h-12 text-[#edf5e2] mb-12 opacity-80" />
          <div className="w-10 h-px bg-[#b0e455]/30 mb-10" />
          <h1 className="font-display leading-none mb-5" style={{ fontSize: "clamp(48px, 6vw, 80px)" }}>
            The System.
          </h1>
          <p className="text-sm font-medium text-[#b0e455] tracking-wider">Not a program. A protocol.</p>
        </div>
      </section>

      {/* THREE PILLARS */}
      <section className="py-20 px-6 bg-[#162212] border-y border-[#b0e455]/8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#b0e455] mb-4">Expectations</p>
            <h2 className="font-display leading-none" style={{ fontSize: "clamp(32px, 4vw, 56px)" }}>
              A framework built on structure.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <TrendingUp className="w-7 h-7 text-[#b0e455] stroke-1" />,
                num: "01",
                title: "Training",
                sub: "Calculated Overload",
                desc: "A simple, progressive split built for your schedule - not a bodybuilder's. 45-60 minute sessions, structured to build the lean aesthetic look: shoulders, chest, arms.",
              },
              {
                icon: <Leaf className="w-7 h-7 text-[#b0e455] stroke-1" />,
                num: "02",
                title: "Nutrition",
                sub: "Linear Alignment",
                desc: "No elimination diets. No extreme cuts. Real food, clear macro targets, and meal habits that fit your life in Singapore, Manila, Jakarta, or wherever you are.",
              },
              {
                icon: <Target className="w-7 h-7 text-[#b0e455] stroke-[1.5]" />,
                num: "03",
                title: "Guidance",
                sub: "Constant Adaptation",
                desc: "Weekly check-ins. Adjustments when life gets busy. A coach who understands your world - the travel, the client dinners, the demanding schedule.",
              },
            ].map(p => (
              <div key={p.num} className="bg-[#1c2e16] rounded-3xl p-8 border border-[#b0e455]/8">
                <div className="mb-6">{p.icon}</div>
                <p className="text-xs font-semibold text-[#b0e455] mb-3">{p.num} · {p.sub}</p>
                <h3 className="text-lg font-bold text-[#edf5e2] mb-3">{p.title}</h3>
                <p className="text-sm text-[#edf5e2]/55 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CORE STATEMENT */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold tracking-wider uppercase text-[#b0e455] mb-8">The Result</p>
          <h2 className="font-display leading-none" style={{ fontSize: "clamp(32px, 4.5vw, 60px)" }}>
            The physique compounds into everything<br />
            you've built - career, confidence, presence.<br />
            Start building it <span className="text-[#b0e455]">right.</span>
          </h2>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="py-20 px-6 bg-[#162212] border-t border-[#b0e455]/8">
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-16">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#b0e455] mb-4">Inside the Platform</p>
            <h2 className="font-display leading-none mb-6" style={{ fontSize: "clamp(32px, 4.5vw, 60px)" }}>What You Get</h2>
            <a href="/demo" className="inline-flex items-center gap-2 text-sm font-medium text-[#b0e455] border border-[#b0e455]/25 px-5 py-2.5 rounded-full hover:bg-[#b0e455]/8 transition-colors">
              Preview the App →
            </a>
          </div>

          {/* Member features */}
          <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16 mb-20">
            <div className="w-full max-w-[260px] mx-auto shrink-0">
              <div className="bg-[#0f1a0c] border border-[#b0e455]/12 rounded-3xl overflow-hidden shadow-[0_0_60px_-20px_rgba(176,228,85,0.15)]">
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#b0e455]/8">
                  <svg viewBox="0 0 180 32" className="h-4 text-[#edf5e2]" fill="none" stroke="currentColor" strokeWidth="5" strokeMiterlimit="10"><path d="M0,2 H32 L18.3,14"/><path d="M13.7,18 L0,30 H32"/><path d="M48,30 L64,2 L80,30"/><path d="M96,30 V2 L128,30 V2"/><path d="M144,30 L160,2 L176,30"/></svg>
                  <span className="text-[9px] font-semibold px-2 py-0.5 bg-[#86efac]/10 border border-[#86efac]/25 text-[#86efac] rounded-full">Member</span>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-[9px] text-[#edf5e2]/35 uppercase tracking-wide mb-0.5">Welcome back</p>
                    <p className="text-sm font-semibold text-[#edf5e2]">Priya.</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-[#1c2e16] border border-[#b0e455]/8 rounded-xl p-3">
                      <p className="text-[9px] text-[#edf5e2]/35 uppercase mb-1">Streak</p>
                      <p className="text-lg font-bold text-[#b0e455]">67<span className="text-xs text-[#edf5e2]/30 ml-1">days</span></p>
                    </div>
                    <div className="flex-1 bg-[#1c2e16] border border-[#b0e455]/8 rounded-xl p-3">
                      <p className="text-[9px] text-[#edf5e2]/35 uppercase mb-1">Phase</p>
                      <p className="text-lg font-bold text-[#edf5e2]">03</p>
                    </div>
                  </div>
                  <div className="bg-[#1c2e16] border border-[#b0e455]/20 rounded-xl p-3">
                    <p className="text-[9px] text-[#b0e455] uppercase tracking-wide mb-1.5">Today</p>
                    <p className="text-xs font-semibold text-[#edf5e2]">Upper Body A</p>
                    <p className="text-[9px] text-[#edf5e2]/40 mt-0.5">6 exercises · 55 min</p>
                    <div className="mt-2.5 w-full bg-[#0f1a0c] rounded-full h-1">
                      <div className="bg-[#b0e455] h-1 rounded-full" style={{width:"45%"}} />
                    </div>
                  </div>
                  <div className="bg-[#1c2e16] border border-[#b0e455]/8 rounded-xl p-3 flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#b0e455] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <div>
                      <p className="text-[9px] text-[#edf5e2]/35 uppercase mb-0.5">Javi</p>
                      <p className="text-xs text-[#edf5e2]/70">Great work this week 💪</p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-[#b0e455]/8 flex">
                  {["Home","Programs","Schedule","Community","Messages"].map((t, i) => (
                    <div key={t} className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 ${i === 0 ? "text-[#b0e455]" : "text-[#edf5e2]/20"}`}>
                      <div className={`w-3 h-3 rounded-sm ${i === 0 ? "bg-[#b0e455]/25" : "bg-[#1c2e16]"}`} />
                      <span className="text-[5px] uppercase tracking-wide">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1">
              <p className="text-xs font-semibold tracking-wider uppercase text-[#b0e455] mb-4">For Members</p>
              <h3 className="font-display leading-none mb-8" style={{ fontSize: "clamp(28px, 3.5vw, 44px)" }}>Your personal system,<br/>in your pocket.</h3>
              <div className="space-y-5">
                {[
                  { title: "Your Training Plan", desc: "Progressive workouts built for your schedule. Updated as you advance through phases." },
                  { title: "Weekly Check-ins", desc: "Submit your check-in every week. Javi reviews it and adjusts your plan accordingly." },
                  { title: "Direct Messaging", desc: "Message Javi or other members directly. Real-time chat, full history saved." },
                  { title: "Community Feed", desc: "Post wins, ask questions, stay accountable. Grouped by date with likes and comments." },
                  { title: "Weekly Calendar", desc: "See what's coming - training days, live calls, deadlines - all in one view." },
                  { title: "Streak Tracking", desc: "Daily check-in streak keeps you consistent. Simple but effective." },
                ].map(f => (
                  <div key={f.title} className="flex gap-4">
                    <div className="mt-1.5 w-4 h-4 rounded-full bg-[#b0e455]/12 border border-[#b0e455]/25 flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5">
                        <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#b0e455" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#edf5e2] mb-0.5">{f.title}</p>
                      <p className="text-sm text-[#edf5e2]/50 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Coach features */}
          <div className="flex flex-col lg:flex-row-reverse items-start gap-12 lg:gap-16">
            <div className="w-full max-w-[380px] mx-auto shrink-0">
              <div className="bg-[#0f1a0c] border border-[#b0e455]/12 rounded-3xl overflow-hidden shadow-[0_0_60px_-20px_rgba(176,228,85,0.12)] flex">
                <div className="w-14 bg-[#0c1309] border-r border-[#b0e455]/8 flex flex-col items-center py-4 gap-1">
                  <svg viewBox="0 0 32 32" className="h-4 text-[#edf5e2] mb-3" fill="none" stroke="currentColor" strokeWidth="5" strokeMiterlimit="10"><path d="M0,2 H32 L18.3,14"/><path d="M13.7,18 L0,30 H32"/></svg>
                  {["Ov","Mb","Co","Mg","Pr","Sc"].map((label, i) => (
                    <div key={label} className={`w-8 h-7 rounded flex items-center justify-center text-[8px] font-medium ${i === 0 ? "bg-[#b0e455]/12 text-[#b0e455] border-l-2 border-[#b0e455]" : "text-[#edf5e2]/25"}`}>{label}</div>
                  ))}
                </div>
                <div className="flex-1 p-4 space-y-3 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] text-[#edf5e2]/35 uppercase tracking-wide">Overview</p>
                    <span className="text-[9px] font-semibold px-2 py-0.5 bg-[#b0e455]/10 border border-[#b0e455]/20 text-[#b0e455] rounded-full">Coach</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[{l:"Members",v:"8",c:"#edf5e2"},{l:"Active",v:"3",c:"#86efac"},{l:"Pending",v:"5",c:"#fbbf24"}].map(s => (
                      <div key={s.l} className="bg-[#1c2e16] border border-[#b0e455]/8 rounded-xl p-2 text-center">
                        <p className="text-base font-bold" style={{color:s.c}}>{s.v}</p>
                        <p className="text-[8px] text-[#edf5e2]/35 uppercase mt-0.5">{s.l}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-[#1c2e16] border border-[#b0e455]/8 rounded-xl overflow-hidden">
                    <p className="text-[9px] text-[#edf5e2]/35 uppercase tracking-wide px-3 py-2 border-b border-[#b0e455]/5">Members</p>
                    {[
                      {i:"PS",n:"Priya S.",streak:67,c:"#b0e455",pct:88},
                      {i:"AT",n:"Aiko T.", streak:45,c:"#86efac",pct:72},
                      {i:"MC",n:"Marcus C.",streak:28,c:"#fbbf24",pct:55},
                    ].map(m => (
                      <div key={m.i} className="flex items-center gap-2 px-3 py-2 border-b border-[#b0e455]/5 last:border-0">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] shrink-0 font-semibold" style={{color:m.c,backgroundColor:m.c+"15",border:`1px solid ${m.c}30`}}>{m.i}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-[#edf5e2]/80 font-medium truncate">{m.n}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="flex-1 h-0.5 bg-[#0f1a0c] rounded-full">
                              <div className="h-0.5 rounded-full" style={{width:`${m.pct}%`,backgroundColor:m.c}} />
                            </div>
                            <span className="text-[8px]" style={{color:m.c}}>{m.streak}d</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <p className="text-xs font-semibold tracking-wider uppercase text-[#b0e455] mb-4">For Coaches</p>
              <h3 className="font-display leading-none mb-8" style={{ fontSize: "clamp(28px, 3.5vw, 44px)" }}>Full visibility.<br/>Zero admin overhead.</h3>
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
                    <div className="mt-1.5 w-4 h-4 rounded-full bg-[#b0e455]/12 border border-[#b0e455]/25 flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5">
                        <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#b0e455" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#edf5e2] mb-0.5">{f.title}</p>
                      <p className="text-sm text-[#edf5e2]/50 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* PRICING */}
      <section className="py-20 px-6 border-t border-[#b0e455]/8" id="pricing">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#b0e455] mb-4">Commitment</p>
            <h2 className="font-display leading-none mb-4" style={{ fontSize: "clamp(32px, 4.5vw, 60px)" }}>Choose Your<br />Commitment Level.</h2>
            <p className="text-sm text-[#edf5e2]/45">All plans include the full system. Choose how long you're in.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <PlanCard
              label="Committed"
              price={500}
              commitment="4-month commitment"
              checkoutUrl="https://whop.com/checkout/plan_DAY1fwI5NfqJe"
            />
            <PlanCard
              label="All In"
              price={400}
              commitment="12-month commitment"
              checkoutUrl="https://whop.com/checkout/plan_BwaPVLzVFjYWL"
              featured
            />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
