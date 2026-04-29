import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const faqs = [
  {
    q: "Who is this for?",
    a: "Asian male professionals, 25–34. You're earning well, dressing well, but the body doesn't match the life you've built. You've tried programs before and fallen off. You have 2–3 free hours a day and flexible schedules — you just need a system that fits your actual life.",
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
    a: "Yes — 3, 6, or 12 months. Meaningful physical change takes time. We don't offer month-to-month because 30 days isn't enough to build the habits or see the physique shift. The longer the commitment, the lower the monthly rate.",
  },
  {
    q: "What's the refund policy?",
    a: "7-day satisfaction guarantee on your first payment. After that, all sales are final. See our full refund policy for details.",
  },
];

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white flex flex-col">

      <Navbar active="faq" />

      <section className="max-w-4xl mx-auto pt-40 pb-32 px-6 flex-1 w-full">

        <div className="text-center mb-20">
          <p className="font-mono text-[8px] tracking-[0.4em] uppercase text-[#b3cdff] mb-6">Information</p>
          <h1 className="font-display leading-none uppercase" style={{ fontSize: "clamp(48px, 7vw, 96px)" }}>
            Common Questions.
          </h1>
        </div>

        <div className="border-t border-[#242424]">
          {faqs.map((item) => (
            <div key={item.q} className="py-8 border-b border-[#242424]">
              <h3 className="font-mono text-[10px] tracking-[0.25em] uppercase text-white mb-4">
                {item.q}
              </h3>
              <p className="font-mono text-[10px] text-gray-400 leading-loose tracking-[0.1em]">{item.a}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-24">
          <a
            href="/system"
            className="inline-flex items-center gap-2 font-mono text-[9px] tracking-widest uppercase bg-[#b3cdff] text-[#0f0f0f] px-10 py-4 rounded-full font-bold hover:bg-white transition-colors"
          >
            Ready to start? Join Now
          </a>
        </div>

      </section>

      <Footer />

    </main>
  );
}
