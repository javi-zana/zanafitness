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

type Feature = { text: string; included: boolean; emphasize?: string };

function PlanCard({
  label,
  months,
  monthly,
  upfront,
  checkoutUrl,
  features,
  featured,
  badge,
}: {
  label: string;
  months: number;
  monthly: number;
  upfront: number;
  checkoutUrl: string;
  features: Feature[];
  featured?: boolean;
  badge?: string;
}) {
  const dim = featured ? "text-[#0f1a0c]/50" : "text-[#edf5e2]/35";
  const bright = featured ? "text-[#0f1a0c]" : "text-[#edf5e2]";
  const monthlyTotal = monthly * months;
  const savings = monthlyTotal - upfront;

  return (
    <div
      className={`flex flex-col rounded-3xl relative overflow-hidden ${
        featured
          ? "bg-[#b0e455] text-[#0f1a0c]"
          : "bg-[#162212] border border-[#b0e455]/10 text-[#edf5e2]"
      }`}
    >
      {featured && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(ellipse at 100% 0%, rgba(255,255,255,0.18) 0%, transparent 55%)' }} />
      )}

      {/* Header block */}
      <div className={`px-8 pt-8 pb-6 border-b ${featured ? "border-[#0f1a0c]/10" : "border-[#b0e455]/8"}`}>
        <div className="flex items-center justify-between min-h-[24px] mb-4">
          <p className={`text-[10px] font-bold tracking-[0.2em] uppercase ${featured ? "text-[#0f1a0c]/50" : "text-[#b0e455]"}`}>{label}</p>
          {badge ? (
            <span className="inline-block bg-[#0f1a0c] text-[#b0e455] text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
              {badge}
            </span>
          ) : (
            <span className="inline-block text-[10px] px-3 py-1 opacity-0 select-none">Best Value</span>
          )}
        </div>

        {/* Upfront price — hero */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className={`font-display text-5xl leading-none ${bright}`}>${upfront.toLocaleString()}</span>
          <span className={`text-base font-semibold ${dim}`}>upfront</span>
        </div>
        <p className={`text-xs mb-5 ${dim}`}>paid in full · {months} months{savings > 0 ? ` · save $${savings.toLocaleString()}` : ""}</p>

        {/* Monthly option — secondary */}
        <div className={`flex items-center justify-between rounded-2xl px-4 py-3 ${featured ? "bg-[#0f1a0c]/8" : "bg-[#b0e455]/6"}`}>
          <div>
            <div className="flex items-baseline gap-1">
              <span className={`font-display text-2xl leading-none ${bright}`}>${monthly}</span>
              <span className={`text-xs font-semibold ${dim}`}>/month</span>
            </div>
            <p className={`text-[10px] mt-1 ${dim}`}>billed monthly · ${monthlyTotal.toLocaleString()} over {months} months</p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="px-8 py-6 flex-1">
        <ul className="space-y-3">
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
                  <X className="w-3 h-3 text-[#edf5e2]/20" strokeWidth={2.5} />
                )}
              </div>
              {(() => {
                const cls = `text-sm ${f.included ? (featured ? "text-[#0f1a0c]/80" : "text-[#edf5e2]/70") : "text-[#edf5e2]/20 line-through"}`;
                if (f.emphasize && f.text.includes(f.emphasize)) {
                  const [before, after] = f.text.split(f.emphasize);
                  return (
                    <span className={cls}>
                      {before}<span className={`font-bold ${featured ? "text-[#0f1a0c]" : "text-[#b0e455]"}`}>{f.emphasize}</span>{after}
                    </span>
                  );
                }
                return <span className={cls}>{f.text}</span>;
              })()}
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="px-8 pb-8">
        <a
          href={checkoutUrl}
          className={`w-full py-3.5 rounded-2xl text-sm font-semibold transition-colors text-center block ${
            featured
              ? "bg-[#0f1a0c] text-[#b0e455] hover:bg-[#0a1208]"
              : "bg-[#b0e455] text-[#0f1a0c] hover:bg-[#c9f070]"
          }`}
        >
          Start Now
        </a>
      </div>
    </div>
  );
}

const groupFeatures: Feature[] = [
  { text: "Access to the ZANA App", included: true },
  { text: "Personalised training program", included: true, emphasize: "Personalised" },
  { text: "Habit-based nutrition guidance", included: true },
  { text: "Guided onboarding sequence", included: true, emphasize: "onboarding" },
  { text: "Weekly group coaching calls", included: true, emphasize: "group coaching calls" },
  { text: "The full Zana system, with a community", included: true },
  { text: "Private weekly check-ins with Javi", included: false },
  { text: "Direct access to Javi", included: false },
];

export default function GroupPricingPage() {
  return (
    <main className="min-h-screen bg-[#0b1509] text-[#edf5e2] font-sans selection:bg-[#b0e455] selection:text-[#0f1a0c]">

      {/* ── HEADER + HOOK ─────────────────────────────────────────────────────── */}
      <section className="pt-36 pb-24 px-6 text-center">
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <ZanaLogo className="h-9 md:h-11 text-[#edf5e2] mb-12 opacity-60" />
          <div className="w-6 h-px bg-[#b0e455]/30 mb-8" />

          <h1 className="font-display leading-none mb-12" style={{ fontSize: "clamp(48px, 7vw, 88px)" }}>
            Zana Fitness Group Coaching.
          </h1>

          {/* Javi quote as hook */}
          <div className="max-w-lg">
            <p className="text-[#edf5e2]/80 text-lg md:text-xl leading-relaxed font-light italic">
              &ldquo;The programs, the habits, the accountability — the full Zana method, run as a group. You get everything that works, at a fraction of the price.&rdquo;
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <div className="w-8 h-px bg-[#b0e455]/40" />
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#b0e455]/70">Javi Lorenzana</p>
              <div className="w-8 h-px bg-[#b0e455]/40" />
            </div>
          </div>

          {/* Pain bridge */}
          <p className="text-[#edf5e2]/35 text-sm leading-relaxed mt-12 max-w-sm">
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
                title: "Aesthetic, lean physique",
                sub: "Built for your schedule",
                desc: "45–60 min sessions, 4 days a week. Progressive splits that fit around client calls, travel, and late nights — not a bodybuilder's routine.",
              },
              {
                icon: <Leaf className="w-5 h-5 text-[#b0e455] stroke-1" />,
                num: "02",
                title: "Habit-based diet",
                sub: "Clarity, not restriction",
                desc: "Clear macro targets and food habits that work wherever you are. No tracking obsession. No elimination diets. Just something you can actually follow.",
              },
              {
                icon: <Target className="w-5 h-5 text-[#b0e455] stroke-[1.5]" />,
                num: "03",
                title: "Weekly group calls",
                sub: "Accountability that adapts",
                desc: "Weekly group coaching calls to bring your week, get your plan adjusted, and stay accountable alongside people on the same path.",
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

      {/* ── OUTCOME ───────────────────────────────────────────────────────────── */}
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

      {/* ── PRICING ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-[#b0e455]/6" id="pricing">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#b0e455] mb-4">The plan</p>
            <h2 className="font-display leading-[1.05] mb-3" style={{ fontSize: "clamp(30px, 4vw, 52px)" }}>Choose your<br />commitment.</h2>
            <p className="text-sm text-[#edf5e2]/35">Same group system either way. Pay upfront and save.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <PlanCard
              label="4 Months"
              months={4}
              monthly={200}
              upfront={800}
              checkoutUrl="https://whop.com/checkout/REPLACE_WITH_GROUP_4MO"
              features={groupFeatures}
            />
            <PlanCard
              label="12 Months"
              months={12}
              monthly={150}
              upfront={1500}
              checkoutUrl="https://whop.com/checkout/REPLACE_WITH_GROUP_12MO"
              features={groupFeatures}
              featured
              badge="Best Value"
            />
          </div>
          <p className="text-center text-xs text-[#edf5e2]/20 mt-7">7-day satisfaction guarantee · Secure checkout via Whop</p>
        </div>
      </section>

    </main>
  );
}
