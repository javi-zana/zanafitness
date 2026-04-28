"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, TrendingUp, Leaf, Target } from "lucide-react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";

const ZanaLogo = ({ className = "h-8" }: { className?: string }) => (
  <svg viewBox="0 0 180 32" className={className} fill="none" stroke="currentColor" strokeWidth="5" strokeMiterlimit="10">
    <path d="M0,2 H32 L18.3,14" />
    <path d="M13.7,18 L0,30 H32" />
    <path d="M48,30 L64,2 L80,30" />
    <path d="M96,30 V2 L128,30 V2" />
    <path d="M144,30 L160,2 L176,30" />
  </svg>
);

const ZIcon = ({ className = "h-8" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" stroke="currentColor" strokeWidth="5" strokeMiterlimit="10">
    <path d="M0,2 H32 L18.3,14" />
    <path d="M13.7,18 L0,30 H32" />
  </svg>
);

const features = [
  "Progressive training program",
  "Personalised nutrition targets",
  "Daily coaching guidance",
  "Weekly system adjustments",
  "Progress tracking dashboard",
  "Direct coach access",
];

function PlanCard({
  label,
  price,
  commitment,
  priceId,
  featured,
  paddle,
}: {
  label: string;
  price: number;
  commitment: string;
  priceId: string;
  featured?: boolean;
  paddle: Paddle | undefined;
}) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = () => {
    if (!paddle) return;
    setLoading(true);
    paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      settings: {
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      },
    });
    setLoading(false);
  };

  return (
    <div
      className={`flex flex-col border ${
        featured ? "border-[#b3cdff] shadow-[0_0_80px_-20px_rgba(179,205,255,0.15)]" : "border-[#2d3a4b] bg-[#1a222c]"
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

      <button
        onClick={handleCheckout}
        disabled={loading || !paddle}
        className={`w-full py-4 rounded-full text-[10px] uppercase tracking-widest font-bold transition-colors disabled:opacity-50 ${
          featured
            ? "bg-[#b3cdff] text-black hover:bg-white"
            : "border border-[#2d3a4b] text-gray-300 hover:border-[#b3cdff] hover:text-[#b3cdff]"
        }`}
      >
        {loading ? "Opening..." : "JOIN THE SYSTEM"}
      </button>
    </div>
  );
}

export default function SystemPage() {
  const [paddle, setPaddle] = useState<Paddle | undefined>();

  useEffect(() => {
    initializePaddle({
      environment: (process.env.NEXT_PUBLIC_PADDLE_ENV as "sandbox" | "production") ?? "sandbox",
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
    }).then(setPaddle);
  }, []);

  return (
    <main className="min-h-screen bg-[#121821] text-white font-sans selection:bg-[#b3cdff] selection:text-[#121821]">
      
      {/* NAVBAR */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-8 md:px-16 overflow-hidden border-b border-[#2d3a4b]/50">
        <Link href="/">
          <ZIcon className="h-5 md:h-6 text-white" />
        </Link>
        <div className="hidden md:flex items-center space-x-12 text-[10px] tracking-[0.2em] font-inter uppercase font-semibold text-gray-300">
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <Link href="/system" className="text-white hover:text-white transition-colors">The System</Link>
          <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
          <Link href="/system" className="bg-[#b3cdff] text-[#121821] font-bold px-8 py-2.5 rounded-full hover:bg-white transition-colors">
            JOIN THE SYSTEM
          </Link>
        </div>
      </nav>

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
            
            {/* Box 1 */}
            <div className="flex flex-col items-center md:border-r border-[#2d3a4b] md:pr-16">
               <TrendingUp className="w-8 h-8 text-gray-300 stroke-1 mb-8" />
               <div className="font-mono text-[10px] tracking-widest text-[#b3cdff] mb-4">01</div>
               <h3 className="uppercase tracking-[0.2em] text-xs font-bold mb-3 text-white">Training</h3>
               <p className="font-mono text-gray-400 uppercase tracking-widest text-[9px]">Calculated Overload</p>
               <p className="mt-4 font-inter text-xs text-gray-500 leading-snug">No random workouts. Every session builds on the last with precise volume mapping.</p>
            </div>
            
            {/* Box 2 */}
            <div className="flex flex-col items-center md:border-r border-[#2d3a4b] md:px-16">
               <Leaf className="w-8 h-8 text-gray-300 stroke-1 mb-8" />
               <div className="font-mono text-[10px] tracking-widest text-[#b3cdff] mb-4">02</div>
               <h3 className="uppercase tracking-[0.2em] text-xs font-bold mb-3 text-white">Nutrition</h3>
               <p className="font-mono text-gray-400 uppercase tracking-widest text-[9px]">Linear Alignment</p>
               <p className="mt-4 font-inter text-xs text-gray-500 leading-snug">Mathematical macro assignments synchronized specifically against your training output.</p>
            </div>

            {/* Box 3 */}
            <div className="flex flex-col items-center md:pl-16">
               <Target className="w-8 h-8 text-gray-300 stroke-[1.5] mb-8" />
               <div className="font-mono text-[10px] tracking-widest text-[#b3cdff] mb-4">03</div>
               <h3 className="uppercase tracking-[0.2em] text-xs font-bold mb-3 text-white">Guidance</h3>
               <p className="font-mono text-gray-400 uppercase tracking-widest text-[9px]">Constant Adaptation</p>
               <p className="mt-4 font-inter text-xs text-gray-500 leading-snug">Data is collected weekly. Protocols are adjusted immediately to ensure momentum.</p>
            </div>

          </div>
        </div>
      </section>

      {/* CORE STATEMENT */}
      <section className="py-24 px-6 text-center bg-[#121821]">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <p className="text-[#b3cdff] font-mono text-[10px] tracking-widest mb-10">THE RESULT</p>
          <h2 className="text-xl md:text-3xl font-sans font-light tracking-[0.15em] uppercase leading-tight text-white mb-10">
            When you eliminate choice,<br />
            progress becomes <span className="text-[#b3cdff]">inevitable.</span>
          </h2>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-24 px-6 bg-[#1a222c] border-y border-[#2d3a4b]" id="pricing">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-xl md:text-3xl font-sans font-light tracking-[0.15em] uppercase text-white mb-4">Choose Your Commitment.</h2>
            <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400">Secure your access protocol below.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <PlanCard
              label="Entry"
              price={500}
              commitment="3-month commitment"
              priceId={process.env.NEXT_PUBLIC_PADDLE_PRICE_3M!}
              paddle={paddle}
            />
            <PlanCard
              label="Committed"
              price={400}
              commitment="6-month commitment"
              priceId={process.env.NEXT_PUBLIC_PADDLE_PRICE_6M!}
              paddle={paddle}
            />
            <PlanCard
              label="All In"
              price={300}
              commitment="12-month commitment"
              priceId={process.env.NEXT_PUBLIC_PADDLE_PRICE_12M!}
              featured
              paddle={paddle}
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-16 px-10 md:px-24 bg-[#0f141b] flex flex-col md:flex-row items-center justify-between border-t border-[#2d3a4b] text-[9px] font-mono tracking-[0.2em] uppercase text-gray-500 gap-8">
        <div className="flex-1 flex justify-center md:justify-start w-full md:w-auto">
          <p>&copy; 2026 Zana Fitness</p>
        </div>
        <div className="flex-1 flex justify-center py-6 md:py-0">
          <ZanaLogo className="h-4 md:h-5 text-white" />
        </div>
        <div className="flex-1 flex justify-center md:justify-end gap-5 w-full md:w-auto">
          <a href="https://www.instagram.com/javi_zana/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
          <a href="https://www.tiktok.com/@javi_zana?lang=en" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">TikTok</a>
        </div>
      </footer>
    </main>
  );
}
