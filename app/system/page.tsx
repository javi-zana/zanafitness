import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "The System | ZANA Fitness",
  description: "The habits-based lifestyle system I use to help professionals build a lean, aesthetic physique — that actually matches their life.",
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

function DmBubble({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-[#edf5e2]/6 border border-[#edf5e2]/10 shrink-0 flex items-center justify-center mt-0.5">
        <div className="w-2.5 h-2.5 rounded-full bg-[#edf5e2]/20" />
      </div>
      <div className="bg-[#162212] border border-[#b0e455]/8 rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs md:max-w-md">
        <p className="text-[#edf5e2]/60 text-sm leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

type PrincipleData = {
  num: string;
  title: string;
  lead: string;
  cards: { label: string; body: string }[];
};

const principles: PrincipleData[] = [
  {
    num: "01",
    title: "Getting fit is simple.",
    lead: "Simple doesn't mean easy. The hard part isn't knowing what to do — it's doing it consistently when life gets in the way.",
    cards: [
      {
        label: "Why",
        body: "The gap between knowing and doing is where 99% of fitness failure happens. The information has been free and largely the same for decades. The reason most people don't have the body they want isn't a missing secret — it's that they haven't applied the basics consistently for long enough.",
      },
      {
        label: "How",
        body: "Don't chase complexity. Don't add new tactics until the basics are bulletproof. The temptation to optimise, biohack, or stack supplements is almost always procrastination dressed up as work.",
      },
      {
        label: "The Lever",
        body: "When something isn't working, the answer is rarely a new tactic. The question is: am I actually doing the basic thing? The honest answer is almost always no.",
      },
    ],
  },
  {
    num: "02",
    title: "Lifestyle habits are everything.",
    lead: "Lifestyle habits are ~80% of being fit. The other 20% is what happens at the gym.",
    cards: [
      {
        label: "Why",
        body: "An hour in the gym is 4% of your day. The other 96% — what you eat, how you sleep, how much you walk, how you handle stress — is what actually moves the needle. The workout is the smallest lever, not the biggest.",
      },
      {
        label: "How",
        body: "Build the day around a few non-negotiables: protein at every meal, 8k+ steps, a consistent bedtime, water on the desk. The workout slots into a life that's already pulling in the right direction.",
      },
      {
        label: "The Lever",
        body: "If you had 30 minutes of effort to spend, none of it would be in the gym. The gym is leverage on a base that's already there — without the base, it's just a workout.",
      },
    ],
  },
  {
    num: "03",
    title: "Train hard, but don't get injured.",
    lead: "Hard training is what actually changes the body. Injury is what undoes it. The job is doing both — at the same time, for years.",
    cards: [
      {
        label: "Why",
        body: "Easy sessions don't move the needle — the body only adapts when it's pushed past where it's comfortable. But an injury is 6–12 weeks off, and that resets everything. The most underrated principle in fitness is being in the gym next week.",
      },
      {
        label: "How",
        body: "8/10 intensity floor on every working set. Compounds first, accessories second. Progressive overload — add weight every other week. Form before weight, always. Sharp pain stops the set; dull ache gets reported at check-in.",
      },
      {
        label: "The Lever",
        body: "Train like you want to be doing this in ten years. Hard enough to grow, smart enough to keep going. Better to leave a rep in the tank than miss eight weeks.",
      },
    ],
  },
  {
    num: "04",
    title: "Get enough sleep.",
    lead: "You can't out-train a 5-hour night. Recovery happens here, not in the gym.",
    cards: [
      {
        label: "Why",
        body: "Sleep is when muscle is built and hunger hormones reset. Skip it and the next day's training is a 6/10, the next day's eating is chaos. Bad sleep wrecks the whole stack.",
      },
      {
        label: "How",
        body: "7+ hours, same window every night. Dark room, cool temperature, no phone in bed. If sleep is currently broken, fix it before fixing anything else.",
      },
      {
        label: "The Lever",
        body: "Under 7 hours? Train lighter, lean harder on protein, skip the session if it'd be sloppy. Don't be a hero on no sleep — that's how injuries happen.",
      },
    ],
  },
  {
    num: "05",
    title: "Fitness should feel effortless.",
    lead: "If it feels like punishment, it won't last. The only fitness that compounds long-term is the kind you actually enjoy.",
    cards: [
      {
        label: "Why",
        body: "Long-term, motivation runs out. Discipline runs out. What's left is identity and habit — and you only build those around things you don't hate. The clients who keep their results are the ones who stopped white-knuckling and started living it.",
      },
      {
        label: "How",
        body: "Find the lifts you like. Eat food you actually want, within the rules. Pick a gym you don't dread. Within the principles there's a lot of room — find your version.",
      },
      {
        label: "The Lever",
        body: "At some point this should stop feeling like a project and start feeling like who you are. That's the goal — not a deadline, an identity.",
      },
    ],
  },
];

function PrincipleSection({ p, alt }: { p: PrincipleData; alt: boolean }) {
  return (
    <section className={`py-20 px-6 ${alt ? "bg-[#0f1a0c] border-y border-[#b0e455]/6" : ""}`}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#b0e455]/50">
            Principle {p.num}
          </span>
          <div className="flex-1 h-px bg-[#b0e455]/8" />
        </div>

        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="font-display leading-[1.05] mb-4" style={{ fontSize: "clamp(28px, 3.5vw, 44px)" }}>
              {p.title}
            </h2>
            <p className="text-[#edf5e2]/55 text-base leading-relaxed italic">{p.lead}</p>
          </div>
          <div className="space-y-3">
            {p.cards.map((c) => (
              <div key={c.label} className="bg-[#162212] rounded-2xl p-5 border border-[#b0e455]/6">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#b0e455]/60 mb-2">{c.label}</p>
                <p className="text-sm text-[#edf5e2]/65 leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function SystemPage() {
  return (
    <main className="min-h-screen bg-[#0b1509] text-[#edf5e2] font-sans selection:bg-[#b0e455] selection:text-[#0f1a0c]">

      {/* ── NAV ───────────────────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[#b0e455]/6">
        <Link href="/" className="text-[#edf5e2]/50 hover:text-[#edf5e2] transition-colors">
          <ZanaLogo className="h-5" />
        </Link>
        <Link
          href="/apply"
          className="text-xs font-semibold tracking-wide text-[#b0e455] hover:text-[#c9f070] transition-colors"
        >
          Apply →
        </Link>
      </nav>

      {/* ── HOOK ──────────────────────────────────────────────────────────────── */}
      <section className="pt-28 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-1.5 h-1.5 rounded-full bg-[#b0e455]" />
            <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#b0e455]/60">From Javi</p>
          </div>

          <h1 className="font-display leading-[1.02] mb-10" style={{ fontSize: "clamp(44px, 7vw, 84px)" }}>
            I've been getting<br />a lot of DMs.
          </h1>

          <div className="space-y-5 text-[#edf5e2]/55 text-base md:text-lg leading-relaxed">
            <p>Every week, the same guy messages me. Different name. Same situation.</p>
            <p>His career is in a great place. He earns well. He dresses well. He has the lifestyle most people are working toward.</p>
            <p className="text-[#edf5e2]/80">
              And he&apos;s frustrated that the one thing he can&apos;t seem to get control of is his own body.
            </p>
          </div>
        </div>
      </section>

      {/* ── THE DMS ───────────────────────────────────────────────────────────── */}
      <section className="py-10 px-6">
        <div className="max-w-2xl mx-auto space-y-3.5">
          <DmBubble text="I look fine with clothes on but I can't take my shirt off without feeling embarrassed. I'm not overweight. I'm just... soft." />
          <DmBubble text="I've tried everything. Gym programs, meal plans, apps, challenges. Nothing sticks past 3 weeks." />
          <DmBubble text="My career is sorted, my wardrobe is sorted. I just feel like my body is the one thing that doesn't match the rest of my life." />
          <DmBubble text="I travel constantly for work. I have no idea how to stay consistent when I'm not in my home city." />

          <div className="flex justify-end pt-1">
            <div className="bg-[#b0e455]/10 border border-[#b0e455]/20 rounded-2xl rounded-tr-sm px-5 py-3.5 max-w-xs md:max-w-sm">
              <p className="text-[#b0e455] text-sm font-medium leading-relaxed">
                These aren&apos;t excuses. They&apos;re the exact problems I built this system to solve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE WHY ───────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-[#b0e455]/6">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#b0e455]/50 mb-10">Why I built this</p>

          <div className="space-y-6 text-[#edf5e2]/60 text-base md:text-lg leading-relaxed">
            <p>
              I&apos;ve been coaching for years. And the one thing I keep seeing is that the fitness industry is not built for how most ambitious people actually live.
            </p>
            <p>
              Bodybuilder splits. Calorie tracking apps. Twelve-week challenges. Meal-prep Sundays. All of it designed for someone with unlimited time, zero work commitments, and nothing better to do.
            </p>
            <p className="text-[#edf5e2]/85 font-medium">
              That&apos;s not you. And the programmes built for that person are why you&apos;ve tried and stopped — repeatedly — without it ever feeling like it was working.
            </p>
            <p>
              Getting fit was one of the highest-ROI decisions I ever made. Not just physically — but in business, in how I carry myself, in the way people read me before I say a word. I want that for as many people as I can help get there.
            </p>
            <p>
              What I use with every client is a system built around five principles. Not tactics. Not a programme. Principles — because principles don&apos;t fall apart when life gets busy.
            </p>
          </div>
        </div>
      </section>

      {/* ── METHODOLOGY CONTRAST ──────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-[#0f1a0c] border-y border-[#b0e455]/6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="rounded-3xl p-7 border border-[#edf5e2]/5 bg-[#0b1509]">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#edf5e2]/20 mb-5">What doesn&apos;t work</p>
              <ul className="space-y-3.5">
                {[
                  "2-hour gym sessions built for bodybuilders",
                  "Meal plans you can't follow when you travel",
                  "Programmes that require you to track everything",
                  "Motivation-based approaches that fade by week 3",
                  "Advice from people who don't live your life",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="text-[#edf5e2]/15 mt-0.5 shrink-0 text-sm">×</span>
                    <span className="text-sm text-[#edf5e2]/25 line-through leading-relaxed">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl p-7 border border-[#b0e455]/12 bg-[#162212]">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#b0e455]/70 mb-5">What actually works</p>
              <ul className="space-y-3.5">
                {[
                  "45–60 min sessions, 4x a week — around your calendar",
                  "Eating habits that hold up in restaurants and airports",
                  "A system where lifestyle does the heavy lifting",
                  "Identity and habit, not motivation and willpower",
                  "A coach who adapts the plan when life shifts",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="text-[#b0e455] mt-0.5 shrink-0 text-sm">→</span>
                    <span className="text-sm text-[#edf5e2]/75 leading-relaxed">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE FIVE PRINCIPLES ───────────────────────────────────────────────── */}
      <div className="pt-24 pb-0">
        <div className="max-w-2xl mx-auto px-6 mb-16">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#b0e455]/50 mb-4">The principles</p>
          <h2 className="font-display leading-none mb-4" style={{ fontSize: "clamp(32px, 5vw, 56px)" }}>
            Five things.<br />That&apos;s the whole system.
          </h2>
          <p className="text-[#edf5e2]/40 text-sm leading-relaxed max-w-md">
            Get these right and everything else follows. Miss them and no programme — no matter how good — will save you.
          </p>
        </div>

        {principles.map((p, i) => (
          <PrincipleSection key={p.num} p={p} alt={i % 2 === 0} />
        ))}
      </div>

      {/* ── WHO IT'S FOR ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-[#b0e455]/6">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#b0e455]/50 mb-10">Is this for you?</p>

          <h2 className="font-display leading-[1.05] mb-12" style={{ fontSize: "clamp(28px, 4vw, 46px)" }}>
            I work with a specific type of person.<br />
            <span className="text-[#b0e455]">You&apos;ll know if you&apos;re it.</span>
          </h2>

          <div className="grid sm:grid-cols-2 gap-10">
            <div>
              <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#b0e455] mb-6">This is you if</p>
              <ul className="space-y-4">
                {[
                  "Your career and income are sorted. Your body is the last piece.",
                  "You've tried things before. They didn't stick. You know why now.",
                  "You're done with motivation hacks. You want a system.",
                  "You can commit to 4 months minimum. You think in quarters.",
                  "You want a coach who adjusts when life happens — not one who gives up on you.",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="text-[#b0e455] mt-0.5 shrink-0 text-sm">→</span>
                    <span className="text-sm text-[#edf5e2]/70 leading-relaxed">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#edf5e2]/18 mb-6">This is not for you if</p>
              <ul className="space-y-4">
                {[
                  "You want a 30-day transformation",
                  "You won't show up for check-ins",
                  "You expect results without effort on your side",
                  "You're looking for the cheapest option",
                  "You can't commit to at least 4 months",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="text-[#edf5e2]/15 mt-0.5 shrink-0 text-sm">×</span>
                    <span className="text-sm text-[#edf5e2]/22 leading-relaxed line-through">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE RHYTHM ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#0f1a0c] border-y border-[#b0e455]/6">
        <div className="max-w-3xl mx-auto">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#b0e455]/50 mb-8">What it looks like in practice</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: "Daily", body: "Workouts in the app. Log every set. Intensity at 8/10 or above. Under 60 minutes." },
              { label: "Weekly", body: "Check-in form on Sunday. My response and adjustments by Monday. Non-negotiable." },
              { label: "When you travel", body: "The plan adapts. Hotel gym, no gym, client dinners — we account for it before it happens." },
              { label: "When life shifts", body: "Deadlines, injury, a heavy work week — message me. Adapting is part of the job." },
            ].map((r) => (
              <div key={r.label} className="bg-[#162212] rounded-2xl p-6 border border-[#b0e455]/6">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#b0e455]/60 mb-2.5">{r.label}</p>
                <p className="text-sm text-[#edf5e2]/65 leading-relaxed">{r.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <section className="py-36 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <ZanaLogo className="h-7 text-[#edf5e2]/15 mx-auto mb-16" />

          <h2 className="font-display leading-[1.04] mb-6" style={{ fontSize: "clamp(36px, 6vw, 70px)" }}>
            The gap between where you are<br />and where you want to be<br />
            <span className="text-[#b0e455]">is a decision.</span>
          </h2>

          <p className="text-[#edf5e2]/45 text-base leading-relaxed mb-2 max-w-md mx-auto">
            If what you just read describes you — apply below. I review every application personally and I&apos;ll let you know if we&apos;re a good fit.
          </p>
          <p className="text-[#edf5e2]/22 text-sm mb-14">No obligation. No hard sell. Takes two minutes.</p>

          <Link
            href="/apply"
            className="inline-flex items-center gap-3 bg-[#b0e455] text-[#0f1a0c] font-bold text-sm px-10 py-5 rounded-2xl hover:bg-[#c9f070] transition-colors"
          >
            Apply to Work With Javi
            <ArrowRight className="w-4 h-4" />
          </Link>

          <p className="text-[#edf5e2]/18 text-xs mt-8 tracking-wide">
            Limited spots · Most clients stay long-term
          </p>
        </div>
      </section>

    </main>
  );
}
