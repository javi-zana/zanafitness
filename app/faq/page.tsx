import Link from "next/link";

const ZIcon = ({ className = "h-8" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" stroke="currentColor" strokeWidth="5" strokeMiterlimit="10">
    <path d="M0,2 H32 L18.3,14" />
    <path d="M13.7,18 L0,30 H32" />
  </svg>
);

const faqs = [
  {
    q: "Is there a required commitment?",
    a: "Yes. Progress requires time. We offer 4-month and 12-month access. We do not offer month-to-month subscriptions because true physiological changes cannot be forced into a 30-day window.",
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
    <main className="min-h-screen bg-[#06080a] text-white font-sans flex flex-col">

      {/* NAVBAR */}
      <nav className="flex items-center justify-between p-8 md:px-16 border-b border-[#1a1f26]">
        <Link href="/" className="hover:opacity-70 transition-opacity">
          <ZIcon className="h-5 md:h-6 text-white" />
        </Link>
        <div className="hidden md:flex items-center space-x-12 text-[10px] tracking-[0.2em] uppercase font-semibold text-gray-300">
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <Link href="/system" className="hover:text-white transition-colors">The System</Link>
          <Link href="/faq" className="text-white">FAQ</Link>
          <Link href="/system" className="bg-[#b3cdff] text-[#06080a] font-bold px-8 py-2.5 rounded-full hover:bg-white transition-colors">
            Join the System
          </Link>
        </div>
      </nav>

      {/* CONTENT */}
      <section className="max-w-4xl mx-auto py-32 px-6 flex-1 w-full relative">

        <div className="text-center mb-24">
          <p className="font-mono text-[10px] tracking-widest text-[#b3cdff] uppercase mb-6">Information</p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter uppercase leading-[0.85] text-white">
            Direct Answers.
          </h1>
        </div>

        <div className="border-t border-[#1a1f26]">
          {faqs.map((item) => (
            <div key={item.q} className="py-8 border-b border-[#1a1f26]">
              <h3 className="font-bold tracking-widest uppercase text-xs md:text-sm mb-4 text-white">
                {item.q}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed font-light">{item.a}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-32">
          <Link
            href="/system"
            className="inline-block bg-white text-black font-bold px-10 py-4 rounded-full text-[10px] uppercase tracking-widest hover:bg-[#b3cdff] transition-colors"
          >
            Ready to start? Join Now
          </Link>
        </div>

      </section>

    </main>
  );
}
