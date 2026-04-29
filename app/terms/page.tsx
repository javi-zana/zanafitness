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

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#1a1a1a] text-white font-sans">

      {/* NAVBAR */}
      <nav className="flex items-center justify-between p-8 md:px-16 border-b border-[#2e2e2e]">
        <Link href="/"><ZIcon className="h-5 md:h-6 text-white" /></Link>
        <Link href="/" className="font-mono text-[9px] uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
          &larr; Back
        </Link>
      </nav>

      {/* CONTENT */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto">

          <p className="font-mono text-[9px] uppercase tracking-widest text-[#b3cdff] mb-6">Legal</p>
          <h1 className="text-2xl md:text-3xl font-light tracking-[0.1em] uppercase mb-4">Terms of Service</h1>
          <p className="font-mono text-[9px] uppercase tracking-widest text-gray-500 mb-16">Last updated: April 2025</p>

          <div className="space-y-12 font-mono text-[11px] leading-loose text-gray-400 tracking-wide">

            <div>
              <h2 className="text-white text-xs uppercase tracking-widest font-bold mb-4">1. Agreement</h2>
              <p>By accessing or using ZANA Fitness ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. ZANA Fitness is operated by ZANA ("we", "us", "our").</p>
            </div>

            <div>
              <h2 className="text-white text-xs uppercase tracking-widest font-bold mb-4">2. The Service</h2>
              <p>ZANA Fitness provides a premium online fitness coaching system including personalised training programs, nutrition guidance, and daily coaching delivered through our web platform. The Service is intended for adults aged 18 and over.</p>
            </div>

            <div>
              <h2 className="text-white text-xs uppercase tracking-widest font-bold mb-4">3. Subscriptions</h2>
              <p>Access to the ZANA system requires a paid subscription. We offer the following plans:</p>
              <ul className="mt-4 space-y-2 list-none pl-4 border-l border-[#2e2e2e]">
                <li>Entry — $500/month, 3-month commitment</li>
                <li>Committed — $400/month, 6-month commitment</li>
                <li>All In — $300/month, 12-month commitment</li>
              </ul>
              <p className="mt-4">Subscriptions are billed monthly through Paddle. By subscribing, you authorise recurring charges until you cancel.</p>
            </div>

            <div>
              <h2 className="text-white text-xs uppercase tracking-widest font-bold mb-4">4. Cancellation</h2>
              <p>You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. You will retain access to the Service until that date. Early cancellation within a committed term does not entitle you to a refund of remaining months.</p>
            </div>

            <div>
              <h2 className="text-white text-xs uppercase tracking-widest font-bold mb-4">5. User Responsibilities</h2>
              <p>You are responsible for maintaining the confidentiality of your account credentials. You agree not to share, resell, or redistribute any content from the Service. You acknowledge that results vary based on individual effort and adherence to the program.</p>
            </div>

            <div>
              <h2 className="text-white text-xs uppercase tracking-widest font-bold mb-4">6. Health Disclaimer</h2>
              <p>ZANA Fitness provides general fitness and nutrition guidance. It is not a substitute for professional medical advice. Consult a qualified healthcare provider before beginning any fitness or nutrition program. You participate at your own risk.</p>
            </div>

            <div>
              <h2 className="text-white text-xs uppercase tracking-widest font-bold mb-4">7. Intellectual Property</h2>
              <p>All content within the ZANA platform — including programs, copy, design, and guidance — is the property of ZANA Fitness. Unauthorised reproduction or distribution is prohibited.</p>
            </div>

            <div>
              <h2 className="text-white text-xs uppercase tracking-widest font-bold mb-4">8. Limitation of Liability</h2>
              <p>To the fullest extent permitted by law, ZANA Fitness shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.</p>
            </div>

            <div>
              <h2 className="text-white text-xs uppercase tracking-widest font-bold mb-4">9. Changes to Terms</h2>
              <p>We reserve the right to update these Terms at any time. Continued use of the Service after changes constitutes acceptance of the new Terms.</p>
            </div>

            <div>
              <h2 className="text-white text-xs uppercase tracking-widest font-bold mb-4">10. Contact</h2>
              <p>For questions regarding these Terms, contact us at <span className="text-[#b3cdff]">hello@zanafitness.com</span></p>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
