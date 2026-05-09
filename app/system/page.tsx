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

const principles = [
  { num: "01", title: "Getting fit is simple.", sub: "The gap is almost never knowledge. It's consistency." },
  { num: "02", title: "Lifestyle habits are everything.", sub: "80% happens outside the gym. Most people focus on the other 20%." },
  { num: "03", title: "Train hard, but don't get injured.", sub: "The most underrated principle: still being in the gym next week." },
  { num: "04", title: "Get enough sleep.", sub: "You can't out-train a 5-hour night." },
  { num: "05", title: "Fitness should feel effortless.", sub: "If it feels like punishment, it won't last." },
];

export default function SystemPage() {
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

      {/* ── HOOK ──────────────────────────────────────────────────────────────── */}
      <section className="pt-14 pb-6 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-1.5 h-1.5 rounded-full bg-[#b0e455]" />
            <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#b0e455]/60">From Javi</p>
          </div>

          <h1 className="font-display leading-[1.02] mb-10" style={{ fontSize: "clamp(44px, 7vw, 84px)" }}>
            I've been getting<br />a lot of DMs.
          </h1>

          <p className="text-[#edf5e2]/55 text-base md:text-lg leading-relaxed">
            Every week, the same guy. Career sorted. Earns well. Dresses well.<br />
            And frustrated that his body doesn&apos;t match the rest of his life.
          </p>
        </div>
      </section>

      {/* ── THE DMS ───────────────────────────────────────────────────────────── */}
      <section className="pt-4 pb-10 px-6">
        <div className="max-w-2xl mx-auto space-y-3.5">
          <DmBubble text="I look fine with clothes on but I can't take my shirt off without feeling embarrassed. I'm not overweight. I'm just... soft." />
          <DmBubble text="I've tried everything. Programs, diets, apps. Nothing sticks past 3 weeks." />
          <DmBubble text="I travel constantly for work. I have no idea how to stay consistent when I'm not home." />

          <div className="flex justify-end pt-1">
            <div className="bg-[#b0e455]/10 border border-[#b0e455]/20 rounded-2xl rounded-tr-sm px-5 py-3.5 max-w-xs md:max-w-sm">
              <p className="text-[#b0e455] text-sm font-medium leading-relaxed">
                These aren&apos;t excuses. They&apos;re the exact problems I built this for.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE WHY ───────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-[#b0e455]/6">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#b0e455]/50 mb-8">The honest version</p>
          <div className="space-y-5 text-[#edf5e2]/60 text-base md:text-lg leading-relaxed">
            <p>
              Most fitness advice is built for people with unlimited time and nothing better to do. It doesn&apos;t work for how ambitious people actually live.
            </p>
            <p className="text-[#edf5e2]/85">
              What I use with every client comes down to five principles. Simple ones. The kind that hold up even when life gets busy — which it always does.
            </p>
          </div>
        </div>
      </section>

      {/* ── THE FIVE PRINCIPLES ───────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#0f1a0c] border-y border-[#b0e455]/6">
        <div className="max-w-3xl mx-auto">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#b0e455]/50 mb-12">The principles</p>
          <div className="space-y-0 divide-y divide-[#b0e455]/6">
            {principles.map((p) => (
              <div key={p.num} className="flex items-start gap-6 py-7">
                <span className="text-[10px] font-bold text-[#b0e455]/30 tracking-widest mt-1 shrink-0 w-6">{p.num}</span>
                <div>
                  <p className="font-display text-xl md:text-2xl text-[#edf5e2] mb-1.5">{p.title}</p>
                  <p className="text-sm text-[#edf5e2]/40 leading-relaxed">{p.sub}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#edf5e2]/20 mt-10 italic">
            How each one actually works — and how to apply it to your life — is what coaching is for.
          </p>
        </div>
      </section>

      {/* ── WHO IT'S FOR ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#b0e455]/50 mb-8">Who this is for</p>
          <h2 className="font-display leading-[1.05] mb-10" style={{ fontSize: "clamp(28px, 4vw, 46px)" }}>
            I work with a specific type of person.<br />
            <span className="text-[#b0e455]">You&apos;ll know if you&apos;re it.</span>
          </h2>
          <ul className="space-y-4">
            {[
              "Your career and income are sorted. Your body is the last piece.",
              "You've tried things before and they didn't stick. You know why now.",
              "You can commit to at least 4 months. You think in longer horizons.",
              "You want a coach who adjusts when life happens — not one who disappears.",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <span className="text-[#b0e455] mt-0.5 shrink-0 text-sm">→</span>
                <span className="text-sm text-[#edf5e2]/70 leading-relaxed">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <section className="py-36 px-6 border-t border-[#b0e455]/6">
        <div className="max-w-2xl mx-auto text-center">
          <ZanaLogo className="h-7 text-[#edf5e2]/15 mx-auto mb-16" />

          <h2 className="font-display leading-[1.08] mb-6" style={{ fontSize: "clamp(22px, 3vw, 38px)" }}>
            The gap between where you are<br />and where you want to be<br />
            <span className="text-[#b0e455]">is a decision.</span>
          </h2>

          <p className="text-[#edf5e2]/45 text-base leading-relaxed mb-14 max-w-sm mx-auto">
            Apply below. I review every application personally and I&apos;ll let you know if we&apos;re a good fit.
          </p>

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
