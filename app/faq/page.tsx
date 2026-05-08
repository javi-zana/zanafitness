"use client";

import { useState } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Link from "next/link";

const faqs = [
  {
    q: "Who is this for?",
    a: "Professionals who are earning well, dressing well, but the body doesn't match the life you've built. You've tried programs before and fallen off. You have 2–3 free hours a day and flexible schedules — you just need a system that fits your actual life.",
  },
  {
    q: "What makes this different from other programs?",
    a: "Most programs are built around the gym. ZANA is built around your lifestyle. The training is simple and effective — not designed to turn you into a bodybuilder. The real work happens in the habits around it: how you eat, how you recover, how you structure your days. That's what makes the physique stick.",
  },
  {
    q: "What results should I expect?",
    a: "A lean, aesthetic build — typically 12–15% body fat with visible shoulders, chest, and arms. The 'looks good in a fitted shirt or suit' physique. Most members see significant changes in the first 8–12 weeks. You will not look like a bodybuilder. You will look like someone who clearly takes care of himself.",
  },
  {
    q: "How much time does it require each day?",
    a: "Training sessions run 45–60 minutes, 4–5 days per week. The nutrition system is habit-based — no meal prepping for hours. If you have 2–3 free hours a day, you have enough time.",
  },
  {
    q: "What's included in the program?",
    a: "Everything. Training split, nutrition targets, macro guidance, supplement protocol, recovery habits, weekly check-ins, and direct access to Javi. You don't buy add-ons.",
  },
  {
    q: "Do I need a gym?",
    a: "Yes. The training system is built around standard commercial gym equipment — barbells, dumbbells, cables, machines. Any decent gym will have everything you need.",
  },
  {
    q: "Is there a required commitment?",
    a: "Yes — 4 or 12 months. Meaningful physical change takes time. We don't offer month-to-month because 30 days isn't enough to build the habits or see the physique shift. The longer the commitment, the lower the monthly rate.",
  },
  {
    q: "What's the refund policy?",
    a: "7-day satisfaction guarantee on your first payment. After that, all sales are final. See our full refund policy for details.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#b0e455]/8">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-6 text-left gap-6 group"
      >
        <h3 className="text-sm font-semibold text-[#edf5e2] group-hover:text-white transition-colors leading-snug">{q}</h3>
        <div className={`w-6 h-6 rounded-full border border-[#b0e455]/20 flex items-center justify-center shrink-0 transition-all ${open ? 'bg-[#b0e455]/10 border-[#b0e455]/35' : ''}`}>
          <svg viewBox="0 0 10 10" fill="none" stroke="#b0e455" strokeWidth="1.5" className={`w-3 h-3 transition-transform ${open ? 'rotate-45' : ''}`}>
            <path d="M5 1v8M1 5h8" strokeLinecap="round" />
          </svg>
        </div>
      </button>
      {open && (
        <div className="pb-6 -mt-2">
          <p className="text-sm text-[#edf5e2]/55 leading-[1.85]">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-[#0b1509] text-[#edf5e2] flex flex-col">
      <Navbar active="faq" />

      <section className="max-w-2xl mx-auto pt-36 pb-24 px-6 flex-1 w-full">

        <div className="mb-16">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#b0e455] mb-6">Questions</p>
          <h1 className="font-display leading-none" style={{ fontSize: "clamp(48px, 7vw, 88px)" }}>
            Common<br />Questions.
          </h1>
        </div>

        <div>
          {faqs.map((item) => (
            <FAQItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>

        <div className="mt-16 p-8 bg-[#162212] border border-[#b0e455]/8 rounded-3xl">
          <p className="text-xs font-semibold tracking-wider uppercase text-[#b0e455] mb-3">Still have questions?</p>
          <p className="text-sm text-[#edf5e2]/55 leading-relaxed mb-6">
            The system is straightforward. If something isn't clear, reach out — we respond quickly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 bg-[#b0e455] text-[#0f1a0c] px-7 py-3.5 rounded-2xl font-semibold text-sm hover:bg-[#c9f070] transition-colors"
            >
              Join the System
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center text-sm font-medium text-[#b0e455] hover:text-[#c9f070] transition-colors px-7 py-3.5 rounded-2xl border border-[#b0e455]/20 hover:border-[#b0e455]/40"
            >
              Learn more →
            </Link>
          </div>
        </div>

      </section>

      <Footer />
    </main>
  );
}
