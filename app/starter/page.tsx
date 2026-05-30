import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The Starter | ZANA Fitness",
  description:
    "The lite version of my coaching program. The mindset, the food rules, the training rules, and the five principles — free. Run it yourself.",
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

function SectionHeader({ num, label, title }: { num: string; label: string; title: React.ReactNode }) {
  return (
    <header className="mb-8 mt-16 first:mt-0">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-[11px] font-bold tracking-[0.22em] text-[#65a30d]">{num}</span>
        <span className="h-px w-8 bg-[#1f2937]/15" />
        <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#1f2937]/45">{label}</span>
      </div>
      <h2
        className="font-display leading-[1.1] text-[#0a0a0a]"
        style={{ fontSize: "clamp(26px, 3.6vw, 36px)" }}
      >
        {title}
      </h2>
    </header>
  );
}

function Rule({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex items-start gap-4 py-5 border-b border-[#1f2937]/10 last:border-b-0">
      <span className="text-[#65a30d] mt-1.5 shrink-0 text-sm">→</span>
      <div className="flex-1">
        <p className="font-display text-lg md:text-xl text-[#0a0a0a] leading-snug mb-1">{title}</p>
        <p className="text-[15px] md:text-base text-[#1f2937]/60 leading-relaxed">{sub}</p>
      </div>
    </div>
  );
}

const fivePrinciples = [
  { num: "01", title: "Protein is the most important thing.", sub: "Anchor every meal around it. The rest follows." },
  { num: "02", title: "Sleep well.", sub: "You can't out-train a 5-hour night." },
  { num: "03", title: "Prepare for your workout.", sub: "Warm-up + pre-workout. The 15 minutes that make the next 60 worth it." },
  { num: "04", title: "Progressive overload.", sub: "Weight up every other week. Boring, slow, undefeated." },
  { num: "05", title: "Don't get injured.", sub: "Still being in the gym next month beats every other variable." },
];

export default function StarterPage() {
  return (
    <main className="min-h-screen bg-white text-[#1f2937] font-sans selection:bg-[#b0e455] selection:text-[#0f1a0c]">

      {/* ── NAV ───────────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-10 flex items-center justify-between px-6 md:px-8 py-4 bg-white/85 backdrop-blur border-b border-[#1f2937]/8">
        <Link href="/" className="text-[#1f2937]/60 hover:text-[#0a0a0a] transition-colors">
          <ZanaLogo className="h-4" />
        </Link>
        <Link
          href="/apply"
          className="text-xs font-semibold tracking-wide text-[#4d7c0f] hover:text-[#365314] transition-colors"
        >
          Apply →
        </Link>
      </nav>

      <article className="px-6">

        {/* ── HEADER ──────────────────────────────────────────────────────────── */}
        <header className="max-w-2xl mx-auto pt-20 pb-14 md:pt-28 md:pb-16 border-b border-[#1f2937]/8">
          <div className="flex items-center gap-2 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#65a30d]" />
            <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#1f2937]/55">
              The Free Version
            </p>
          </div>

          <h1
            className="font-display leading-[1.04] text-[#0a0a0a] mb-8"
            style={{ fontSize: "clamp(40px, 6.5vw, 68px)" }}
          >
            The Starter.
          </h1>

          <p className="text-[#1f2937]/65 text-lg md:text-xl leading-relaxed mb-3">
            The lite version of what I teach my clients. The mindset, the food rules, the training rules — distilled to one page.
          </p>
          <p className="text-[#1f2937]/55 text-base leading-relaxed">
            If you can&apos;t afford coaching right now, run this yourself. It&apos;s most of the value, without me in your corner.
          </p>
        </header>

        <div className="max-w-2xl mx-auto pt-14 pb-16 md:pt-16 md:pb-20">

          {/* ── 01 MINDSET ────────────────────────────────────────────────────── */}
          <SectionHeader
            num="01"
            label="Mindset"
            title={<>Start here. Without this, the rest doesn&apos;t stick.</>}
          />
          <div className="space-y-5 text-[17px] md:text-[18px] leading-[1.75] text-[#1f2937]/85">
            <p>
              <strong className="text-[#0a0a0a] font-semibold">Work with your nature, not against it.</strong> Don&apos;t adopt someone else&apos;s discipline. Build the plan around your cravings, your schedule, your psychology. The plan should fit you. You should not be contorting yourself to fit the plan.
            </p>
            <p>
              <strong className="text-[#0a0a0a] font-semibold">The face is the unlock, not the abs.</strong> Body fat → face fat → how attractive you actually look. Set the goal at the right place.
            </p>
            <p>
              <strong className="text-[#0a0a0a] font-semibold">Six months, not six weeks.</strong> If you&apos;re thinking in weeks, you&apos;ll quit. Reset the timeline.
            </p>
            <p>
              <strong className="text-[#0a0a0a] font-semibold">Confidence is the actual ROI.</strong> The body is the gateway. What it unlocks in your career, your presence, your content — that&apos;s the prize.
            </p>
          </div>

          {/* ── 02 FOOD RULES ─────────────────────────────────────────────────── */}
          <SectionHeader
            num="02"
            label="Food"
            title={<>No meal plans. No macros. Just rules.</>}
          />
          <p className="text-[15px] md:text-base text-[#1f2937]/55 leading-relaxed mb-6">
            Calibrate calories once: BMR + activity, then eat 300–400 below. Weigh your protein on a kitchen scale for 4–8 weeks to build intuition. After that, drop the tracking and run the rules.
          </p>
          <div>
            <Rule
              title="Protein is the anchor."
              sub="Chicken breast or ground beef at least once per meal. Eggs as a side. Every meal, no exceptions."
            />
            <Rule
              title="Carbs are a condiment."
              sub="Not the meal. Time them around training."
            />
            <Rule
              title="Fist = ~100g chicken breast."
              sub="Eyeball it. You don't need a scale forever — you need an intuition. That's what the first month builds."
            />
            <Rule
              title="Clean swaps for cravings."
              sub="Greek yogurt + fruit beats ice cream. Substitute, don't suppress. Killing the craving never works."
            />
            <Rule
              title="The Ben & Jerry's rule."
              sub="Allow the occasional pint. Perfection is the enemy of consistency. The plan that survives is the one that flexes."
            />
            <Rule
              title="Midnight snacker? Skip breakfast."
              sub="Save the calories for when you actually want them. Pattern-match your body, don't fight it."
            />
            <Rule
              title="Eating too much? Drop to two meals a day."
              sub="The simplest lever for overconsumption. Less surface area, less damage."
            />
          </div>

          {/* ── 03 TRAINING ──────────────────────────────────────────────────── */}
          <SectionHeader
            num="03"
            label="Training"
            title={<>Aesthetics-first. One hour. Heavy.</>}
          />
          <div>
            <Rule
              title="Run PPL. Push, Pull, Legs."
              sub="Six days on, one off. It's not the split that's special — it's the framing. Train for how you look in a fitted polo or a suit: shoulders, chest, arms."
            />
            <Rule
              title="One hour a day. 8/10 intensity."
              sub="Longer isn't better. Anything below 8/10 doesn't count."
            />
            <Rule
              title="Weight up every other week."
              sub="135 → 145 in two weeks. Boring, slow, undefeated. That's progressive overload."
            />
            <Rule
              title="High protein + deficit + lifting = recomp."
              sub="You don't have to choose between leaner and stronger. With enough protein, you get both. I went one plate bench to two plate in three months while cutting."
            />
            <Rule
              title="Train your weak links."
              sub="Neck pain? Train traps. Foot pain? Train calves. Most injuries are muscle imbalances. The fix is rarely rest — it's training what you skipped."
            />
            <Rule
              title="Warm up. Caffeine. Walk in switched on."
              sub="The 15 minutes before the workout make the next 60 worth it."
            />
          </div>

          {/* ── 04 LIFESTYLE ─────────────────────────────────────────────────── */}
          <SectionHeader
            num="04"
            label="Lifestyle"
            title={<>The stuff outside the gym is the multiplier.</>}
          />
          <div>
            <Rule
              title="Sleep is a training variable."
              sub="Bad sleep costs you more in the mirror than any single workout earns. Treat it like a training day."
            />
            <Rule
              title="Walk more than you do cardio."
              sub="For skinny fat especially. Cheap, sustainable, doesn't blunt the lifts."
            />
            <Rule
              title="Build around your life, not against it."
              sub="Night owl? Late meals. Long commute? Train at lunch. The version that fits is the version that lasts."
            />
          </div>

          {/* ── 05 THE FIVE PRINCIPLES ───────────────────────────────────────── */}
          <SectionHeader
            num="05"
            label="The Five Principles"
            title={<>If you forget everything else, remember these.</>}
          />
          <ol className="border-y border-[#1f2937]/10 divide-y divide-[#1f2937]/10">
            {fivePrinciples.map((p) => (
              <li key={p.num} className="flex items-start gap-5 py-6">
                <span className="font-display text-[#65a30d] text-lg shrink-0 w-8 pt-0.5">{p.num}</span>
                <div className="flex-1">
                  <p className="font-display text-lg md:text-xl text-[#0a0a0a] leading-snug mb-1.5">{p.title}</p>
                  <p className="text-[15px] md:text-base text-[#1f2937]/60 leading-relaxed">{p.sub}</p>
                </div>
              </li>
            ))}
          </ol>

          {/* ── CTA ──────────────────────────────────────────────────────────── */}
          <aside className="mt-20 pt-12 border-t border-[#1f2937]/10">
            <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#65a30d] mb-5">
              When you&apos;re ready
            </p>
            <h3
              className="font-display leading-[1.15] text-[#0a0a0a] mb-5"
              style={{ fontSize: "clamp(28px, 4vw, 40px)" }}
            >
              When you&apos;re ready to invest in your health and fitness — apply here.
            </h3>
            <p className="text-[16px] md:text-[17px] leading-[1.75] text-[#1f2937]/70 mb-8 max-w-xl">
              The free version gets you most of the way. The program gets you the prescribed workouts, the personalized food rules, and someone in your corner adjusting the plan as life happens. I review every application personally.
            </p>
            <Link
              href="/apply"
              className="inline-flex items-center gap-3 bg-[#b0e455] text-[#0f1a0c] font-bold text-sm px-8 py-4 rounded-2xl hover:bg-[#c9f070] transition-colors"
            >
              Apply to Work With Me
              <span aria-hidden="true">→</span>
            </Link>
            <p className="text-[12px] text-[#1f2937]/45 mt-5 tracking-wide">
              Limited spots · Most clients stay long-term
            </p>
          </aside>

          {/* ── ALSO READ ────────────────────────────────────────────────────── */}
          <aside className="mt-16 pt-8 border-t border-[#1f2937]/10">
            <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#1f2937]/45 mb-4">
              Keep reading
            </p>
            <Link
              href="/protocol"
              className="group block py-4 border-b border-[#1f2937]/10"
            >
              <p className="font-display text-lg text-[#0a0a0a] leading-snug mb-1 group-hover:text-[#4d7c0f] transition-colors">
                The Skinny Fat Protocol →
              </p>
              <p className="text-[14px] text-[#1f2937]/55 leading-relaxed">
                The story of how I went from skinny fat to an eight pack in six months.
              </p>
            </Link>
          </aside>

          {/* SIGNATURE */}
          <div className="mt-20 pt-10 border-t border-[#1f2937]/10 flex items-center gap-4">
            <ZanaLogo className="h-4 text-[#1f2937]/35" />
            <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#1f2937]/40">
              Javi · @javi_zana
            </span>
          </div>
        </div>
      </article>

    </main>
  );
}
