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
    <main className="min-h-screen bg-[#0f1a0c] text-[#edf5e2] flex flex-col">

      <Navbar active="about" />

      <section className="grid grid-cols-1 md:grid-cols-2 flex-1 pt-20 md:pt-0">

        {/* Left — Photo */}
        <div className="h-[50vh] md:h-full w-full relative border-b md:border-b-0 md:border-r border-[#b0e455]/8 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/A502086F-E304-43B4-87C1-93658EDB79F0.PNG')] bg-cover bg-center bg-no-repeat" />
          <div className="absolute inset-0 bg-[#0f1a0c]/15" />
        </div>

        {/* Right — Copy */}
        <div className="flex flex-col justify-center px-10 py-16 md:px-20 md:py-28 lg:px-28 z-10 bg-[#162212]">
          <p className="text-xs font-semibold tracking-wider uppercase text-[#b0e455] mb-8">The Idea</p>
          <h1 className="font-display leading-none" style={{ fontSize: "clamp(48px, 6vw, 84px)" }}>
            Who This<br />Is For.
          </h1>

          <div className="w-10 h-px bg-[#b0e455]/25 mt-10 mb-10" />

          <div className="space-y-6 max-w-lg">
            <p className="text-sm text-[#edf5e2]/65 leading-relaxed">
              Getting lean was one of the highest-ROI decisions I ever made. It changed how I walked into rooms, how people responded to me, how I felt building my business. The physique compounds into everything — presence, confidence, attraction, energy.
            </p>
            <p className="text-sm text-[#edf5e2]/45 leading-relaxed">
              But I watched the same people around me — smart, successful, well-dressed men in their late 20s and 30s — stuck in the same loop. They'd start a program, fall off, restart. They had the income. The wardrobe. The career. Not the body.
            </p>
            <p className="text-sm text-[#edf5e2]/65 leading-relaxed">
              ZANA exists to close that gap. Not through two-hour gym sessions or rice-and-chicken diets. Through a lifestyle system built around how ambitious people actually live.
            </p>
          </div>

          <div className="mt-12">
            <p className="text-xs font-medium text-[#b0e455] mb-5">Built for results. Not motivation.</p>
            <ZanaLogo className="h-5 text-[#edf5e2] opacity-20" />
          </div>
        </div>
      </section>

      <Footer />

    </main>
  );
}
