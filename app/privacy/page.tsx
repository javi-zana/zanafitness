import Link from "next/link";

const ZIcon = ({ className = "h-8" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" stroke="currentColor" strokeWidth="5" strokeMiterlimit="10">
    <path d="M0,2 H32 L18.3,14" />
    <path d="M13.7,18 L0,30 H32" />
  </svg>
);

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#06080a] text-white font-sans">

      {/* NAVBAR */}
      <nav className="flex items-center justify-between p-8 md:px-16 border-b border-[#1a1f26]">
        <Link href="/"><ZIcon className="h-5 md:h-6 text-white" /></Link>
        <Link href="/" className="font-mono text-[9px] uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
          &larr; Back
        </Link>
      </nav>

      {/* CONTENT */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto">

          <p className="font-mono text-[9px] uppercase tracking-widest text-[#b3cdff] mb-6">Legal</p>
          <h1 className="text-2xl md:text-3xl font-light tracking-[0.1em] uppercase mb-4">Privacy Policy</h1>
          <p className="font-mono text-[9px] uppercase tracking-widest text-gray-500 mb-16">Last updated: April 2025</p>

          <div className="space-y-12 font-mono text-[11px] leading-loose text-gray-400 tracking-wide">

            <div>
              <h2 className="text-white text-xs uppercase tracking-widest font-bold mb-4">1. Introduction</h2>
              <p>ZANA Fitness ("we", "us", "our") is committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, and your rights regarding that data.</p>
            </div>

            <div>
              <h2 className="text-white text-xs uppercase tracking-widest font-bold mb-4">2. Data We Collect</h2>
              <p>We collect the following information when you use our Service:</p>
              <ul className="mt-4 space-y-2 pl-4 border-l border-[#1a1f26]">
                <li>Email address (for account creation and communication)</li>
                <li>Fitness goals and preferences (provided during onboarding)</li>
                <li>Progress data (weight, strength metrics, consistency)</li>
                <li>Payment information (processed securely by Paddle — we never store card details)</li>
                <li>Usage data (pages visited, features used)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-white text-xs uppercase tracking-widest font-bold mb-4">3. How We Use Your Data</h2>
              <p>Your data is used to:</p>
              <ul className="mt-4 space-y-2 pl-4 border-l border-[#1a1f26]">
                <li>Provide and personalise the ZANA fitness system</li>
                <li>Process payments and manage your subscription</li>
                <li>Send coaching guidance and program updates</li>
                <li>Improve the Service based on usage patterns</li>
                <li>Communicate important account and service updates</li>
              </ul>
            </div>

            <div>
              <h2 className="text-white text-xs uppercase tracking-widest font-bold mb-4">4. Third-Party Services</h2>
              <p>We use the following trusted third-party services to operate the platform:</p>
              <ul className="mt-4 space-y-2 pl-4 border-l border-[#1a1f26]">
                <li>Supabase — secure database and authentication</li>
                <li>Paddle — payment processing and subscription management</li>
                <li>Resend — transactional email delivery</li>
              </ul>
              <p className="mt-4">Each of these providers operates under their own privacy policies and data protection standards.</p>
            </div>

            <div>
              <h2 className="text-white text-xs uppercase tracking-widest font-bold mb-4">5. Data Storage & Security</h2>
              <p>Your data is stored securely using Supabase infrastructure. We implement industry-standard security measures to protect your information from unauthorised access, disclosure, or loss.</p>
            </div>

            <div>
              <h2 className="text-white text-xs uppercase tracking-widest font-bold mb-4">6. Data Retention</h2>
              <p>We retain your personal data for as long as your account is active. Upon account deletion, your data is removed within 30 days, except where retention is required by law.</p>
            </div>

            <div>
              <h2 className="text-white text-xs uppercase tracking-widest font-bold mb-4">7. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="mt-4 space-y-2 pl-4 border-l border-[#1a1f26]">
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your account and data</li>
                <li>Opt out of marketing communications at any time</li>
              </ul>
              <p className="mt-4">To exercise any of these rights, contact us at <span className="text-[#b3cdff]">hello@zanafitness.com</span></p>
            </div>

            <div>
              <h2 className="text-white text-xs uppercase tracking-widest font-bold mb-4">8. Cookies</h2>
              <p>We use essential cookies to manage authentication sessions. We do not use tracking or advertising cookies. You can control cookie settings through your browser.</p>
            </div>

            <div>
              <h2 className="text-white text-xs uppercase tracking-widest font-bold mb-4">9. Changes to This Policy</h2>
              <p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email. Continued use of the Service after changes constitutes acceptance.</p>
            </div>

            <div>
              <h2 className="text-white text-xs uppercase tracking-widest font-bold mb-4">10. Contact</h2>
              <p>For privacy-related questions or requests, contact us at <span className="text-[#b3cdff]">hello@zanafitness.com</span></p>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-8 md:px-16 border-t border-[#1a1f26] flex justify-between items-center font-mono text-[9px] uppercase tracking-widest text-gray-600 mt-16">
        <p>&copy; 2025 Zana Fitness</p>
        <div className="flex gap-8">
          <Link href="/terms" className="hover:text-[#b3cdff] transition-colors">Terms</Link>
          <Link href="/refund" className="hover:text-[#b3cdff] transition-colors">Refunds</Link>
        </div>
      </footer>
    </main>
  );
}
