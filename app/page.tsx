import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-navy-900 text-white selection:bg-babyblue-500 selection:text-navy-900">
      
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center p-6 border-b border-navy-800">
        <div className="absolute inset-0 bg-[url('/bg-hero.png')] bg-cover bg-center brightness-50 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-transparent"></div>
        
        <div className="relative z-10 space-y-12 max-w-2xl mt-12">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase">
            Z A N A
            <span className="block text-xl md:text-2xl mt-4 font-normal tracking-[0.3em]">F I T N E S S</span>
          </h1>
          
          <div className="space-y-2 uppercase tracking-widest text-sm md:text-base text-gray-300">
            <p>Built for results.</p>
            <p>Not motivation.</p>
          </div>
          
          <Link href="/login" className="inline-block mt-8 bg-babyblue-500 text-navy-900 font-bold px-12 py-4 rounded-full uppercase tracking-widest uppercase hover:bg-babyblue-400 transition-colors">
            Join the System
          </Link>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="py-32 px-6 text-center border-b border-navy-800">
        <div className="max-w-3xl mx-auto space-y-8">
          <p className="text-babyblue-500 text-sm tracking-widest font-bold">01</p>
          <h2 className="text-3xl md:text-4xl font-medium tracking-wide uppercase leading-relaxed text-gray-200">
            You don't lack discipline.<br />
            You've just never followed<br />
            a system that actually works.
          </h2>
        </div>
      </section>

      {/* SYSTEM SECTION */}
      <section className="py-32 px-6 border-b border-navy-800">
        <div className="max-w-5xl mx-auto">
          <p className="text-babyblue-500 text-sm tracking-widest font-bold text-center mb-6">02</p>
          <h2 className="text-2xl md:text-3xl font-medium tracking-wide uppercase text-center mb-24">
            A system built on structure.
          </h2>
          
          <div className="grid md:grid-cols-3 gap-16 md:gap-8 text-center px-4">
            <div className="space-y-4">
              <div className="text-babyblue-500 text-2xl border-b border-navy-700 pb-4 mb-8">01</div>
              <h3 className="uppercase tracking-widest font-bold mb-2">Training</h3>
              <p className="text-gray-400 uppercase tracking-widest text-sm">That Progresses</p>
            </div>
            <div className="space-y-4">
              <div className="text-babyblue-500 text-2xl border-b border-navy-700 pb-4 mb-8">02</div>
              <h3 className="uppercase tracking-widest font-bold mb-2">Nutrition</h3>
              <p className="text-gray-400 uppercase tracking-widest text-sm">That Aligns</p>
            </div>
            <div className="space-y-4">
              <div className="text-babyblue-500 text-2xl border-b border-navy-700 pb-4 mb-8">03</div>
              <h3 className="uppercase tracking-widest font-bold mb-2">Guidance</h3>
              <p className="text-gray-400 uppercase tracking-widest text-sm">That Adapts</p>
            </div>
          </div>
        </div>
      </section>

      {/* CORE STATEMENT */}
      <section className="py-40 px-6 text-center border-b border-navy-800">
        <div className="max-w-3xl mx-auto">
          <p className="text-babyblue-500 text-sm tracking-widest font-bold mb-8">03</p>
          <h2 className="text-3xl md:text-5xl font-medium tracking-tighter uppercase leading-tight text-gray-200">
            This isn't a program.<br />
            It's a system designed<br />
            to make progress <span className="text-babyblue-500">inevitable</span>.
          </h2>
        </div>
      </section>

      {/* WAITLIST / PAYMENT */}
      <section className="py-32 px-6 flex flex-col items-center justify-center text-center">
        <div className="max-w-xl w-full space-y-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-medium tracking-wide uppercase mb-4">Join the System.</h2>
            <p className="text-gray-400 uppercase tracking-widest text-sm">Create your account and checkout below.</p>
          </div>
          
          <div className="bg-navy-800 p-8 rounded-2xl shadow-xl w-full mx-auto space-y-6">
            <div className="space-y-4 text-left">
               <h3 className="text-xl font-medium uppercase tracking-wide">ZANA System Access</h3>
               <p className="text-sm text-gray-400">Monthly subscription. Cancel anytime.</p>
               <p className="text-2xl font-bold text-babyblue-500 pt-2 pb-6">$49 / mo</p>
            </div>
            <Link href="/login" className="block w-full text-center bg-babyblue-500 text-navy-900 font-bold px-6 py-4 rounded-full uppercase tracking-widest hover:bg-babyblue-400 transition-colors">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 border-t border-navy-800 flex flex-col md:flex-row justify-between items-center text-xs uppercase tracking-widest text-gray-500">
        <div className="mb-4 md:mb-0">
          ZANA FITNESS &copy; 2026
        </div>
        <div className="space-x-8">
          <Link href="mailto:hello@zanafitness.com" className="hover:text-babyblue-500">Contact</Link>
          <Link href="/login" className="hover:text-babyblue-500">Member Login</Link>
        </div>
      </footer>
    </main>
  );
}
