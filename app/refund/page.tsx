import Link from "next/link";
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

const ZIcon = ({ className = "h-8" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" stroke="currentColor" strokeWidth="5" strokeMiterlimit="10">
    <path d="M0,2 H32 L18.3,14" />
    <path d="M13.7,18 L0,30 H32" />
  </svg>
);

export default function RefundPage() {
  return (
    <main className="min-h-screen bg-[#121821] text-white font-sans">

      {/* NAVBAR */}
      <nav className="flex items-center justify-between p-8 md:px-16 border-b border-[#2d3a4b]">
        <Link href="/"><ZIcon className="h-5 md:h-6 text-white" /></Link>
        <Link href="/" className="font-mono text-[9px] uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
          &larr; Back
        </Link>
      </nav>

      {/* CONTENT */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto">

          <p className="font-mono text-[9px] uppercase tracking-widest text-[#b3cdff] mb-6">Legal</p>
          <h1 className="text-2xl md:text-3xl font-light tracking-[0.1em] uppercase mb-4">Refund Policy</h1>
          <p className="font-mono text-[9px] uppercase tracking-widest text-gray-500 mb-16">Last updated: April 2025</p>

          <div className="space-y-12 font-mono text-[11px] leading-loose text-gray-400 tracking-wide">

            <div>
              <h2 className="text-white text-xs uppercase tracking-widest font-bold mb-4">1. Our Commitment</h2>
              <p>At ZANA Fitness, we build systems designed to produce results. We stand behind the quality of our coaching, programming, and platform. This policy outlines the circumstances under which refunds may be issued.</p>
            </div>

            <div>
              <h2 className="text-white text-xs uppercase tracking-widest font-bold mb-4">2. General Policy</h2>
              <p>Due to the nature of digital coaching services and the immediate access granted upon subscription, all sales are generally final. We do not offer refunds for change of mind, lack of use, or failure to follow the program.</p>
            </div>

            <div>
              <h2 className="text-white text-xs uppercase tracking-widest font-bold mb-4">3. 7-Day Satisfaction Guarantee</h2>
              <p>If you are unsatisfied with the Service within the first 7 days of your initial subscription, you may request a full refund of your first payment. To qualify:</p>
              <ul className="mt-4 space-y-2 pl-4 border-l border-[#2d3a4b]">
                <li>The request must be submitted within 7 days of your first charge</li>
                <li>This applies to first-time subscribers only</li>
                <li>Refund requests after 7 days will not be considered</li>
              </ul>
            </div>

            <div>
              <h2 className="text-white text-xs uppercase tracking-widest font-bold mb-4">4. Committed Plans</h2>
              <p>Subscribers on a 4-month or 12-month commitment plan are billed monthly. Cancellation stops future charges but does not entitle the subscriber to a refund of any months already billed. Access continues until the end of the current billing period.</p>
            </div>

            <div>
              <h2 className="text-white text-xs uppercase tracking-widest font-bold mb-4">5. Technical Issues</h2>
              <p>If you experience a verified technical issue that prevents access to the Service and we are unable to resolve it within 72 hours, you may be eligible for a prorated refund for the affected period. Contact us immediately if this occurs.</p>
            </div>

            <div>
              <h2 className="text-white text-xs uppercase tracking-widest font-bold mb-4">6. Duplicate Charges</h2>
              <p>If you were charged more than once for the same billing period due to a system error, we will refund the duplicate charge in full within 5 business days of verification.</p>
            </div>

            <div>
              <h2 className="text-white text-xs uppercase tracking-widest font-bold mb-4">7. How to Request a Refund</h2>
              <p>To submit a refund request, email us at <span className="text-[#b3cdff]">hello@zanafitness.com</span> with the subject line "Refund Request" and include:</p>
              <ul className="mt-4 space-y-2 pl-4 border-l border-[#2d3a4b]">
                <li>Your account email address</li>
                <li>Date of charge</li>
                <li>Reason for your request</li>
              </ul>
              <p className="mt-4">We will respond within 2 business days.</p>
            </div>

            <div>
              <h2 className="text-white text-xs uppercase tracking-widest font-bold mb-4">8. Processing Time</h2>
              <p>Approved refunds are processed through Paddle and typically appear on your statement within 5–10 business days depending on your bank or card provider.</p>
            </div>

            <div>
              <h2 className="text-white text-xs uppercase tracking-widest font-bold mb-4">9. Contact</h2>
              <p>For any questions about this policy, reach us at <span className="text-[#b3cdff]">hello@zanafitness.com</span></p>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
