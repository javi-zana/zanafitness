"use client";

import { Check, X, TrendingUp, Leaf, Target } from "lucide-react";
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
      <Navbar active="system" />

      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <section className="pt-40 pb-24 px-6 text-center">
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <ZanaLogo className="h-10 md:h-12 text-[#edf5e2] mb-14 opacity-70" />
          <div className="w-8 h-px bg-[#b0e455]/35 mb-10" />
          <h1 className="font-display leading-none mb-5" style={{ fontSize: "clamp(52px, 7vw, 92px)" }}>
            The System.
          </h1>
          <p className="text-sm font-medium text-[#b0e455] tracking-wider">Not a program. A protocol.</p>
        </div>
      </section>

      {/* ── THREE PILLARS ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#0f1a0c] border-y border-[#b0e455]/6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#b0e455] mb-5">Structure</p>
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
                sub: "Calculated Overload",
                desc: "A simple, progressive split built for your schedule — not a bodybuilder's. 45–60 minute sessions, structured to build the lean aesthetic look: shoulders, chest, arms.",
              },
              {
                icon: <Leaf className="w-6 h-6 text-[#b0e455] stroke-1" />,
                num: "02",
                title: "Nutrition",
                sub: "Linear Alignment",
                desc: "No elimination diets. No extreme cuts. Real food, clear macro targets, and meal habits that fit your life in Singapore, Manila, Jakarta, or wherever you are.",
              },
              {
                icon: <Target className="w-6 h-6 text-[#b0e455] stroke-[1.5]" />,
                num: "03",
                title: "Guidance",
                sub: "Constant Adaptation",
                desc: "Weekly check-ins. Adjustments when life gets busy. A coach who understands your world — the travel, the client dinners, the demanding schedule.",
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
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#b0e455] mb-10">The Result</p>
          <h2 className="font-display leading-[1.08]" style={{ fontSize: "clamp(28px, 4vw, 52px)" }}>
            The physique compounds into everything
            you&apos;ve built — career, confidence, presence.
            Start building it <span className="text-[#b0e455]">right.</span>
          </h2>
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
          <div className="grid md:grid-cols-2 gap-5">
            <PlanCard
              label="Committed"
              price={500}
              commitment="4-month commitment"
              checkoutUrl="https://whop.com/checkout/plan_DAY1fwI5NfqJe"
              features={committedFeatures}
            />
            <PlanCard
              label="All In"
              price={400}
              commitment="12-month commitment"
              checkoutUrl="https://whop.com/checkout/plan_BwaPVLzVFjYWL"
              features={allInFeatures}
              featured
            />
          </div>
          <p className="text-center text-xs text-[#edf5e2]/22 mt-8">7-day satisfaction guarantee · Secure checkout via Whop</p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
