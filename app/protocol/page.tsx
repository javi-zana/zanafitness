import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "The Skinny Fat Protocol | ZANA Fitness",
  description:
    "The system that worked for me. How I went from skinny fat to an eight pack in six months — and why the body was just the gateway.",
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
    <header className="mb-10 mt-20 first:mt-0">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-[11px] font-bold tracking-[0.22em] text-[#65a30d]">{num}</span>
        <span className="h-px w-8 bg-[#1f2937]/15" />
        <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#1f2937]/45">{label}</span>
      </div>
      <h2
        className="font-display leading-[1.1] text-[#0a0a0a]"
        style={{ fontSize: "clamp(28px, 3.8vw, 40px)" }}
      >
        {title}
      </h2>
    </header>
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

      {/* ── ARTICLE HEADER ────────────────────────────────────────────────────── */}
      <article className="px-6">
        <header className="max-w-2xl mx-auto pt-20 pb-16 md:pt-28 md:pb-20 border-b border-[#1f2937]/8">
          <div className="flex items-center gap-2 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#65a30d]" />
            <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#1f2937]/55">
              From Javi
            </p>
          </div>

          <h1
            className="font-display leading-[1.04] text-[#0a0a0a] mb-8"
            style={{ fontSize: "clamp(40px, 6.5vw, 72px)" }}
          >
            The Skinny Fat<br />Protocol.
          </h1>

          <p className="text-[#1f2937]/65 text-lg md:text-xl leading-relaxed mb-10">
            The system that worked for me. How I went from skinny fat to an eight pack in six months.
          </p>

          <div className="flex items-center gap-4 text-[12px] text-[#1f2937]/50">
            <span className="font-semibold text-[#1f2937]/75">Javi Lorenzana</span>
            <span className="w-1 h-1 rounded-full bg-[#1f2937]/25" />
            <span>@javi_zana</span>
            <span className="w-1 h-1 rounded-full bg-[#1f2937]/25" />
            <span>6 min read</span>
          </div>
        </header>

        {/* ── BEFORE / NOW HOOK ─────────────────────────────────────────────── */}
        <div className="max-w-2xl mx-auto pt-12 md:pt-14 pb-4 border-b border-[#1f2937]/8">
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <figure>
              <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-[#1f2937]/5">
                <Image
                  src="/protocol/before.jpg"
                  alt="Javi in 2022, peak skinny fat era"
                  width={1600}
                  height={1200}
                  sizes="(min-width: 768px) 336px, 50vw"
                  className="w-full h-full object-cover"
                />
              </div>
              <figcaption className="text-center text-[11px] font-bold tracking-[0.22em] uppercase text-[#1f2937]/45 mt-3">
                Before
              </figcaption>
            </figure>
            <figure>
              <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-[#1f2937]/5">
                <Image
                  src="/protocol/now.jpg"
                  alt="Javi today"
                  width={1200}
                  height={1600}
                  sizes="(min-width: 768px) 336px, 50vw"
                  className="w-full h-full object-cover"
                />
              </div>
              <figcaption className="text-center text-[11px] font-bold tracking-[0.22em] uppercase text-[#65a30d] mt-3">
                Now
              </figcaption>
            </figure>
          </div>
          <p className="text-center text-[12px] text-[#1f2937]/45 mt-6 italic tracking-wide">
            Same guy. Different system.
          </p>
        </div>

        {/* ── BODY ──────────────────────────────────────────────────────────── */}
        <div className="max-w-2xl mx-auto py-16 md:py-20">

          {/* SECTION 01 */}
          <SectionHeader
            num="01"
            label="The Wake-Up Call"
            title={<>It was 2022. I was skinny fat.</>}
          />
          <div className="space-y-6 text-[17px] md:text-[18px] leading-[1.75] text-[#1f2937]/85">
            <p>Basically overweight for my frame. Peak skinny fat era.</p>
            <p>I looked in the mirror and there was nothing. No abs. No jawline. No cuts. Just soft.</p>
            <p>The worst part: I&apos;d been lifting for four years. I knew how to push weight. I knew what training was supposed to look like. I was just really confused as to why I was getting just fat.</p>
            <p>Then my mom told me I needed to lose weight. It had gotten to that point.</p>
            <p>
              It was just, like, a very frustrating time where I was very insecure with how I looked. I used to look really good in high school. And then four years later, I had no idea what happened.
            </p>
            <p>
              If you&apos;ve been lifting for a year, two years, four years — and you still have nothing to show for it — this is for you. I was you.
            </p>
          </div>

          {/* SECTION 02 */}
          <SectionHeader
            num="02"
            label="The Trigger"
            title={<>I&apos;d like to tell you my motivation was health.</>}
          />
          <div className="space-y-6 text-[17px] md:text-[18px] leading-[1.75] text-[#1f2937]/85">
            <p>It wasn&apos;t.</p>
            <p>I&apos;d just gotten back to Toronto from studying abroad. Came off a breakup. My whole life was getting reshuffled.</p>
            <p>My motivation was two things:</p>
            <ol className="space-y-2 pl-6 list-decimal marker:text-[#65a30d] marker:font-semibold">
              <li>Get my confidence back.</li>
              <li>Get girls.</li>
            </ol>
            <p>That&apos;s the truth. Most guys won&apos;t say it out loud. They dress it up in &quot;longevity&quot; and &quot;feeling good in my body&quot; and whatever else. But for me at 22, in Toronto, single, just back from abroad — it was confidence and girls.</p>
            <p>The smart thing I clocked early: losing body fat would lose face fat. And the face is what actually moves the needle on how attractive you look. Abs are a nice-to-have. <strong className="text-[#0a0a0a] font-semibold">The face is the unlock.</strong></p>
            <p>The deeper version of the confidence thing came later. I didn&apos;t know that yet. At the time, it was pure aesthetics.</p>
          </div>

          {/* SECTION 03 */}
          <SectionHeader
            num="03"
            label="The First Move"
            title={<>I calculated my BMR with activity level.</>}
          />
          <div className="space-y-6 text-[17px] md:text-[18px] leading-[1.75] text-[#1f2937]/85">
            <p>Mine came out around 2,500–2,600. I locked in at 2,200 calories a day and tracked strictly.</p>
            <p>The starting template was two meals:</p>
            <ul className="space-y-1.5 pl-6 list-disc marker:text-[#65a30d]">
              <li>Rice</li>
              <li>A vegetable</li>
              <li>Either chicken breast or ground beef</li>
              <li>A side of eggs</li>
            </ul>
            <p>That was it. Clean, repeatable, boring.</p>

            <div className="my-10 md:my-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-2.5">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <div key={n} className="aspect-square overflow-hidden rounded-lg bg-[#1f2937]/5">
                    <Image
                      src={`/protocol/meals/${String(n).padStart(2, "0")}.jpg`}
                      alt="High-protein meal from the cut"
                      width={600}
                      height={600}
                      sizes="(min-width: 768px) 168px, 50vw"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <p className="text-center text-[12px] text-[#1f2937]/45 mt-4 italic tracking-wide">
                A year of meals, more or less.
              </p>
            </div>
            <p>I did it for two days, and it was fucking hard. Cravings hit. I overate. The first time I went out with friends I basically blew the whole thing.</p>
            <p>
              The strict version did not survive contact with my actual life. That&apos;s important — because what replaced it is what actually worked.
            </p>
          </div>

          {/* SECTION 04 */}
          <SectionHeader
            num="04"
            label="The Unlock"
            title={
              <>
                You don&apos;t have to fight your nature.
                <br />
                <span className="text-[#4d7c0f]">You have to work around it.</span>
              </>
            }
          />
          <div className="space-y-6 text-[17px] md:text-[18px] leading-[1.75] text-[#1f2937]/85">
            <p>This is the part most people miss.</p>
            <p>The biggest unlock wasn&apos;t the perfect plan. It was learning myself and building a plan that fit who I actually am.</p>

            <div>
              <p className="text-[#0a0a0a] font-semibold mb-2">I&apos;m a night owl, and I love midnight snacks.</p>
              <p>Most diet plans tell you to stop eating by 8pm. That was never going to work for me. So I built around it. One real meal a day, usually a very late lunch. A midnight snack to satisfy the night owl in me. I stopped trying to be a &quot;three meals, last bite by 8pm&quot; guy.</p>
            </div>

            <div>
              <p className="text-[#0a0a0a] font-semibold mb-2">I have a sweet tooth.</p>
              <p>Instead of trying to kill the craving, I found substitutes. Greek yogurt and fruit replaced ice cream. Clean swaps for whatever I was reaching for.</p>
            </div>

            <p>And I still ate Taki&apos;s sometimes. I was not a monk. The plan worked because it allowed for the occasional bag of chips. <strong className="text-[#0a0a0a] font-semibold">Perfection is the enemy of consistency.</strong></p>

            <p>Every &quot;microhabit adjustment&quot; was really me learning something about myself and adjusting the plan to fit me.</p>

            <blockquote className="my-8 border-l-2 border-[#65a30d] pl-6 py-1">
              <p className="font-display text-xl md:text-2xl leading-snug text-[#0a0a0a]">
                The plan should fit you. You should not be contorting yourself to fit the plan.
              </p>
            </blockquote>

            <p>Most fitness content fails you because it hands you someone else&apos;s life. Your job isn&apos;t to copy a routine. Your job is to figure out where your cravings, your schedule, and your psychology actually live — and build around that.</p>
          </div>

          {/* SECTION 05 */}
          <SectionHeader
            num="05"
            label="Training & Protein"
            title={<>Won&apos;t eating less make you weak?</>}
          />
          <div className="space-y-6 text-[17px] md:text-[18px] leading-[1.75] text-[#1f2937]/85">
            <p>It didn&apos;t. I kept getting stronger. One plate bench to two plate bench in three months.</p>
            <p>The reason was protein. Chicken breast or ground beef at least once per meal. I tracked everything.</p>
            <p>I bought a kitchen scale and weighed out my protein. After about a month of doing that, I&apos;d built up an intuition for what calories look like on a plate. That intuition has stuck with me ever since.</p>
            <p>
              High protein + consistent training + a calorie deficit = recomposition. You don&apos;t have to choose between leaner and stronger. With enough protein, you get both.
            </p>
          </div>

          {/* SECTION 06 */}
          <SectionHeader
            num="06"
            label="The Plateau You Won't See Coming"
            title={<>Around month 3, my body started breaking.</>}
          />
          <div className="space-y-6 text-[17px] md:text-[18px] leading-[1.75] text-[#1f2937]/85">
            <p>I&apos;d wake up with a really bad stiff neck. Then foot pain came out of nowhere. It regressed my progress hard. I actually lost my abs during one of those stretches.</p>
            <p>I saw a couple of PTs. The principle they kept coming back to:</p>

            <blockquote className="my-2 border-l-2 border-[#65a30d] pl-6 py-1">
              <p className="font-display text-xl md:text-2xl leading-snug text-[#0a0a0a]">
                Most injuries are caused by muscle imbalances.
              </p>
            </blockquote>

            <p>Two concrete examples from my own body:</p>

            <div>
              <p className="text-[#0a0a0a] font-semibold mb-1.5">Neck pain.</p>
              <p>I wasn&apos;t training my traps. They were underdeveloped and overcompensating for the load I was pushing. I started actually training traps. The neck pain went away.</p>
            </div>

            <div>
              <p className="text-[#0a0a0a] font-semibold mb-1.5">Foot pain.</p>
              <p>I wasn&apos;t training my calves. I added calf work. The foot pain disappeared.</p>
            </div>

            <p>
              Pain is usually not a signal to stop training. It&apos;s a signal that something else isn&apos;t getting trained. Audit your weak links.
            </p>
          </div>

          {/* SECTION 07 */}
          <SectionHeader
            num="07"
            label="The Result"
            title={<>Six months in, I took a picture in the mirror.</>}
          />
          <div className="space-y-6 text-[17px] md:text-[18px] leading-[1.75] text-[#1f2937]/85">
            <p>Started seriously in January 2023. Middle of summer 2023, I took a picture in the mirror and I was like, wow. It is there. Eight pack.</p>
          </div>

          <figure className="my-12 md:my-14">
            <div className="overflow-hidden rounded-2xl bg-[#1f2937]/5 mx-auto max-w-md">
              <Image
                src="/protocol/after.jpg"
                alt="Javi summer 2023, eight pack, six months in"
                width={738}
                height={1600}
                sizes="(min-width: 768px) 448px, 100vw"
                className="w-full h-auto"
              />
            </div>
            <figcaption className="text-center text-[12px] text-[#1f2937]/45 mt-3 italic tracking-wide">
              Summer 2023. Six months in.
            </figcaption>
          </figure>

          <div className="space-y-6 text-[17px] md:text-[18px] leading-[1.75] text-[#1f2937]/85">
            <p>The aesthetic payoff was real. But the bigger payoff was something I didn&apos;t see coming.</p>
          </div>

          <div className="my-12 bg-[#65a30d]/6 border border-[#65a30d]/20 rounded-2xl px-6 py-8 md:px-10 md:py-10">
            <p className="font-display text-2xl md:text-[28px] leading-snug text-[#0a0a0a]">
              Getting ripped is the best financial investment I made in my early twenties.
            </p>
          </div>

          <div className="space-y-6 text-[17px] md:text-[18px] leading-[1.75] text-[#1f2937]/85">
            <p>What it actually unlocked:</p>
            <ul className="space-y-3">
              {[
                "Content creation. I'd always wanted to make content. I'd never pulled the trigger. The confidence let me start.",
                "Brand deals with partners I'd been watching for years.",
                "Businesses I'm building in the health and wellness space.",
                "A presence in rooms. People walk in and they're just like, oh, Javi is ripped. And I'm just like, yeah, that's me. That self-identification gives me an edge in business I didn't expect.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="text-[#65a30d] mt-1.5 shrink-0 text-sm">→</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <p>
              I thought I was doing this to get girls and look good. What I actually got was a new self-identity. <strong className="text-[#0a0a0a] font-semibold">The body was the gateway. The confidence was the prize.</strong>
            </p>
          </div>

          {/* SECTION 08 */}
          <SectionHeader
            num="08"
            label="The Protocol"
            title={<>If I had to do it again from skinny fat.</>}
          />
          <p className="text-[17px] md:text-[18px] leading-[1.75] text-[#1f2937]/70 mb-8">
            Here&apos;s exactly what I&apos;d do.
          </p>

          <ol className="border-y border-[#1f2937]/10 divide-y divide-[#1f2937]/10">
            {protocolBullets.map((p) => (
              <li key={p.num} className="flex items-start gap-5 py-6">
                <span className="font-display text-[#65a30d] text-lg shrink-0 w-8 pt-0.5">{p.num}</span>
                <div className="flex-1">
                  <p className="font-display text-lg md:text-xl text-[#0a0a0a] leading-snug mb-1.5">{p.title}</p>
                  <p className="text-[15px] md:text-base text-[#1f2937]/60 leading-relaxed">{p.sub}</p>
                </div>
              </li>
            ))}
          </ol>

          {/* SECTION 09 */}
          <SectionHeader
            num="09"
            label="Closing"
            title={<>Don&apos;t try to be someone else&apos;s idea of disciplined.</>}
          />
          <div className="space-y-7 text-[18px] md:text-[20px] leading-[1.65] text-[#1f2937]/85">
            <p>
              Be <strong className="text-[#4d7c0f] font-semibold">strategically intelligent</strong> about who you actually are.
            </p>
            <p className="text-[16px] md:text-[17px] text-[#1f2937]/70 leading-[1.75]">
              The whole protocol in one sentence: figure out who you are, build a plan that fits your life, track your protein, stay consistent, adjust when injuries happen, don&apos;t try to be perfect.
            </p>
            <p className="text-[#0a0a0a] font-semibold">
              The confidence compounds from there. That&apos;s the part nobody tells you.
            </p>
          </div>

          {/* SIGNATURE */}
          <div className="mt-24 pt-10 border-t border-[#1f2937]/10 flex items-center gap-4">
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
