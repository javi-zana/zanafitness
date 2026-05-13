import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The Skinny Fat Protocol | ZANA Fitness",
  description:
    "The system that worked for me. How I went from 160 pounds skinny fat to an eight pack in six months — and why the body was just the gateway.",
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

function SectionLabel({ num, children }: { num: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="text-[10px] font-bold text-[#b0e455]/40 tracking-[0.22em]">{num}</span>
      <span className="h-px flex-1 bg-[#b0e455]/10" />
      <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#b0e455]/60">{children}</span>
    </div>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-display leading-[1.05] text-[#edf5e2] mb-8"
      style={{ fontSize: "clamp(30px, 4.5vw, 50px)" }}
    >
      {children}
    </h2>
  );
}

const protocolBullets = [
  {
    num: "01",
    title: "Calculate your BMR with activity level. Eat 300–400 below it.",
    sub: "Mine was 2,200.",
  },
  {
    num: "02",
    title: "Get a kitchen scale.",
    sub: "Weigh your protein for the first four to eight weeks. The intuition you build will last forever.",
  },
  {
    num: "03",
    title: "Hit your protein hard.",
    sub: "Chicken breast or ground beef at least once per meal. Eggs as a side.",
  },
  {
    num: "04",
    title: "Build the diet around your actual life.",
    sub: "Night owl? Save calories for the late hours. Sweet tooth? Find clean substitutes — Greek yogurt and fruit beats ice cream. Allow the occasional bag of chips. Perfection kills consistency.",
  },
  {
    num: "05",
    title: "Keep lifting heavy.",
    sub: "Recomp is real. High protein lets you cut while still getting stronger.",
  },
  {
    num: "06",
    title: "Train your weak links.",
    sub: "If something hurts, ask what isn't getting trained. Traps for the neck. Calves for the foot. Imbalances cause injuries.",
  },
  {
    num: "07",
    title: "Give it six months.",
    sub: "Not six weeks. Not three. Six.",
  },
  {
    num: "08",
    title: "Work with your nature, not against it.",
    sub: "The one rule above all rules.",
  },
];

export default function ProtocolPage() {
  return (
    <main className="min-h-screen bg-[#0b1509] text-[#edf5e2] font-sans selection:bg-[#b0e455] selection:text-[#0f1a0c]">

      {/* ── NAV ───────────────────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[#b0e455]/6">
        <Link href="/" className="text-[#edf5e2]/50 hover:text-[#edf5e2] transition-colors">
          <ZanaLogo className="h-5" />
        </Link>
        <Link href="/apply" className="text-xs font-semibold tracking-wide text-[#b0e455] hover:text-[#c9f070] transition-colors">
          Apply →
        </Link>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section className="pt-20 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-1.5 h-1.5 rounded-full bg-[#b0e455]" />
            <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#b0e455]/60">From Javi</p>
          </div>

          <h1 className="font-display leading-[1.02] mb-8" style={{ fontSize: "clamp(44px, 7vw, 84px)" }}>
            The Skinny Fat<br />Protocol.
          </h1>

          <p className="text-[#edf5e2]/55 text-base md:text-lg leading-relaxed">
            The system that worked for me. Direct, honest, no-bullshit.
          </p>
        </div>
      </section>

      {/* ── 01 — THE WAKE-UP CALL ─────────────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-[#b0e455]/6">
        <div className="max-w-2xl mx-auto">
          <SectionLabel num="01">The Wake-Up Call</SectionLabel>
          <H2>It was 2022. I was 160 pounds.</H2>
          <div className="space-y-5 text-[#edf5e2]/70 text-base md:text-lg leading-relaxed">
            <p>Basically overweight for my frame. Peak skinny fat era.</p>
            <p>I looked in the mirror and there was nothing. No abs. No jawline. No cuts. Just soft.</p>
            <p>The worst part: I&apos;d been lifting for four years. I knew how to push weight. I knew what training was supposed to look like. I was just really confused as to why I was getting just fat.</p>
            <p>Then my mom told me I needed to lose weight. It had gotten to that point.</p>
            <p className="text-[#edf5e2]/85">
              It was just, like, a very frustrating time where I was very insecure with how I looked. I used to look really good in high school. And then four years later, I had no idea what happened.
            </p>
            <p className="text-[#edf5e2]/85">
              If you&apos;ve been lifting for a year, two years, four years — and you still have nothing to show for it — this is for you. I was you.
            </p>
          </div>
        </div>
      </section>

      {/* ── 02 — THE TRIGGER ──────────────────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-[#b0e455]/6">
        <div className="max-w-2xl mx-auto">
          <SectionLabel num="02">The Trigger</SectionLabel>
          <H2>I&apos;d like to tell you my motivation was health.</H2>
          <div className="space-y-5 text-[#edf5e2]/70 text-base md:text-lg leading-relaxed">
            <p>It wasn&apos;t.</p>
            <p>I&apos;d just gotten back to Toronto from studying abroad. Came off a breakup. The whole life was getting reshuffled.</p>
            <p>My motivation was two things:</p>
            <ol className="space-y-2.5 pl-6 text-[#edf5e2]/85">
              <li className="list-decimal">Get my confidence back.</li>
              <li className="list-decimal">Get girls.</li>
            </ol>
            <p>That&apos;s the truth. Most guys won&apos;t say it out loud. They dress it up in &quot;longevity&quot; and &quot;feeling good in my body&quot; and whatever else. But for me at 22, in Toronto, single, just back from abroad — it was confidence and girls.</p>
            <p>The smart thing I clocked early: losing body fat would lose face fat. And the face is what actually moves the needle on how attractive you look. Abs are a nice-to-have. <span className="text-[#edf5e2]">The face is the unlock.</span></p>
            <p>The deeper version of the confidence thing came later. I didn&apos;t know that yet. At the time, it was pure aesthetics.</p>
          </div>
        </div>
      </section>

      {/* ── 03 — THE FIRST MOVE ───────────────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-[#b0e455]/6">
        <div className="max-w-2xl mx-auto">
          <SectionLabel num="03">The First Move</SectionLabel>
          <H2>I calculated my BMR with activity level.</H2>
          <div className="space-y-5 text-[#edf5e2]/70 text-base md:text-lg leading-relaxed">
            <p>Mine came out around 2,500–2,600. I locked in at 2,200 calories a day and tracked strictly.</p>
            <p>The starting template was two meals:</p>
            <ul className="space-y-1.5 pl-6 text-[#edf5e2]/85">
              <li className="list-disc">Rice</li>
              <li className="list-disc">A vegetable</li>
              <li className="list-disc">Either chicken breast or ground beef</li>
              <li className="list-disc">A side of eggs</li>
            </ul>
            <p>That was it. Clean, repeatable, boring.</p>
            <p>I did it for two days, and it was fucking hard. Cravings hit. I overate. The first time I went out with friends I basically blew the whole thing.</p>
            <p className="text-[#edf5e2]/85">
              The strict version did not survive contact with my actual life. That&apos;s important — because what replaced it is what actually worked.
            </p>
          </div>
        </div>
      </section>

      {/* ── 04 — THE UNLOCK ───────────────────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-[#b0e455]/6 bg-[#0f1a0c]">
        <div className="max-w-2xl mx-auto">
          <SectionLabel num="04">The Unlock</SectionLabel>
          <H2>You don&apos;t have to fight your nature.<br /><span className="text-[#b0e455]">You have to work around it.</span></H2>
          <div className="space-y-5 text-[#edf5e2]/70 text-base md:text-lg leading-relaxed">
            <p>This is the part most people miss.</p>
            <p>The biggest unlock wasn&apos;t the perfect plan. It was learning myself and building a plan that fit who I actually am.</p>

            <div className="pt-4">
              <p className="text-[#edf5e2] font-semibold mb-2">I&apos;m a night owl, and I love midnight snacks.</p>
              <p>Most diet plans tell you to stop eating by 8pm. That was never going to work for me. So I built around it. One real meal a day, usually a very late lunch. A midnight snack to satisfy the night owl in me. I stopped trying to be a &quot;three meals, last bite by 8pm&quot; guy.</p>
            </div>

            <div className="pt-2">
              <p className="text-[#edf5e2] font-semibold mb-2">I have a sweet tooth.</p>
              <p>Instead of trying to kill the craving, I found substitutes. Greek yogurt and fruit replaced ice cream. Clean swaps for whatever I was reaching for.</p>
            </div>

            <p className="pt-2">And I still ate Takis sometimes. I was not a monk. The plan worked because it allowed for the occasional bag of chips. <span className="text-[#edf5e2]">Perfection is the enemy of consistency.</span></p>

            <p>Every &quot;microhabit adjustment&quot; was really me learning something about myself and adjusting the plan to fit me.</p>

            <p className="text-[#edf5e2]/85 text-lg md:text-xl leading-snug pt-2">
              The plan should fit you. You should not be contorting yourself to fit the plan.
            </p>

            <p>Most fitness content fails you because it hands you someone else&apos;s life. Your job isn&apos;t to copy a routine. Your job is to figure out where your cravings, your schedule, and your psychology actually live — and build around that.</p>
          </div>
        </div>
      </section>

      {/* ── 05 — TRAINING & PROTEIN ───────────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-[#b0e455]/6">
        <div className="max-w-2xl mx-auto">
          <SectionLabel num="05">Training &amp; Protein</SectionLabel>
          <H2>Won&apos;t eating less make you weak?</H2>
          <div className="space-y-5 text-[#edf5e2]/70 text-base md:text-lg leading-relaxed">
            <p>It didn&apos;t. I kept getting stronger. One plate bench to two plate bench in three months.</p>
            <p>The reason was protein. Chicken breast or ground beef at least once per meal. I tracked everything.</p>
            <p>I bought a kitchen scale and weighed out my protein. After about a month of doing that, I&apos;d built up an intuition for what calories look like on a plate. That intuition has stuck with me ever since.</p>
            <p className="text-[#edf5e2]/85">
              High protein + consistent training + a calorie deficit = recomposition. You don&apos;t have to choose between leaner and stronger. With enough protein, you get both.
            </p>
          </div>
        </div>
      </section>

      {/* ── 06 — INJURIES ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-[#b0e455]/6">
        <div className="max-w-2xl mx-auto">
          <SectionLabel num="06">The Plateau You Won&apos;t See Coming</SectionLabel>
          <H2>Around month 3, my body started breaking.</H2>
          <div className="space-y-5 text-[#edf5e2]/70 text-base md:text-lg leading-relaxed">
            <p>I&apos;d wake up with a really bad stiff neck. Then foot pain came out of nowhere. It regressed my progress hard. I actually lost my abs during one of those stretches.</p>
            <p>I saw a couple of PTs. The principle they kept coming back to:</p>
          </div>

          <blockquote className="my-10 border-l-2 border-[#b0e455]/40 pl-6">
            <p className="font-display text-2xl md:text-3xl text-[#edf5e2] leading-snug">
              Most injuries are caused by muscle imbalances.
            </p>
          </blockquote>

          <div className="space-y-5 text-[#edf5e2]/70 text-base md:text-lg leading-relaxed">
            <p>Two concrete examples from my own body:</p>

            <div>
              <p className="text-[#edf5e2] font-semibold mb-1.5">Neck pain.</p>
              <p>I wasn&apos;t training my traps. They were underdeveloped and overcompensating for the load I was pushing. I started actually training traps. The neck pain went away.</p>
            </div>

            <div>
              <p className="text-[#edf5e2] font-semibold mb-1.5">Foot pain.</p>
              <p>I wasn&apos;t training my calves. I added calf work. The foot pain disappeared.</p>
            </div>

            <p className="text-[#edf5e2]/85 pt-2">
              Pain is usually not a signal to stop training. It&apos;s a signal that something else isn&apos;t getting trained. Audit your weak links.
            </p>
          </div>
        </div>
      </section>

      {/* ── 07 — THE RESULT ───────────────────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-[#b0e455]/6 bg-[#0f1a0c]">
        <div className="max-w-2xl mx-auto">
          <SectionLabel num="07">The Result</SectionLabel>
          <H2>Six months in, I took a picture in the mirror.</H2>
          <div className="space-y-5 text-[#edf5e2]/70 text-base md:text-lg leading-relaxed">
            <p>Started seriously in January 2023. Middle of summer 2023, I took a picture in the mirror and I was like, wow. It is there. Eight pack.</p>
            <p>The aesthetic payoff was real. But the bigger payoff was something I didn&apos;t see coming.</p>
          </div>

          <div className="my-12 bg-[#b0e455]/8 border border-[#b0e455]/20 rounded-2xl px-6 py-8 md:px-10 md:py-10">
            <p className="font-display text-2xl md:text-3xl leading-snug text-[#edf5e2]">
              Getting ripped is the best financial investment I made in my early twenties.
            </p>
          </div>

          <div className="space-y-5 text-[#edf5e2]/70 text-base md:text-lg leading-relaxed">
            <p>What it actually unlocked:</p>
            <ul className="space-y-3">
              {[
                "Content creation. I'd always wanted to make content. I'd never pulled the trigger. The confidence let me start.",
                "Brand deals with partners I'd been watching for years.",
                "Businesses I'm building in the health and wellness space.",
                "A presence in rooms. People walk in and they're just like, oh, Javi is ripped. And I'm just like, yeah, that's me. That self-identification gives me an edge in business I didn't expect.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="text-[#b0e455] mt-1 shrink-0 text-sm">→</span>
                  <span className="text-[#edf5e2]/75 leading-relaxed">{t}</span>
                </li>
              ))}
            </ul>
            <p className="pt-3 text-[#edf5e2]/85">
              I thought I was doing this to get girls and look good. What I actually got was a new self-identity. <span className="text-[#edf5e2]">The body was the gateway. The confidence was the prize.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── 08 — THE PROTOCOL ─────────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-[#b0e455]/6">
        <div className="max-w-3xl mx-auto">
          <SectionLabel num="08">The Protocol</SectionLabel>
          <H2>If I had to do it again from 160.</H2>
          <p className="text-[#edf5e2]/55 text-base md:text-lg leading-relaxed mb-12">
            Here&apos;s exactly what I&apos;d do.
          </p>

          <div className="space-y-0 divide-y divide-[#b0e455]/6 border-y border-[#b0e455]/6">
            {protocolBullets.map((p) => (
              <div key={p.num} className="flex items-start gap-6 py-7">
                <span className="text-[10px] font-bold text-[#b0e455]/30 tracking-widest mt-1 shrink-0 w-6">{p.num}</span>
                <div>
                  <p className="font-display text-lg md:text-xl text-[#edf5e2] mb-1.5 leading-snug">{p.title}</p>
                  <p className="text-sm md:text-base text-[#edf5e2]/50 leading-relaxed">{p.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 09 — CLOSING ──────────────────────────────────────────────────────── */}
      <section className="py-32 px-6 border-t border-[#b0e455]/6">
        <div className="max-w-2xl mx-auto">
          <SectionLabel num="09">Closing</SectionLabel>
          <div className="space-y-8 text-[#edf5e2]/80 text-lg md:text-xl leading-snug">
            <p>Don&apos;t try to be someone else&apos;s idea of disciplined.</p>
            <p>
              Be <span className="text-[#b0e455]">strategically intelligent</span> about who you actually are.
            </p>
            <p className="text-[#edf5e2]/65 text-base md:text-lg leading-relaxed">
              The whole protocol in one sentence: figure out who you are, build a plan that fits your life, track your protein, stay consistent, adjust when injuries happen, don&apos;t try to be perfect.
            </p>
            <p className="text-[#edf5e2]">
              The confidence compounds from there. That&apos;s the part nobody tells you.
            </p>
          </div>

          <div className="mt-24 flex items-center gap-4">
            <ZanaLogo className="h-5 text-[#edf5e2]/20" />
            <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#edf5e2]/25">
              @javi_zana
            </span>
          </div>
        </div>
      </section>

    </main>
  );
}
