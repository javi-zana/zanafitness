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
            Origin.<br />The Idea.
          </h1>

          <div className="w-8 h-px bg-[#b3cdff] mt-12 mb-12" />

          <div className="space-y-8 text-sm tracking-wide text-gray-400 font-light leading-relaxed max-w-lg">
            <p>
              Motivation is a myth sold to the masses. It&apos;s an emotion, and like all emotions, it fades.
            </p>
            <p>
              ZANA was built on the fundamental belief that lasting physical change requires structural elimination of choice. When you remove &ldquo;how&rdquo; and &ldquo;what&rdquo; from your daily equation, you are only left with &ldquo;do&rdquo;.
            </p>
            <p>
              Our protocols are mathematically linear. Our nutrition mandates are uncompromising. We built this platform for people who are tired of guessing and ready to simply execute.
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
