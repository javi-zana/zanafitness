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

const faqs = [
  {
    q: "Is there a required commitment?",
    a: "Yes. Progress requires time. We offer 3-month, 6-month, and 12-month access. We do not offer month-to-month subscriptions because true physiological changes cannot be forced into a 30-day window.",
  },
  {
    q: "What happens after I join?",
    a: "You will complete a comprehensive biological onboarding. Based on your metrics, you will be assigned strict, daily macro targets and a non-negotiable progressive overload training block.",
  },
  {
    q: "Are diet blocks included?",
    a: "Everything is included. Nutrition, weight training, and cardiovascular metrics are mathematically synchronized to ensure you reach the desired outcome. You do not purchase add-ons.",
  },
  {
    q: "Do I need equipment?",
    a: "Yes. The system is designed around standard commercial gym equipment including barbells, dumbbells, cables, and generic machines.",
  },
  {
    q: "What is the refund policy?",
    a: "We offer a 7-day satisfaction guarantee on your first payment. After 7 days, all sales are final. See our full refund policy for details.",
  },
  {
    q: "Can I pause my subscription?",
    a: "Subscriptions cannot be paused. If you need to cancel, you retain access until the end of your current billing period.",
  },
];

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-[#121821] text-white font-sans flex flex-col">

      <Navbar active="faq" />

      {/* CONTENT */}
      <section className="max-w-4xl mx-auto pt-40 pb-32 px-6 flex-1 w-full">

        <div className="text-center mb-24">
          <p className="font-mono text-[10px] tracking-widest text-[#b3cdff] uppercase mb-6">Information</p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter uppercase leading-[0.85] text-white">
            Direct Answers.
          </h1>
        </div>

        <div className="border-t border-[#2d3a4b]">
          {faqs.map((item) => (
            <div key={item.q} className="py-8 border-b border-[#2d3a4b]">
              <h3 className="font-bold tracking-widest uppercase text-xs md:text-sm mb-4 text-white">
                {item.q}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed font-light">{item.a}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-32">
          <a
            href="/system"
            className="inline-block bg-white text-black font-bold px-10 py-4 rounded-full text-[10px] uppercase tracking-widest hover:bg-[#b3cdff] transition-colors"
          >
            Ready to start? Join Now
          </a>
        </div>

      </section>

      <Footer />

    </main>
  );
}
