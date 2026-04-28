const ZanaLogo = ({ className = "h-8" }: { className?: string }) => (
  <svg viewBox="0 0 180 32" className={className} fill="none" stroke="currentColor" strokeWidth="5" strokeMiterlimit="10">
    <path d="M0,2 H32 L18.3,14" />
    <path d="M13.7,18 L0,30 H32" />
    <path d="M48,30 L64,2 L80,30" />
    <path d="M96,30 V2 L128,30 V2" />
    <path d="M144,30 L160,2 L176,30" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="py-12 px-8 md:px-24 bg-[#0f141b] border-t border-[#2d3a4b] font-mono text-[9px] uppercase tracking-[0.2em] text-gray-500">
      <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
        <ZanaLogo className="h-4 md:h-5 text-white" />
        <p>&copy; 2026 Zana Fitness</p>
        <div className="flex gap-6">
          <a href="https://www.instagram.com/javi_zana/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
          <a href="https://www.tiktok.com/@javi_zana?lang=en" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">TikTok</a>
        </div>
      </div>
    </footer>
  );
}
