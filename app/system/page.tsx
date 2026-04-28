"use client";

import { Check, TrendingUp, Leaf, Target } from "lucide-react";
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


const features = [
  "Habit-based lifestyle system",
  "Simple, effective training split",
  "Personalised nutrition & macros",
  "Weekly check-ins with your coach",
  "Supplement & recovery guidance",
  "Direct access to Javi",
];

function PlanCard({
  label,
  price,
  commitment,
  variantId,
  featured,
}: {
  label: string;
  price: number;
  commitment: string;
  variantId: string;
  featured?: boolean;
}) {
  const checkoutUrl = `https://zana-fitness.lemonsqueezy.com/checkout/buy/${variantId}?checkout[redirect_url]=https://zanafitness.com/dashboard&embed=1`;

  return (
    <div
      className={`flex flex-col border ${
        featured ? "border-[#b3cdff] shadow-[0_0_80px_-20px_rgba(179,205,255,0.15)]" : "border-[#2d3a4b]"
      } rounded-2xl p-10 md:p-12 relative bg-[#1a222c]`}
    >
      {featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#b3cdff] text-black text-[9px] font-bold uppercase tracking-widest px-4 py-1 rounded-full whitespace-nowrap">
          Best Value
        </span>
      )}

      <p className="text-[9px] uppercase tracking-widest font-bold text-[#b3cdff] mb-2">{label}</p>
      <div className="flex items-end gap-2 mb-1">
        <span className="text-4xl md:text-5xl font-light text-white">${price}</span>
        <span className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">/mo</span>
      </div>
      <p className="text-[9px] uppercase tracking-widest text-gray-500 mb-10">{commitment}</p>

      <ul className="space-y-4 mb-12 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-3">
            <Check
              className={`w-3 h-3 flex-shrink-0 ${featured ? "text-[#b3cdff]" : "text-gray-500"}`}
              strokeWidth={2.5}
            />
            <span className="text-[10px] uppercase tracking-widest text-gray-300">{f}</span>
          </li>
        ))}
      </ul>

      <a
        href={checkoutUrl}
        className={`lemonsqueezy-button w-full py-4 rounded-full text-[10px] uppercase tracking-widest font-bold transition-colors text-center ${
          featured
            ? "bg-[#b3cdff] text-black hover:bg-white"
            : "border border-[#2d3a4b] text-gray-300 hover:border-[#b3cdff] hover:text-[#b3cdff]"
        }`}
      >
        JOIN THE SYSTEM
      </a>
    </div>
  );
}

export default function SystemPage() {
  return (
    <main className="min-h-screen bg-[#121821] text-white font-sans selection:bg-[#b3cdff] selection:text-[#121821]">

      <Navbar active="system" />

      {/* HEADER */}
      <section className="pt-40 pb-20 px-6 text-center bg-[#121821]">
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <ZanaLogo className="h-10 md:h-12 text-white mb-12" />
          <div className="w-8 h-px bg-gray-500 mb-12"></div>
          <h1 className="text-2xl md:text-4xl font-sans font-light tracking-[0.1em] uppercase leading-tight text-white mb-6">
            The System.
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#b3cdff]">Not a program. A protocol.</p>
        </div>
      </section>

      {/* SYSTEM EXPECTATIONS */}
      <section className="py-24 px-6 bg-[#1a222c] border-y border-[#2d3a4b]">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          <p className="text-[#b3cdff] font-mono text-[10px] tracking-widest mb-10">EXPECTATIONS</p>
          <h2 className="text-xl md:text-2xl font-sans font-light tracking-[0.15em] uppercase text-center mb-20">
            A framework built on structure.
          </h2>
          <div className="grid md:grid-cols-3 gap-16 md:gap-0 w-full text-center px-4">

            <div className="flex flex-col items-center md:border-r border-[#2d3a4b] md:pr-16">
               <TrendingUp className="w-8 h-8 text-gray-300 stroke-1 mb-8" />
               <div className="font-mono text-[10px] tracking-widest text-[#b3cdff] mb-4">01</div>
               <h3 className="uppercase tracking-[0.2em] text-xs font-bold mb-3 text-white">Training</h3>
               <p className="font-mono text-gray-400 uppercase tracking-widest text-[9px]">Calculated Overload</p>
               <p className="mt-4 font-inter text-xs text-gray-500 leading-snug">A simple, progressive split built for your schedule — not a bodybuilder's. 45–60 minute sessions, structured to build the lean aesthetic look: shoulders, chest, arms.</p>
            </div>

            <div className="flex flex-col items-center md:border-r border-[#2d3a4b] md:px-16">
               <Leaf className="w-8 h-8 text-gray-300 stroke-1 mb-8" />
               <div className="font-mono text-[10px] tracking-widest text-[#b3cdff] mb-4">02</div>
               <h3 className="uppercase tracking-[0.2em] text-xs font-bold mb-3 text-white">Nutrition</h3>
               <p className="font-mono text-gray-400 uppercase tracking-widest text-[9px]">Linear Alignment</p>
               <p className="mt-4 font-inter text-xs text-gray-500 leading-snug">No elimination diets. No extreme cuts. Real food, clear macro targets, and meal habits that fit your life in Singapore, Manila, Jakarta, or wherever you are.</p>
            </div>

            <div className="flex flex-col items-center md:pl-16">
               <Target className="w-8 h-8 text-gray-300 stroke-[1.5] mb-8" />
               <div className="font-mono text-[10px] tracking-widest text-[#b3cdff] mb-4">03</div>
               <h3 className="uppercase tracking-[0.2em] text-xs font-bold mb-3 text-white">Guidance</h3>
               <p className="font-mono text-gray-400 uppercase tracking-widest text-[9px]">Constant Adaptation</p>
               <p className="mt-4 font-inter text-xs text-gray-500 leading-snug">Weekly check-ins. Adjustments when life gets busy. A coach who understands your world — the travel, the client dinners, the demanding schedule.</p>
            </div>

          </div>
        </div>
      </section>

      {/* CORE STATEMENT */}
      <section className="py-24 px-6 text-center bg-[#121821]">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <p className="text-[#b3cdff] font-mono text-[10px] tracking-widest mb-10">THE RESULT</p>
          <h2 className="text-xl md:text-3xl font-sans font-light tracking-[0.15em] uppercase leading-tight text-white mb-10">
            The physique compounds into everything else<br />
            you've built — career, confidence, presence.<br />
            Start building it <span className="text-[#b3cdff]">right.</span>
          </h2>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-24 px-6 bg-[#1a222c] border-y border-[#2d3a4b]" id="pricing">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-xl md:text-3xl font-sans font-light tracking-[0.15em] uppercase text-white mb-4">Choose Your Commitment Level.</h2>
            <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400">All plans include the full system. Choose how long you're in.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <PlanCard
              label="Entry"
              price={500}
              commitment="3-month commitment"
              variantId="f0300d4c-3b86-4b56-9bd3-767779edbfaf"
            />
            <PlanCard
              label="Committed"
              price={400}
              commitment="6-month commitment"
              variantId="218015ad-39b5-4d64-9158-c4864fb8038a"
            />
            <PlanCard
              label="All In"
              price={300}
              commitment="12-month commitment"
              variantId="174b1e98-247a-41e2-bcfe-7ce449e329a7"
              featured
            />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
