import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, TrendingUp, Leaf, Target } from "lucide-react";

export const metadata: Metadata = {
  title: "The System | ZANA Fitness",
  description: "I've been getting a lot of DMs asking about fitness. Here's everything I know in one place.",
};

const ZanaLogo = ({ className = "h-8" }: { className?: string }) => (
  <svg viewBox="0 0 180 32" className={className} fill="none" stroke="currentColor" strokeWidth="5" strokeMiterlimit="10">
    <path d="M0,2 H32 L18.3,14" />
    <path d="M13.7,18 L0,30 H32" />
    <path d="M48,30 L64,2 L80,30" />
    <path d="M96,30 V2 L128,30 V2" />
    <path d="M144,30 L160,2 L176,30" />
  </svg>
);

function DmBubble({ text, delay = "0" }: { text: string; delay?: string }) {
  return (
    <div className="flex items-start gap-3" style={{ animationDelay: delay }}>
      <div className="w-8 h-8 rounded-full bg-[#b0e455]/10 border border-[#b0e455]/15 shrink-0 flex items-center justify-center mt-0.5">
        <div className="w-3 h-3 rounded-full bg-[#b0e455]/30" />
      </div>
      <div className="bg-[#162212] border border-[#b0e455]/8 rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs md:max-w-sm">
        <p className="text-[#edf5e2]/65 text-sm leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

type Feature = { text: string; included: boolean; emphasize?: string };

function PlanCard({
  label, months, price, total, checkoutUrl, features, featured,
}: {
  label: string; months: number; price: number; total: number;
  checkoutUrl: string; features: Feature[]; featured?: boolean;
}) {
  const dim = featured ? "text-[#0f1a0c]/50" : "text-[#edf5e2]/35";
  const bright = featured ? "text-[#0f1a0c]" : "text-[#edf5e2]";

  return (
    <div className={`flex flex-col rounded-3xl relative overflow-hidden ${
      featured ? "bg-[#b0e455] text-[#0f1a0c]" : "bg-[#162212] border border-[#b0e455]/10 text-[#edf5e2]"
    }`}>
      {featured && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(ellipse at 100% 0%, rgba(255,255,255,0.18) 0%, transparent 55%)" }} />
      )}
      <div className={`px-8 pt-8 pb-6 border-b ${featured ? "border-[#0f1a0c]/10" : "border-[#b0e455]/8"}`}>
        <div className="flex items-center justify-between min-h-[24px] mb-4">
          <p className={`text-[10px] font-bold tracking-[0.2em] uppercase ${featured ? "text-[#0f1a0c]/50" : "text-[#b0e455]"}`}>{label}</p>
          {featured ? (
            <span className="inline-block bg-[#0f1a0c] text-[#b0e455] text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">Best Value</span>
          ) : (
            <span className="inline-block text-[10px] px-3 py-1 opacity-0 select-none">Best Value</span>
          )}
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className={`font-display text-5xl leading-none ${bright}`}>{months}</span>
          <span className={`text-base font-semibold ${dim}`}>months</span>
        </div>
        <p className={`text-xs mb-5 ${dim}`}>commitment period</p>
        <div className={`flex items-center justify-between rounded-2xl px-4 py-3 ${featured ? "bg-[#0f1a0c]/8" : "bg-[#b0e455]/6"}`}>
          <div>
            <div className="flex items-end gap-1">
              <span className={`font-display text-3xl leading-none ${bright}`}>${total.toLocaleString()}</span>
            </div>
            <p className={`text-[10px] mt-0.5 ${dim}`}>${price} billed per month</p>
          </div>
          <div className={`text-right text-[10px] font-bold tracking-wide uppercase ${featured ? "text-[#0f1a0c]/40" : "text-[#b0e455]/50"}`}>
            {featured ? "Save $1,800" : ""}
          </div>
        </div>
      </div>
      <div className="px-8 py-6 flex-1">
        <ul className="space-y-3">
          {features.map((f) => (
            <li key={f.text} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                f.included ? (featured ? "bg-[#0f1a0c]/10" : "bg-[#b0e455]/10") : "bg-[#edf5e2]/4"
              }`}>
                {f.included ? (
                  <svg viewBox="0 0 12 12" className={`w-3 h-3 ${featured ? "text-[#0f1a0c]" : "text-[#b0e455]"}`} fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 12 12" className="w-3 h-3 text-[#edf5e2]/20" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M3 3l6 6M9 3l-6 6" strokeLinecap="round" />
                  </svg>
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
      <div className="px-8 pb-8">
        <a
          href={checkoutUrl}
          className={`w-full py-3.5 rounded-2xl text-sm font-semibold transition-colors text-center block ${
            featured ? "bg-[#0f1a0c] text-[#b0e455] hover:bg-[#0a1208]" : "bg-[#b0e455] text-[#0f1a0c] hover:bg-[#c9f070]"
          }`}
        >
          Start Now
        </a>
      </div>
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
  { text: "Video Calls on Demand", included: false },
  { text: "Quarterly progress review call", included: false },
];

const allInFeatures: Feature[] = [
  { text: "Access to the ZANA App", included: true },
  { text: "Personalised training split", included: true },
  { text: "Custom nutrition & macros", included: true },
  { text: "Weekly check-ins with your coach", included: true },
  { text: "Priority access to Javi", included: true, emphasize: "Priority" },
  { text: "Supplement & recovery guidance", included: true },
  { text: "Video Calls on Demand", included: true },
  { text: "Quarterly progress review call", included: true },
];

export default function SystemPage() {
  return (
    <main className="min-h-screen bg-[#0b1509] text-[#edf5e2] font-sans selection:bg-[#b0e455] selection:text-[#0f1a0c]">

      {/* ── NAV ───────────────────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[#b0e455]/6">
        <Link href="/" className="text-[#edf5e2]/60 hover:text-[#edf5e2] transition-colors">
          <ZanaLogo className="h-5" />
        </Link>
        <Link
          href="/apply"
          className="text-xs font-semibold tracking-wide text-[#b0e455] hover:text-[#edf5e2] transition-colors"
        >
          Apply →
        </Link>
      </nav>

      {/* ── HOOK ──────────────────────────────────────────────────────────────── */}
      <section className="pt-28 pb-16 px-6">
        <div className="max-w-2xl mx-auto">

          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 rounded-full bg-[#b0e455]/10 border border-[#b0e455]/20 flex items-center justify-center shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-[#b0e455]" />
            </div>
            <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#b0e455]/70">From Javi</p>
          </div>

          <h1 className="font-display leading-[1.02] mb-8" style={{ fontSize: "clamp(44px, 7vw, 80px)" }}>
            I've been getting a lot of DMs.
          </h1>

          <p className="text-[#edf5e2]/60 text-lg md:text-xl leading-relaxed font-light mb-6">
            Every week, the same questions come in. About training. About eating. About how to actually stay consistent when life doesn&apos;t slow down for you.
          </p>
          <p className="text-[#edf5e2]/40 text-base leading-relaxed">
            I read every single one. And I figured it was time to answer them properly — in one place.
          </p>
        </div>
      </section>

      {/* ── THE DMS ───────────────────────────────────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <DmBubble text="Javi, I travel 3 weeks a month for work. How am I supposed to stay consistent with training?" />
          <DmBubble text="I've tried so many diets. Nothing sticks past the first month. I don't know what I'm doing wrong." />
          <DmBubble text="I'm earning good money now and feel like I have everything sorted — except my body. I just don't know where to start." />
          <DmBubble text="I want to get in shape but I genuinely don't have 2 hours a day to spend in the gym. Is there even a point?" />

          {/* Javi reply */}
          <div className="flex justify-end pt-2">
            <div className="bg-[#b0e455]/12 border border-[#b0e455]/20 rounded-2xl rounded-tr-sm px-4 py-3 max-w-xs md:max-w-sm">
              <p className="text-[#b0e455] text-sm font-medium leading-relaxed">These aren&apos;t excuses. They&apos;re real problems — and the reason I built this.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE WHY ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-[#b0e455]/6">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#b0e455]/50 mb-8">Why I&apos;m sharing this</p>

          <div className="space-y-6 text-[#edf5e2]/65 text-base md:text-lg leading-relaxed font-light">
            <p>
              Most fitness advice is built for people with unlimited time, zero responsibilities, and nothing better to do than meal prep for four hours on a Sunday.
            </p>
            <p>
              That&apos;s not how the people I talk to actually live. They&apos;re building businesses. Running teams. Raising families. Travelling constantly. They don&apos;t need another 12-week challenge designed by someone who&apos;s never had a calendar full of client calls.
            </p>
            <p className="text-[#edf5e2]/90">
              They need a system that works with their life — not against it.
            </p>
            <p>
              I want to help as many people as I can actually get there. Not just get fit — but feel genuinely good in their body. Confident when they walk into a room. Proud of what they see. That&apos;s the version of this I&apos;m obsessed with making happen.
            </p>
          </div>
        </div>
      </section>

      {/* ── THE REALITY ───────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#0f1a0c] border-y border-[#b0e455]/6">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#b0e455]/50 mb-8">What I&apos;ve learned</p>

          <blockquote className="font-display leading-[1.08] text-[#edf5e2] mb-10" style={{ fontSize: "clamp(26px, 4vw, 44px)" }}>
            &ldquo;Getting fit is one of the best financial decisions I have ever made.&rdquo;
          </blockquote>

          <p className="text-[#edf5e2]/50 text-sm leading-relaxed max-w-lg">
            Not because of how it looks on paper — but because of what it does to everything else. Your energy levels. Your discipline. The way you carry yourself. The way people read you before you say a single word.
          </p>

          <div className="mt-12 grid sm:grid-cols-3 gap-4">
            {[
              { num: "Career", label: "sorted." },
              { num: "Income", label: "sorted." },
              { num: "Body", label: "the last piece." },
            ].map((s) => (
              <div key={s.num} className="bg-[#162212] rounded-2xl px-5 py-5 border border-[#b0e455]/6">
                <p className="text-[#b0e455] text-sm font-bold mb-0.5">{s.num}</p>
                <p className="text-[#edf5e2]/40 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE SYSTEM ────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-2xl mb-14">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#b0e455]/50 mb-4">The system</p>
            <h2 className="font-display leading-none mb-4" style={{ fontSize: "clamp(32px, 4.5vw, 56px)" }}>
              Three things.<br />That&apos;s it.
            </h2>
            <p className="text-[#edf5e2]/40 text-sm leading-relaxed">
              Not a 30-step programme. Not a colour-coded meal plan you&apos;ll abandon by Thursday. Just three things, done consistently, that compound over time.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: <TrendingUp className="w-5 h-5 text-[#b0e455] stroke-1" />,
                num: "01",
                title: "Training",
                sub: "Built for your schedule",
                desc: "45–60 minute sessions, 4 days a week. Progressive splits designed to fit around client calls, travel, and late nights — not a bodybuilder's routine.",
              },
              {
                icon: <Leaf className="w-5 h-5 text-[#b0e455] stroke-1" />,
                num: "02",
                title: "Nutrition",
                sub: "Clarity, not restriction",
                desc: "Clear macro targets and food habits that work wherever you are. No tracking obsession. No elimination diets. Just something you can actually follow for good.",
              },
              {
                icon: <Target className="w-5 h-5 text-[#b0e455] stroke-[1.5]" />,
                num: "03",
                title: "Guidance",
                sub: "Accountability that adapts",
                desc: "Weekly check-ins with a coach who understands your world. Client dinners, travel, shifting deadlines — when life moves, the plan moves with it.",
              },
            ].map((p) => (
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

      {/* ── WHO IT'S FOR ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#0f1a0c] border-y border-[#b0e455]/6">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#b0e455]/50 mb-8">Is this for you?</p>

          <h2 className="font-display leading-none mb-10" style={{ fontSize: "clamp(28px, 4vw, 46px)" }}>
            This works if you&apos;re<br />serious about it.
          </h2>

          <div className="grid sm:grid-cols-2 gap-8">
            {/* This IS for you */}
            <div>
              <p className="text-xs font-bold tracking-[0.15em] uppercase text-[#b0e455] mb-5">This is for you if</p>
              <ul className="space-y-4">
                {[
                  "You're busy, but done using that as an excuse",
                  "You want a real plan, not motivation quotes",
                  "You're willing to be consistent for months, not days",
                  "You understand that your body is a long-term investment",
                  "You want someone in your corner who actually checks in",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="text-[#b0e455] mt-0.5 shrink-0">→</span>
                    <span className="text-sm text-[#edf5e2]/70 leading-relaxed">{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* This is NOT for you */}
            <div>
              <p className="text-xs font-bold tracking-[0.15em] uppercase text-[#edf5e2]/20 mb-5">This is not for you if</p>
              <ul className="space-y-4">
                {[
                  "You want a quick fix or a 30-day transformation",
                  "You're not willing to show up to check-ins",
                  "You expect results without any effort on your part",
                  "You're looking for the cheapest option possible",
                  "You can't commit to at least 4 months",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="text-[#edf5e2]/20 mt-0.5 shrink-0">×</span>
                    <span className="text-sm text-[#edf5e2]/25 leading-relaxed line-through">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── OUTCOME ───────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#b0e455]/50 mb-8">The outcome</p>
          <h2 className="font-display leading-[1.08] mb-6" style={{ fontSize: "clamp(28px, 4vw, 50px)" }}>
            The one investment that shows up{" "}
            <span className="text-[#b0e455]">in every room.</span>
          </h2>
          <p className="text-[#edf5e2]/40 text-sm leading-relaxed max-w-md mx-auto">
            The right physique changes how you walk into a meeting, how you show up on camera, how people read you before you say a word. It&apos;s not vanity — it&apos;s leverage. And unlike most investments, this one compounds every single day.
          </p>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-[#b0e455]/6" id="pricing">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#b0e455]/50 mb-4">The investment</p>
            <h2 className="font-display leading-none mb-3" style={{ fontSize: "clamp(30px, 4vw, 52px)" }}>
              The Zana Fitness System.
            </h2>
            <p className="text-sm text-[#edf5e2]/35">All plans include the full system. No upsells.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <PlanCard
              label="Committed"
              months={4}
              price={500}
              total={2000}
              checkoutUrl="https://whop.com/checkout/plan_DAY1fwI5NfqJe"
              features={committedFeatures}
            />
            <PlanCard
              label="All In"
              months={12}
              price={350}
              total={4200}
              checkoutUrl="https://whop.com/checkout/plan_BwaPVLzVFjYWL"
              features={allInFeatures}
              featured
            />
          </div>
          <p className="text-center text-xs text-[#edf5e2]/20 mt-7">7-day satisfaction guarantee · Secure checkout via Whop</p>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <section className="py-32 px-6 border-t border-[#b0e455]/6">
        <div className="max-w-2xl mx-auto text-center">

          <ZanaLogo className="h-7 text-[#edf5e2]/20 mx-auto mb-14" />

          <h2 className="font-display leading-[1.04] mb-6" style={{ fontSize: "clamp(38px, 6vw, 72px)" }}>
            The gap between where you are<br />
            <span className="text-[#b0e455]">and where you want to be</span><br />
            is a decision.
          </h2>

          <p className="text-[#edf5e2]/45 text-base leading-relaxed mb-3 max-w-md mx-auto">
            I work with a small number of clients at a time. If you&apos;re serious about this, apply below and we&apos;ll see if we&apos;re the right fit.
          </p>
          <p className="text-[#edf5e2]/25 text-sm mb-14">No obligation. Takes two minutes.</p>

          <Link
            href="/apply"
            className="inline-flex items-center gap-3 bg-[#b0e455] text-[#0f1a0c] font-bold text-sm px-10 py-5 rounded-2xl hover:bg-[#c9f070] transition-colors"
          >
            Apply to Work With Javi
            <ArrowRight className="w-4 h-4" />
          </Link>

          <p className="text-[#edf5e2]/20 text-xs mt-8 tracking-wide">
            Spots are limited · Most clients stay long-term
          </p>
        </div>
      </section>

    </main>
  );
}
