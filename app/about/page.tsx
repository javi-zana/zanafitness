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
    <main className="min-h-screen bg-[#0f172a] text-white flex flex-col">

      <Navbar active="about" />

      <section className="grid grid-cols-1 md:grid-cols-2 flex-1 pt-20 md:pt-0">

        {/* Left — Photo */}
        <div className="h-[50vh] md:h-full w-full relative border-b md:border-b-0 md:border-r border-[#1f3050] overflow-hidden">
          <div className="absolute inset-0 bg-[url('/A502086F-E304-43B4-87C1-93658EDB79F0.PNG')] bg-cover bg-center bg-no-repeat brightness-90" />
          <div className="absolute inset-0 bg-[#0f172a]/10" />
        </div>

        {/* Right — Copy */}
        <div className="flex flex-col justify-center px-10 py-16 md:px-20 md:py-28 lg:px-28 z-10">
          <p className="font-mono text-[8px] tracking-[0.4em] uppercase text-[#b3cdff] mb-8">The Idea</p>
          <h1 className="font-display leading-none uppercase" style={{ fontSize: "clamp(48px, 6vw, 88px)" }}>
            Who This<br />Is For.
          </h1>

          <div className="w-8 h-px bg-[#b3cdff] mt-10 mb-10" />

          <div className="space-y-6 max-w-lg">
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-400 leading-loose">
              Getting lean was one of the highest-ROI decisions I ever made. It changed how I walked into rooms, how people responded to me, how I felt building my business. The physique compounds into everything — presence, confidence, attraction, energy.
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-500 leading-loose">
              But I watched the same people around me — smart, successful, well-dressed men in their late 20s and 30s — stuck in the same loop. They&apos;d start a program, fall off, restart. They had the income. The wardrobe. The career. Not the body.
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-400 leading-loose">
              ZANA exists to close that gap. Not through two-hour gym sessions or rice-and-chicken diets. Through a lifestyle system built around how ambitious people actually live.
            </p>
          </div>

          <div className="mt-14">
            <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-[#b3cdff] mb-5">Built for results. Not motivation.</p>
            <ZanaLogo className="h-5 text-white opacity-30" />
          </div>
        </div>
      </section>

      <Footer />

    </main>
  );
}
