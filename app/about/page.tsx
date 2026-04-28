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
    <main className="min-h-screen bg-[#121821] text-white font-sans flex flex-col">

      <Navbar active="about" />

      {/* CONTENT */}
      <section className="grid grid-cols-1 md:grid-cols-2 flex-1 bg-[#121821] pt-24 md:pt-0">

        {/* Left — Photo */}
        <div className="h-[50vh] md:h-full w-full relative border-b md:border-b-0 md:border-r border-[#2d3a4b] bg-[#121821] overflow-hidden">
          <div className="absolute inset-0 bg-[url('/A502086F-E304-43B4-87C1-93658EDB79F0.PNG')] bg-cover bg-center bg-no-repeat brightness-[0.85]" />
        </div>

        {/* Right — Copy */}
        <div className="flex flex-col justify-center p-12 md:p-32 z-10">
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold tracking-tighter uppercase leading-[0.85] text-white">
            The Idea.<br />Who This Is For.
          </h1>

          <div className="w-8 h-px bg-[#b3cdff] mt-12 mb-12" />

          <div className="space-y-8 text-sm tracking-wide text-gray-400 font-light leading-relaxed max-w-lg">
            <p>
              Getting lean was one of the highest-ROI decisions I ever made. It changed how I walked into rooms, how people responded to me, how I felt building my business. The physique compounds into everything — presence, confidence, attraction, energy.
            </p>
            <p>
              But I watched the same people around me — smart, successful, well-dressed Asian men in their late 20s and 30s — stuck in the same loop. They'd start a program, fall off, restart. They'd look fine in clothes but hated photos. They had the income. The wardrobe. The career. Not the body.
            </p>
            <p>
              ZANA exists to close that gap. Not through two-hour gym sessions or rice-and-chicken diets. Through a lifestyle system built around how ambitious people actually live — and a simple, proven path to a lean, aesthetic physique that stays.
            </p>
          </div>

          <div className="mt-20">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#b3cdff] mb-4">Built for results. Not motivation.</p>
            <ZanaLogo className="h-6 text-white opacity-40" />
          </div>
        </div>
      </section>

      <Footer />

    </main>
  );
}
