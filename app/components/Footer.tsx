import Link from "next/link";

const ZanaLogo = ({ className = "h-4" }: { className?: string }) => (
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
    <footer className="bg-[var(--c-sidebar)] border-t border-[var(--c-border)] px-6 md:px-12 py-10">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Left: logo + page links */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          <ZanaLogo className="h-4 text-[var(--c-text4)]" />
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { href: "/about",   label: "About"      },
              { href: "/system",  label: "The System" },
              { href: "/terms",   label: "Terms"      },
              { href: "/privacy", label: "Privacy"    },
            ].map(l => (
              <Link key={l.href} href={l.href} className="text-xs text-[var(--c-text4)] hover:text-[var(--c-text)] transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right: social links */}
        <div className="flex items-center gap-6">
          {[
            { href: "https://www.instagram.com/javi_zana/", label: "Instagram" },
            { href: "https://www.tiktok.com/@javi_zana",    label: "TikTok"    },
          ].map(l => (
            <Link key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--c-text4)] hover:text-[var(--c-text)] transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

      </div>
      <p className="max-w-5xl mx-auto mt-6 text-xs text-[var(--c-text5)]">© 2025 ZANA Fitness</p>
    </footer>
  );
}
