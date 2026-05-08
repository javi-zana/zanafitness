import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The System | ZANA Fitness",
  description: "The five principles behind the Zana Fitness System. Everything else is decoration.",
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

type Card = { label: string; body: string };
type Principle = {
  num: string;
  title: string;
  lead: string;
  cards: [Card, Card, Card];
  aside?: string;
};

const principles: Principle[] = [
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
        body: "Under 7 hours? Train lighter that day, lean harder on protein, skip the workout if it'd be sloppy. Don't be a hero on no sleep — that's how injuries happen.",
      },
    ],
  },
  {
    num: "05",
    title: "Fitness should feel effortless.",
    lead: "If it feels like punishment, it won't last. Long-term, the only fitness that compounds is the kind you actually enjoy. Let's have fun with this.",
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

function PrincipleSection({ p, alt }: { p: Principle; alt: boolean }) {
  return (
    <section
      className={`min-h-screen flex flex-col justify-center px-6 py-24 ${
        alt ? "bg-[#0f1a0c] border-y border-[#b0e455]/6" : ""
      }`}
    >
      <div className="max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="w-10 h-px bg-[#b0e455]/40" />
            <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#b0e455]/80">
              Principle {p.num} · of five
            </p>
            <div className="w-10 h-px bg-[#b0e455]/40" />
          </div>

          <h2
            className="font-display leading-[1.05] mb-7 max-w-3xl mx-auto"
            style={{ fontSize: "clamp(34px, 5.5vw, 64px)" }}
          >
            {p.title}
          </h2>

          <p className="text-[#edf5e2]/65 text-base md:text-lg leading-relaxed font-light italic max-w-2xl mx-auto">
            {p.lead}
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {p.cards.map((c) => (
            <div
              key={c.label}
              className="bg-[#162212] rounded-3xl p-7 border border-[#b0e455]/6"
            >
              <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#b0e455] mb-4">
                {c.label}
              </p>
              <p className="text-sm text-[#edf5e2]/70 leading-relaxed">
                {c.body}
              </p>
            </div>
          ))}
        </div>

        {p.aside && (
          <p className="text-center text-xs text-[#edf5e2]/35 mt-10 max-w-md mx-auto leading-relaxed italic">
            {p.aside}
          </p>
        )}
      </div>
    </section>
  );
}

export default function SystemPage() {
  return (
    <main className="min-h-screen bg-[#0b1509] text-[#edf5e2] font-sans selection:bg-[#b0e455] selection:text-[#0f1a0c]">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="min-h-screen flex flex-col justify-center px-6 py-24">
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center">
          <ZanaLogo className="h-9 md:h-11 text-[#edf5e2] mb-12 opacity-60" />
          <div className="w-6 h-px bg-[#b0e455]/30 mb-8" />

          <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#b0e455] mb-8">
            Kickoff · The principles
          </p>

          <h1
            className="font-display leading-[1.02] mb-10"
            style={{ fontSize: "clamp(48px, 8vw, 96px)" }}
          >
            The Zana Fitness System.
          </h1>

          <p className="text-[#edf5e2]/75 text-base md:text-lg leading-relaxed max-w-xl">
            Most fitness content is noise. After years of testing — on myself, then on clients — I keep coming back to the same five principles. Get these right and the body changes. Get them wrong, and nothing else matters.
          </p>

          <div className="w-8 h-px bg-[#b0e455]/30 my-10" />

          <p className="text-[#edf5e2]/40 text-sm leading-relaxed max-w-md italic">
            Each one has a <span className="text-[#b0e455]/80 not-italic font-medium">why</span>, a <span className="text-[#b0e455]/80 not-italic font-medium">how</span>, and a <span className="text-[#b0e455]/80 not-italic font-medium">lever</span> — the single thing that matters most. We go through them in order.
          </p>
        </div>
      </section>

      {/* ── PRINCIPLES ────────────────────────────────────────────────────── */}
      {principles.map((p, i) => (
        <PrincipleSection key={p.num} p={p} alt={i % 2 === 0} />
      ))}

      {/* ── CLOSING ───────────────────────────────────────────────────────── */}
      <section className="min-h-screen flex flex-col justify-center px-6 py-24">
        <div className="max-w-3xl mx-auto text-center w-full">
          <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#b0e455] mb-8">
            From here
          </p>

          <h2
            className="font-display leading-[1.05] mb-8"
            style={{ fontSize: "clamp(32px, 5vw, 56px)" }}
          >
            These are the levers.<br />
            <span className="text-[#b0e455]">Everything else is decoration.</span>
          </h2>

          <p className="text-[#edf5e2]/55 text-base md:text-lg leading-relaxed max-w-xl mx-auto mb-14">
            Now we set up the app and start the work. The rhythm from here:
          </p>

          <div className="grid sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
            {[
              {
                label: "Daily",
                body: "Workouts in the app. Log every set. Intensity at 8/10 or above.",
              },
              {
                label: "Weekly",
                body: "Check-in form Sunday night. My response and adjustments by Monday.",
              },
              {
                label: "First month",
                body: "One call a week. We dial the system in to your life — work, travel, sleep.",
              },
              {
                label: "When life shifts",
                body: "The plan shifts with it. Travel, injury, a heavy work week — message me. That's the job.",
              },
            ].map((r) => (
              <div
                key={r.label}
                className="bg-[#162212] rounded-3xl p-7 border border-[#b0e455]/6"
              >
                <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#b0e455] mb-3">
                  {r.label}
                </p>
                <p className="text-sm text-[#edf5e2]/70 leading-relaxed">
                  {r.body}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 mt-16">
            <div className="w-8 h-px bg-[#b0e455]/40" />
            <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#b0e455]/70">
              Javi Lorenzana · ZANA Fitness
            </p>
            <div className="w-8 h-px bg-[#b0e455]/40" />
          </div>
        </div>
      </section>

    </main>
  );
}
