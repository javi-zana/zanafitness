"use client";

import { Check, X, TrendingUp, Leaf, Target } from "lucide-react";


const ZanaLogo = ({ className = "h-8" }: { className?: string }) => (
  <svg viewBox="0 0 180 32" className={className} fill="none" stroke="currentColor" strokeWidth="5" strokeMiterlimit="10">
    <path d="M0,2 H32 L18.3,14" />
    <path d="M13.7,18 L0,30 H32" />
    <path d="M48,30 L64,2 L80,30" />
    <path d="M96,30 V2 L128,30 V2" />
    <path d="M144,30 L160,2 L176,30" />
  </svg>
);

type Feature = { text: string; included: boolean };

function PlanCard({
  label,
  price,
  commitment,
  checkoutUrl,
  features,
  featured,
}: {
  label: string;
  price: number;
  commitment: string;
  checkoutUrl: string;
  features: Feature[];
  featured?: boolean;
}) {
  return (
    <div
      className={`flex flex-col rounded-3xl p-8 md:p-10 relative overflow-hidden ${
        featured
          ? "bg-[#b0e455] text-[#0f1a0c]"
          : "bg-[#162212] border border-[#b0e455]/10 text-[#edf5e2]"
      }`}
    >
      {featured && (
        <>
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(ellipse at 100% 0%, rgba(255,255,255,0.22) 0%, transparent 60%)' }} />
          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0f1a0c] text-[#b0e455] text-xs font-semibold px-4 py-1.5 rounded-full whitespace-nowrap border border-[#b0e455]/20">
            Best Value
          </span>
        </>
      )}

      <p className={`text-[10px] font-bold tracking-[0.2em] uppercase mb-3 ${featured ? "text-[#0f1a0c]/50" : "text-[#b0e455]"}`}>{label}</p>
      <div className="flex items-end gap-1.5 mb-1">
        <span className={`font-display text-6xl leading-none ${featured ? "text-[#0f1a0c]" : "text-[#edf5e2]"}`}>${price}</span>
        <span className={`text-sm mb-2 ${featured ? "text-[#0f1a0c]/45" : "text-[#edf5e2]/35"}`}>/mo</span>
      </div>
      <p className={`text-xs mb-8 ${featured ? "text-[#0f1a0c]/45" : "text-[#edf5e2]/35"}`}>{commitment}</p>

      <ul className="space-y-3 mb-10 flex-1">
        {features.map((f) => (
          <li key={f.text} className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
              f.included
                ? featured ? "bg-[#0f1a0c]/10" : "bg-[#b0e455]/10"
                : "bg-[#edf5e2]/4"
            }`}>
              {f.included ? (
                <Check
                  className={`w-3 h-3 ${featured ? "text-[#0f1a0c]" : "text-[#b0e455]"}`}
                  strokeWidth={2.5}
                />
              ) : (
                <X className="w-3 h-3 text-[#edf5e2]/25" strokeWidth={2.5} />
              )}
            </div>
            <span className={`text-sm ${
              f.included
                ? featured ? "text-[#0f1a0c]/80" : "text-[#edf5e2]/70"
                : "text-[#edf5e2]/25 line-through"
            }`}>{f.text}</span>
          </li>
        ))}
      </ul>

      <a
        href={checkoutUrl}
        className={`w-full py-4 rounded-2xl text-sm font-semibold transition-colors text-center ${
          featured
            ? "bg-[#0f1a0c] text-[#b0e455] hover:bg-[#0a1208]"
            : "bg-[#b0e455] text-[#0f1a0c] hover:bg-[#c9f070]"
        }`}
      >
        Join the System
      </a>
    </div>
  );
}

const committedFeatures: Feature[] = [
  { text: "Access to the ZANA App", included: true },
  { text: "Personalised training split", included: true },
  { text: "Custom nutrition & macros", included: true },
  { text: "Weekly check-ins with your coach", included: true },
  { text: "Direct access to Javi", included: true },
  { text: "Supplement & recovery guidance", included: true },
  { text: "Quarterly progress review call", included: false },
];

const allInFeatures: Feature[] = [
  { text: "Access to the ZANA App", included: true },
  { text: "Personalised training split", included: true },
  { text: "Custom nutrition & macros", included: true },
  { text: "Weekly check-ins with your coach", included: true },
  { text: "Direct access to Javi", included: true },
  { text: "Supplement & recovery guidance", included: true },
  { text: "Quarterly progress review call", included: true },
];

export default function SystemPage() {
  return (
    <main className="min-h-screen bg-[#0b1509] text-[#edf5e2] font-sans selection:bg-[#b0e455] selection:text-[#0f1a0c]">

      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <section className="pt-40 pb-24 px-6 text-center">
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <ZanaLogo className="h-10 md:h-12 text-[#edf5e2] mb-14 opacity-70" />
          <div className="w-8 h-px bg-[#b0e455]/35 mb-10" />
          <h1 className="font-display leading-none mb-5" style={{ fontSize: "clamp(52px, 7vw, 92px)" }}>
            The System.
          </h1>
          <p className="text-sm font-medium text-[#b0e455] tracking-wider">For Asian professionals who are done letting the body be the last thing they haven&apos;t figured out.</p>
        </div>
      </section>

      {/* ── PAIN CALLOUT ─────────────────────────────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[#edf5e2]/60 text-base leading-relaxed">
            You&apos;ve built the career. The income. The wardrobe. You dress well, earn well, and carry yourself well — but in photos, at the beach, in the mirror, something&apos;s still off. You&apos;ve tried programs built for bodybuilders, diets you couldn&apos;t stick to, and schedules that assumed you had 2 free hours a day.
          </p>
          <p className="text-[#edf5e2]/80 text-base leading-relaxed mt-4 font-medium">
            The body is the one domain that still feels chaotic. That&apos;s exactly what this fixes.
          </p>
        </div>
      </section>

      {/* ── THREE PILLARS ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#0f1a0c] border-y border-[#b0e455]/6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#b0e455] mb-5">How it works</p>
            <h2 className="font-display leading-none" style={{ fontSize: "clamp(32px, 4vw, 52px)" }}>
              Three pillars. One system.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: <TrendingUp className="w-6 h-6 text-[#b0e455] stroke-1" />,
                num: "01",
                title: "Training",
                sub: "Built for your schedule",
                desc: "45–60 minute sessions, 4 days a week. No bro splits, no 2-hour sessions. A progressive plan built around client calls, travel, and late nights — structured to build the lean, aesthetic look: shoulders, chest, arms. The kind that fills a fitted shirt properly.",
              },
              {
                icon: <Leaf className="w-6 h-6 text-[#b0e455] stroke-1" />,
                num: "02",
                title: "Nutrition",
                sub: "Clarity, not restriction",
                desc: "You eat out. You travel. You're not meal-prepping on Sundays like a bodybuilder. We give you clear macro targets and real food habits that work in Singapore, Manila, Jakarta — or wherever you are. No obsessive tracking. No elimination diets. Just a system you can actually follow.",
              },
              {
                icon: <Target className="w-6 h-6 text-[#b0e455] stroke-[1.5]" />,
                num: "03",
                title: "Guidance",
                sub: "Accountability that adapts",
                desc: "Weekly check-ins with a coach who actually understands your world — the client dinners, the business travel, the gym access that changes every week. When life gets busy, the plan adjusts. You don't fall off. You just adapt.",
              },
            ].map(p => (
              <div key={p.num} className="bg-[#162212] rounded-3xl p-8 border border-[#b0e455]/6 hover:border-[#b0e455]/14 transition-colors">
                <div className="flex items-center justify-between mb-7">
                  <div className="w-10 h-10 rounded-2xl bg-[#b0e455]/8 flex items-center justify-center">
                    {p.icon}
                  </div>
                  <span className="text-xs font-bold text-[#edf5e2]/12">{p.num}</span>
                </div>
                <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#b0e455]/55 mb-2">{p.sub}</p>
                <h3 className="text-lg font-bold text-[#edf5e2] mb-3">{p.title}</h3>
                <p className="text-sm text-[#edf5e2]/50 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CORE STATEMENT ────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#b0e455] mb-10">The outcome</p>
          <h2 className="font-display leading-[1.08]" style={{ fontSize: "clamp(28px, 4vw, 52px)" }}>
            When the body matches everything else you&apos;ve built — it amplifies{" "}
            <span className="text-[#b0e455]">all of it.</span>
          </h2>
          <p className="text-[#edf5e2]/45 text-base leading-relaxed mt-8 max-w-xl mx-auto">
            Quiet confidence in a meeting. Presence in a room. The kind of guy who clearly takes care of himself without making a thing of it. The physique stops being a goal and becomes a quiet asset — one that compounds with your career, your relationships, and how you carry yourself everywhere.
          </p>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-[#b0e455]/6" id="pricing">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#b0e455] mb-5">Commitment</p>
            <h2 className="font-display leading-none mb-4" style={{ fontSize: "clamp(36px, 5vw, 64px)" }}>Choose Your<br />Commitment Level.</h2>
            <p className="text-sm text-[#edf5e2]/40">All plans include the full system. Choose how long you&apos;re in.</p>
          </div>
          {/* Commitment duration callouts */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              { months: "4", label: "months", note: "Kickstart commitment" },
              { months: "12", label: "months", note: "Full transformation" },
            ].map(tier => (
              <div key={tier.months} className="flex flex-col items-center justify-center bg-[#0f1a0c] border border-[#b0e455]/10 rounded-2xl py-5 gap-1">
                <span className="font-display text-5xl leading-none text-[#b0e455]">{tier.months}</span>
                <span className="text-xs font-bold tracking-widest uppercase text-[#edf5e2]/40">{tier.label}</span>
                <span className="text-[10px] text-[#edf5e2]/25 mt-1">{tier.note}</span>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <PlanCard
              label="Committed — 4 Months"
              price={500}
              commitment="4-month commitment"
              checkoutUrl="https://whop.com/checkout/plan_DAY1fwI5NfqJe"
              features={committedFeatures}
            />
            <PlanCard
              label="All In — 12 Months"
              price={350}
              commitment="12-month commitment · Best value"
              checkoutUrl="https://whop.com/checkout/plan_BwaPVLzVFjYWL"
              features={allInFeatures}
              featured
            />
          </div>
          <p className="text-center text-xs text-[#edf5e2]/22 mt-8">7-day satisfaction guarantee · Secure checkout via Whop</p>
        </div>
      </section>
    </main>
  );
}
