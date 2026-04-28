"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
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
        featured ? "border-[#b3cdff]" : "border-[#2d3a4b]"
      } rounded-2xl p-10 md:p-12 relative`}
    >
      {featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#b3cdff] text-black text-[9px] font-bold uppercase tracking-widest px-4 py-1 rounded-full whitespace-nowrap">
          Best Value
        </span>
      )}

      <p className="text-[9px] uppercase tracking-widest font-bold text-gray-300 mb-2">{label}</p>
      <div className="flex items-end gap-2 mb-1">
        <span className="text-4xl md:text-5xl font-light text-white">${price}</span>
        <span className="text-[10px] uppercase tracking-widest text-gray-300 mb-2">/mo</span>
      </div>
      <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-10">{commitment}</p>

      <ul className="space-y-4 mb-12 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-3">
            <Check
              className={`w-3 h-3 flex-shrink-0 ${featured ? "text-[#b3cdff]" : "text-gray-400"}`}
              strokeWidth={2.5}
            />
            <span className="text-[10px] uppercase tracking-widest text-gray-400">{f}</span>
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
    <main className="min-h-screen bg-[#121821] text-white font-sans">
      {/* NAVBAR */}
      <nav className="flex items-center justify-between p-8 md:px-16 border-b border-[#2d3a4b]">
        <Link href="/">
          <ZIcon className="h-5 md:h-6 text-white" />
        </Link>
        <div className="hidden md:flex items-center space-x-12 text-[10px] tracking-widest uppercase font-bold text-gray-400">
          <Link href="/#training" className="hover:text-white transition-colors">Training</Link>
          <Link href="/system" className="text-white">The System</Link>
          <Link href="/#nutrition" className="hover:text-white transition-colors">Nutrition</Link>
        </div>
      </nav>

      {/* HEADER */}
      <section className="py-20 px-6 text-center border-b border-[#2d3a4b]">
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <ZanaLogo className="h-10 md:h-12 text-white mb-12" />
          <div className="w-8 h-px bg-gray-500 mb-12"></div>
          <h1 className="text-xl md:text-2xl font-light tracking-[0.15em] uppercase leading-tight text-white mb-4">
            The System.
          </h1>
          <p className="text-[10px] uppercase tracking-widest font-bold text-gray-300">
            Choose your commitment. Begin your progress.
          </p>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">
          <PlanCard
            label="Standard Access"
            price={500}
            commitment="4-month commitment"
            priceId={process.env.NEXT_PUBLIC_PADDLE_PRICE_4M!}
            paddle={paddle}
          />
          <PlanCard
            label="Full Commitment"
            price={400}
            commitment="12-month commitment"
            priceId={process.env.NEXT_PUBLIC_PADDLE_PRICE_12M!}
            featured
            paddle={paddle}
          />
        </div>
      </section>

      {/* STATEMENT */}
      <section className="py-24 px-6 text-center border-t border-[#2d3a4b]">
        <div className="max-w-xl mx-auto">
          <p className="text-[10px] uppercase tracking-widest text-gray-300 font-bold leading-tight">
            This isn&apos;t a subscription.<br />
            It&apos;s a system designed to make<br />
            <span className="text-[#b3cdff]">progress inevitable</span>.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-8 md:px-16 border-t border-[#2d3a4b] flex justify-between items-center text-[9px] uppercase tracking-widest text-gray-400 font-bold">
        <ZanaLogo className="h-5 text-white" />
        <p>&copy; 2024 Zana Fitness</p>
      </footer>
    </main>
  );
}
