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
    <main className="min-h-screen bg-[#0f1a0c] text-[#edf5e2] flex flex-col">

      <Navbar active="faq" />

      <section className="max-w-3xl mx-auto pt-36 pb-28 px-6 flex-1 w-full">

        <div className="mb-16">
          <p className="text-xs font-semibold tracking-wider uppercase text-[#b0e455] mb-5">Questions</p>
          <h1 className="font-display leading-none" style={{ fontSize: "clamp(48px, 7vw, 88px)" }}>
            Common<br />Questions.
          </h1>
        </div>

        <div className="divide-y divide-[#b0e455]/8">
          {faqs.map((item) => (
            <div key={item.q} className="py-8">
              <h3 className="text-base font-semibold text-[#edf5e2] mb-3">
                {item.q}
              </h3>
              <p className="text-sm text-[#edf5e2]/55 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <a
            href="/system"
            className="inline-flex items-center gap-2 bg-[#b0e455] text-[#0f1a0c] px-8 py-4 rounded-2xl font-semibold text-sm hover:bg-[#c9f070] transition-colors"
          >
            Ready to start? Join Now
          </a>
          <a href="/demo" className="text-sm font-medium text-[#b0e455] hover:text-[#c9f070] transition-colors">
            Preview the app first →
          </a>
        </div>

      </section>

      <Footer />

    </main>
  );
}
