import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "The GF Protocol | ZANA Fitness",
  description:
    "How I helped build my girlfriend the body she wanted. The exact framework I used to help her fix her eating habits, build the right kind of curves, and finally feel confident.",
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

export default function GFProtocolPage() {
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
              Case Study & Framework
            </p>
          </div>

          <h1
            className="font-display leading-[1.04] text-[#0a0a0a] mb-8"
            style={{ fontSize: "clamp(40px, 6.5vw, 72px)" }}
          >
            How I helped build<br />my girlfriend the body<br />she wanted.
          </h1>

          <p className="text-[#1f2937]/65 text-lg md:text-xl leading-relaxed mb-10">
            The exact protocol I put MJ on. How we fixed her eating habits, built the right kind of curves, and got her feeling confident in her own skin.
          </p>

          <div className="flex items-center gap-4 text-[12px] text-[#1f2937]/50">
            <span className="font-semibold text-[#1f2937]/75">Javi Lorenzana</span>
            <span className="w-1 h-1 rounded-full bg-[#1f2937]/25" />
            <span>@javi_zana</span>
            <span className="w-1 h-1 rounded-full bg-[#1f2937]/25" />
            <span>4 min read</span>
          </div>
        </header>

        {/* ── DISCLAIMER ──────────────────────────────────────────────────────── */}
        <div className="max-w-2xl mx-auto pt-12 pb-4">
          <div className="bg-[#65a30d]/5 border-l-2 border-[#65a30d] rounded-r-2xl p-6 md:p-8">
            <p className="font-display text-xl md:text-2xl leading-snug text-[#0a0a0a] mb-3">
              Disclaimer Before The Internet Cancels Me
            </p>
            <p className="text-[#1f2937]/85 text-[15px] leading-relaxed">
              I love my girlfriend exactly the way she is, and I thought she looked perfect before. She specifically came to me complaining that she felt "flabby" despite being skinny, and explicitly asked me to write her a program. I am just a boyfriend following instructions so my girlfriend stays happy. Please do not cancel me. 😅
            </p>
          </div>
        </div>

        {/* ── BODY ──────────────────────────────────────────────────────────── */}
        <div className="max-w-2xl mx-auto py-10 md:py-14">

          {/* INTRO */}
          <div className="space-y-6 text-[17px] md:text-[18px] leading-[1.75] text-[#1f2937]/85">
            <p>Hey, I'm Javi. I'm a fitness coach, and yes, I'm the guy who "made" my girlfriend change her body (because she asked me to, I promise).</p>
            <p>When MJ first came to me, she had a very common problem: <strong className="text-[#0a0a0a] font-semibold">She was skinny, but she wasn't in shape.</strong></p>
            <p>She was eating like a bird, doing random cardio, and feeling frustrated that she still felt "soft" or "flabby." She didn't need to lose weight—she needed to completely change her body composition.</p>
            <p>Here is the exact framework I used to help her fix her eating habits, build the right kind of curves, and finally feel confident.</p>
          </div>

          {/* SECTION 01 */}
          <SectionHeader
            num="01"
            label="Phase 1"
            title={<>Fixing the "Skinny-Fat" Diet</>}
          />
          <div className="space-y-6 text-[17px] md:text-[18px] leading-[1.75] text-[#1f2937]/85">
            <p>Most girls think the answer to looking "toned" is eating salads and doing the treadmill. It's the exact opposite.</p>
            
            <ul className="space-y-4 pl-6 list-disc marker:text-[#65a30d]">
              <li>
                <strong className="text-[#0a0a0a] font-semibold">We stopped the starvation:</strong> I actually made her EAT MORE. To build a shape, you need building blocks. We bumped up her calories so she was eating enough to actually fuel her body.
              </li>
              <li>
                <strong className="text-[#0a0a0a] font-semibold">Protein became a non-negotiable:</strong> She wasn't eating nearly enough protein. We set a strict target (about 0.8g to 1g per pound of her goal body weight) to ensure the weight she was putting on was lean muscle, not fat.
              </li>
              <li>
                <strong className="text-[#0a0a0a] font-semibold">No more "good" or "bad" foods:</strong> I taught her how to track her macros so she could still eat the foods she loved without the guilt.
              </li>
            </ul>
          </div>

          <figure className="my-10 md:my-12">
            <div className="grid grid-cols-2 gap-2 md:gap-3">
              <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-[#1f2937]/5">
                <Image
                  src="/before-after/before_1.png"
                  alt="Before"
                  width={1200}
                  height={1600}
                  sizes="(min-width: 768px) 336px, 50vw"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-[#1f2937]/5">
                <Image
                  src="/before-after/before_2.png"
                  alt="Before"
                  width={1200}
                  height={1600}
                  sizes="(min-width: 768px) 336px, 50vw"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <figcaption className="text-center text-[12px] text-[#1f2937]/45 mt-3 italic tracking-wide">
              The starting point.
            </figcaption>
          </figure>

          {/* SECTION 02 */}
          <SectionHeader
            num="02"
            label="Phase 2"
            title={<>Training for Shape, Not Sweat</>}
          />
          <div className="space-y-6 text-[17px] md:text-[18px] leading-[1.75] text-[#1f2937]/85">
            <p>Sweating a lot does not equal a good workout. We ditched the endless cardio and moved to the weight room.</p>
            
            <ul className="space-y-4 pl-6 list-disc marker:text-[#65a30d]">
              <li>
                <strong className="text-[#0a0a0a] font-semibold">Progressive Overload:</strong> We picked a few core exercises (RDLs, hip thrusts, split squats, shoulder presses) and focused on getting stronger at them every single week.
              </li>
              <li>
                <strong className="text-[#0a0a0a] font-semibold">Building the "Illusion":</strong> To get that hourglass, "snatched" look, we focused heavily on building her glutes and her shoulders. When your shoulders and glutes grow, your waist naturally looks smaller.
              </li>
              <li>
                <strong className="text-[#0a0a0a] font-semibold">Rest Days:</strong> I forced her to take rest days. You don't grow in the gym; you grow when you recover.
              </li>
            </ul>
          </div>

          {/* ── MID-ARTICLE CTA ─────────────────────────────────────────────── */}
          <aside className="my-14 md:my-16 py-6 md:py-7 px-6 md:px-7 border-l-2 border-[#65a30d] bg-[#65a30d]/5 rounded-r-xl">
            <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#65a30d] mb-2">
              Coaching
            </p>
            <p className="font-display text-lg md:text-xl leading-snug text-[#0a0a0a] mb-3">
              Want the exact custom programming I built for MJ?
            </p>
            <Link
              href="/apply"
              className="inline-flex items-center gap-1.5 text-[#4d7c0f] font-semibold text-sm hover:text-[#365314] transition-colors border-b border-[#4d7c0f]/30 pb-0.5"
            >
              Apply to work with me <span aria-hidden="true">→</span>
            </Link>
          </aside>

          {/* SECTION 03 */}
          <SectionHeader
            num="03"
            label="Phase 3"
            title={<>The Mindset Shift</>}
          />
          <div className="space-y-6 text-[17px] md:text-[18px] leading-[1.75] text-[#1f2937]/85">
            <p>The hardest part wasn't the workouts—it was the mental shift of seeing the scale go UP, but realizing her body looked tighter, leaner, and better than ever.</p>
            
            <ul className="space-y-4 pl-6 list-disc marker:text-[#65a30d]">
              <li>
                <strong className="text-[#0a0a0a] font-semibold">Throw away the scale:</strong> Muscle is denser than fat. She gained weight, but she dropped dress sizes.
              </li>
              <li>
                <strong className="text-[#0a0a0a] font-semibold">Consistency over perfection:</strong> We didn't aim for 100% perfection. We aimed for 80% consistency over a long period of time.
              </li>
            </ul>
          </div>

          {/* ── BEFORE / AFTER RESULTS ───────────────────────────────────────── */}
          <div className="my-14 md:my-16 space-y-16">
            
            {/* Pair 1: Before 3 / After 1 */}
            <div>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <figure>
                  <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-[#1f2937]/5">
                    <Image
                      src="/before-after/before_3.png"
                      alt="Before"
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
                      src="/before-after/after_1.png"
                      alt="After"
                      width={1200}
                      height={1600}
                      sizes="(min-width: 768px) 336px, 50vw"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <figcaption className="text-center text-[11px] font-bold tracking-[0.22em] uppercase text-[#65a30d] mt-3">
                    After
                  </figcaption>
                </figure>
              </div>
              
              <div className="mt-8 max-w-2xl mx-auto space-y-6 text-[17px] md:text-[18px] leading-[1.75] text-[#1f2937]/85 text-center italic">
                <p>The physical changes were undeniable. She built the shape she always wanted without starving herself.</p>
              </div>
            </div>

            {/* Pair 2: Before 4 / After 2 */}
            <div>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <figure>
                  <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-[#1f2937]/5">
                    <Image
                      src="/before-after/before_4.png"
                      alt="Before"
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
                      src="/before-after/after_2.png"
                      alt="After"
                      width={1200}
                      height={1600}
                      sizes="(min-width: 768px) 336px, 50vw"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <figcaption className="text-center text-[11px] font-bold tracking-[0.22em] uppercase text-[#65a30d] mt-3">
                    After
                  </figcaption>
                </figure>
              </div>

              <div className="mt-8 max-w-2xl mx-auto space-y-6 text-[17px] md:text-[18px] leading-[1.75] text-[#1f2937]/85 text-center italic">
                <p>More importantly, her confidence skyrocketed. The body was just the physical proof of the mental shift.</p>
              </div>
            </div>

            {/* After 3 & 4 */}
            <figure>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-[#1f2937]/5">
                  <Image
                    src="/before-after/after_3.png"
                    alt="After"
                    width={1320}
                    height={2065}
                    sizes="(min-width: 768px) 332px, 50vw"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-[#1f2937]/5">
                  <Image
                    src="/before-after/after_4.png"
                    alt="After"
                    width={1320}
                    height={2308}
                    sizes="(min-width: 768px) 332px, 50vw"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <figcaption className="text-center text-[12px] text-[#65a30d] font-bold uppercase mt-3 tracking-wide">
                The Protocol applied consistently
              </figcaption>
            </figure>
          </div>

          {/* ── CALL TO ACTION ──────────────────────────────────────────────── */}
          <aside className="mt-20 pt-12 border-t border-[#1f2937]/10">
            <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#65a30d] mb-5">
              Want me to do for you what I did for MJ?
            </p>
            <h3
              className="font-display leading-[1.15] text-[#0a0a0a] mb-5"
              style={{ fontSize: "clamp(24px, 3.5vw, 32px)" }}
            >
              I don't just train my girlfriend.<br />I run a full online coaching program.
            </h3>
            <p className="text-[16px] md:text-[17px] leading-[1.75] text-[#1f2937]/70 mb-8 max-w-xl">
              If you want the exact step-by-step coaching, accountability, and custom programming to build your dream body — apply below.
            </p>
            <Link
              href="/apply"
              className="inline-flex items-center gap-3 bg-[#b0e455] text-[#0f1a0c] font-bold text-sm px-8 py-4 rounded-2xl hover:bg-[#c9f070] transition-colors"
            >
              Apply to Work With Me
              <span aria-hidden="true">→</span>
            </Link>
            <p className="text-[12px] text-[#1f2937]/45 mt-5 tracking-wide">
              (Let me know MJ sent you!)
            </p>
          </aside>

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
