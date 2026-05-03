import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const ZanaLogo = ({ className = "h-8" }: { className?: string }) => (
  <svg viewBox="0 0 180 32" className={className} fill="none" stroke="currentColor" strokeWidth="5" strokeMiterlimit="10">
    <path d="M0,2 H32 L18.3,14" />
    <path d="M13.7,18 L0,30 H32" />
    <path d="M48,30 L64,2 L80,30" />
    <path d="M96,30 V2 L128,30 V2" />
    <path d="M144,30 L160,2 L176,30" />
  </svg>
);

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0b1509] text-[#edf5e2] flex flex-col">
      <Navbar active="about" />

      {/* ── Hero split ────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 flex-1 min-h-[calc(100vh-80px)] pt-20 md:pt-0">

        {/* Photo */}
        <div className="h-[55vh] md:h-full w-full relative overflow-hidden md:border-r border-[#b0e455]/6">
          <div className="absolute inset-0 bg-[url('/A502086F-E304-43B4-87C1-93658EDB79F0.PNG')] bg-cover bg-center bg-no-repeat" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1509]/80 via-[#0b1509]/15 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0b1509]/10 hidden md:block" />
        </div>

        {/* Copy */}
        <div className="flex flex-col justify-center px-8 py-16 md:px-16 md:py-28 lg:px-24 bg-[#0f1a0c]">
          <div className="max-w-md">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#b0e455] mb-10">The Idea Behind Zana</p>

            <h1 className="font-display leading-none mb-8" style={{ fontSize: "clamp(44px, 5.5vw, 76px)" }}>
              Who This<br />Is For.
            </h1>

            <div className="w-8 h-px bg-[#b0e455]/30 mb-9" />

            <div className="space-y-5 max-w-sm">
              <p className="text-sm text-[#edf5e2]/70 leading-[1.85]">
                Getting lean was one of the highest-ROI decisions I ever made. It changed how I walked into rooms, how people responded to me, how I felt building my business. The physique compounds into everything — presence, confidence, attraction, energy.
              </p>
              <p className="text-sm text-[#edf5e2]/42 leading-[1.85]">
                But I watched the same people around me — smart, successful, well-dressed men in their late 20s and 30s — stuck in the same loop. They'd start a program, fall off, restart. They had the income. The wardrobe. The career. Not the body.
              </p>
              <p className="text-sm text-[#edf5e2]/70 leading-[1.85]">
                ZANA exists to close that gap. Not through two-hour gym sessions or rice-and-chicken diets. Through a lifestyle system built around how ambitious people actually live.
              </p>
            </div>

            <div className="mt-10 pt-8 border-t border-[#b0e455]/8 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#b0e455]">Javier Lorenzana</p>
                <p className="text-xs text-[#edf5e2]/30 mt-0.5">Founder & Head Coach</p>
              </div>
              <ZanaLogo className="h-4 text-[#edf5e2] opacity-12" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Values strip ──────────────────────────────────────────────────────── */}
      <section className="py-16 px-8 bg-[#162212] border-t border-[#b0e455]/6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12">
          {[
            { label: 'No nonsense', desc: 'The program is based on what works, not what sells.' },
            { label: 'Built for real life', desc: 'Travel, work dinners, social events — the system accounts for all of it.' },
            { label: 'Results that stick', desc: 'Sustainable changes to the habits that drive the physique.' },
          ].map(v => (
            <div key={v.label}>
              <div className="w-5 h-px bg-[#b0e455]/40 mb-4" />
              <p className="text-sm font-semibold text-[#edf5e2] mb-2">{v.label}</p>
              <p className="text-sm text-[#edf5e2]/45 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
