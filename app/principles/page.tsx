import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Principles | ZANA Fitness",
  description: "The five levers that move the needle. Everything else is decoration.",
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
    title: "Protein is the most important thing.",
    lead: "If you only fix one thing, fix this. It's the difference between losing fat and losing muscle — and between being satisfied and being hungry all day.",
    cards: [
      {
        label: "Why",
        body: "Protein is what your body uses to build and hold muscle. It's also the most satiating macro by a wide margin. Most clients I start with are eating about half of what they need without realising it.",
      },
      {
        label: "How",
        body: "Anchor every meal with a protein source — chicken, beef, fish, eggs, Greek yogurt. Aim for ~1g per pound of bodyweight per day. Build the meal around the protein, not the other way around.",
      },
      {
        label: "The Lever",
        body: "One fist of chicken ≈ 100g. One fist at every meal puts you 80% of the way there. We don't track macros — we track this anchor.",
      },
    ],
    aside: "Carbs are a condiment, not the meal. Time them around training.",
  },
  {
    num: "02",
    title: "Sleep well.",
    lead: "You can't out-train a 5-hour night. Recovery happens here, not in the gym.",
    cards: [
      {
        label: "Why",
        body: "Sleep is when muscle is built and hunger hormones reset. Skip it and the next day's training is a 6/10, the next day's eating is chaos. The compounding effect is bigger than any supplement.",
      },
      {
        label: "How",
        body: "Aim for 7+ hours, same window every night. Dark room, cool temperature, no phone in bed. If sleep is currently broken, fix this before fixing anything else.",
      },
      {
        label: "The Lever",
        body: "Under 7 hours = train lighter that day, lean harder on protein, skip the workout if it'd be sloppy. Don't be a hero on no sleep — that's how you get hurt.",
      },
    ],
  },
  {
    num: "03",
    title: "Prepare for your workout.",
    lead: "An unprepared workout is a 6/10. The intensity floor is 8. The difference is in the prep.",
    cards: [
      {
        label: "Why",
        body: "Walking in cold and unfed gives you a mediocre session. Mediocre sessions, repeated, build a mediocre body. The work outside the gym buys the work inside it.",
      },
      {
        label: "How",
        body: "Eat 60–90 minutes before — protein plus a carb. Warm up the lift you're about to do (light sets of the actual movement, not generic stretching). Caffeine if you use it.",
      },
      {
        label: "The Lever",
        body: "Walk in already knowing your numbers. The program tells you what to do. Your one job is to execute at 8/10 or higher, every set.",
      },
    ],
  },
  {
    num: "04",
    title: "Progressive overload.",
    lead: "Same weights week after week = same body. Muscle only grows when it's asked to.",
    cards: [
      {
        label: "Why",
        body: "Lifting the same weight forever maintains, doesn't build. The mechanism is mechanical: lift heavier than last time, the body adapts. No adaptation, no change.",
      },
      {
        label: "How",
        body: "Add weight every other week. 135 → 145 in two weeks. If a lift feels easy two sessions in a row, the weight goes up next session.",
      },
      {
        label: "The Lever",
        body: "Log every set. The log isn't analysis — it's the contract. If the numbers aren't moving over a month, something is broken and we fix it at check-in.",
      },
    ],
  },
  {
    num: "05",
    title: "Don't get injured.",
    lead: "Every great physique I know has one thing in common: their owner has been in the gym, consistently, for years. Injuries break that.",
    cards: [
      {
        label: "Why",
        body: "An injury is 6–12 weeks off. The whole system stops, the body softens, motivation tanks. The most underrated principle in fitness is being in the gym next week.",
      },
      {
        label: "How",
        body: "Form before weight, always. Deload when the body asks. Sharp pain → stop. Dull ache → tell the coach. Ego adds weight; experience subtracts it.",
      },
      {
        label: "The Lever",
        body: "Better to leave a rep in the tank than miss eight weeks. The progression is patient. The injury is not.",
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

export default function PrinciplesPage() {
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
            Five principles.<br />
            That&apos;s the whole game.
          </h1>

          <p className="text-[#edf5e2]/75 text-base md:text-lg leading-relaxed max-w-xl">
            Most fitness content is noise. After years of testing — on myself, then on clients — I keep coming back to the same five levers. Get these right and the body changes. Get them wrong and nothing else matters: not the supplement stack, not the program, not the macros.
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
