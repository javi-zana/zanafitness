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
      className={`flex flex-col rounded-3xl p-8 relative overflow-hidden ${
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
        <span className={`font-display text-5xl leading-none ${featured ? "text-[#0f1a0c]" : "text-[#edf5e2]"}`}>${price}</span>
        <span className={`text-sm mb-1.5 ${featured ? "text-[#0f1a0c]/45" : "text-[#edf5e2]/35"}`}>/mo</span>
      </div>
      <p className={`text-xs mb-7 ${featured ? "text-[#0f1a0c]/45" : "text-[#edf5e2]/35"}`}>{commitment}</p>

      <ul className="space-y-3 mb-8 flex-1">
        {features.map((f) => (
          <li key={f.text} className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
              f.included
                ? featured ? "bg-[#0f1a0c]/10" : "bg-[#b0e455]/10"
                : "bg-[#edf5e2]/4"
            }`}>
              {f.included ? (
                <Check className={`w-3 h-3 ${featured ? "text-[#0f1a0c]" : "text-[#b0e455]"}`} strokeWidth={2.5} />
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
        className={`w-full py-3.5 rounded-2xl text-sm font-semibold transition-colors text-center ${
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
      <section className="pt-36 pb-20 px-6 text-center">
        <div className="max-w-xl mx-auto flex flex-col items-center">
          <ZanaLogo className="h-9 md:h-11 text-[#edf5e2] mb-12 opacity-60" />
          <div className="w-6 h-px bg-[#b0e455]/30 mb-8" />
          <h1 className="font-display leading-none mb-5" style={{ fontSize: "clamp(48px, 7vw, 88px)" }}>
            The System.
          </h1>
          <p className="text-sm text-[#edf5e2]/50 leading-relaxed max-w-sm">
            Career sorted. Income sorted. Wardrobe sorted. The body is the last piece — and the one that still feels chaotic.
          </p>
        </div>
      </section>

      {/* ── THREE PILLARS ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#0f1a0c] border-y border-[#b0e455]/6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#b0e455] mb-4">How it works</p>
            <h2 className="font-display leading-none" style={{ fontSize: "clamp(30px, 4vw, 48px)" }}>
              Three pillars. One system.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: <TrendingUp className="w-5 h-5 text-[#b0e455] stroke-1" />,
                num: "01",
                title: "Training",
                sub: "Built for your schedule",
                desc: "45–60 min sessions, 4 days a week. Progressive splits that fit around client calls, travel, and late nights — not a bodybuilder's routine.",
              },
              {
                icon: <Leaf className="w-5 h-5 text-[#b0e455] stroke-1" />,
                num: "02",
                title: "Nutrition",
                sub: "Clarity, not restriction",
                desc: "Clear macro targets and food habits that work wherever you are. No tracking obsession. No elimination diets. Just something you can actually follow.",
              },
              {
                icon: <Target className="w-5 h-5 text-[#b0e455] stroke-[1.5]" />,
                num: "03",
                title: "Guidance",
                sub: "Accountability that adapts",
                desc: "Weekly check-ins with a coach who knows your world. Client dinners, travel, a schedule that changes — when life shifts, the plan shifts with it.",
              },
            ].map(p => (
              <div key={p.num} className="bg-[#162212] rounded-3xl p-7 border border-[#b0e455]/6 hover:border-[#b0e455]/14 transition-colors">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-9 h-9 rounded-xl bg-[#b0e455]/8 flex items-center justify-center">
                    {p.icon}
                  </div>
                  <span className="text-xs font-bold text-[#edf5e2]/10">{p.num}</span>
                </div>
                <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#b0e455]/50 mb-1.5">{p.sub}</p>
                <h3 className="text-base font-bold text-[#edf5e2] mb-2.5">{p.title}</h3>
                <p className="text-sm text-[#edf5e2]/45 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CORE STATEMENT ────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#b0e455] mb-8">The outcome</p>
          <h2 className="font-display leading-[1.08]" style={{ fontSize: "clamp(26px, 4vw, 48px)" }}>
            The one investment that shows up{" "}
            <span className="text-[#b0e455]">in every room.</span>
          </h2>
          <p className="text-[#edf5e2]/40 text-sm leading-relaxed mt-6 max-w-md mx-auto">
            The right physique changes how you walk into a meeting, how you show up on camera, how people read you before you say a word. It&apos;s not vanity — it&apos;s leverage. And unlike most investments, this one compounds daily.
          </p>
        </div>
      </section>

      {/* ── JAVI QUOTE ───────────────────────────────────────────────────────── */}
      <section className="py-16 px-6 border-t border-[#b0e455]/6">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-[#edf5e2]/70 text-base leading-relaxed italic">
            &ldquo;I always say that getting fit is one of the best financial decisions I have ever made. This is how I did it — and how you can too.&rdquo;
          </p>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#b0e455]/60 mt-4">Javi Lorenzana</p>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-[#b0e455]/6" id="pricing">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#b0e455] mb-4">Commitment</p>
            <h2 className="font-display leading-none mb-3" style={{ fontSize: "clamp(30px, 4vw, 52px)" }}>Choose your commitment.</h2>
            <p className="text-sm text-[#edf5e2]/35">All plans include the full system.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <PlanCard
              label="Committed · 4 Months"
              price={500}
              commitment="4-month minimum"
              checkoutUrl="https://whop.com/checkout/plan_DAY1fwI5NfqJe"
              features={committedFeatures}
            />
            <PlanCard
              label="All In · 12 Months"
              price={350}
              commitment="12-month commitment"
              checkoutUrl="https://whop.com/checkout/plan_BwaPVLzVFjYWL"
              features={allInFeatures}
              featured
            />
          </div>
          <p className="text-center text-xs text-[#edf5e2]/20 mt-7">7-day satisfaction guarantee · Secure checkout via Whop</p>
        </div>
      </section>

    </main>
  );
}
