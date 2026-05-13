import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Writing | ZANA Fitness",
  description:
    "Articles from Javi on body recomposition, training, nutrition, and the system behind ZANA.",
};

const ZanaLogo = ({ className = "h-8" }: { className?: string }) => (
  <svg viewBox="0 0 180 32" className={className} fill="none" stroke="currentColor" strokeWidth="5" strokeMiterlimit="10">
    <path d="M0,2 H32 L18.3,14" />
    <path d="M13.7,18 L0,30 H32" />
    <path d="M48,30 L64,2 L80,30" />
    <path d="M96,30 V2 L128,30 V2" />
    <path d="M144,30 L160,2 L176,30" />
  </svg>
);

// Add new posts to the top of this array. Each post is its own page under
// app/<slug>/page.tsx — clone app/protocol/page.tsx as the template.
type Post = {
  slug: string;
  href: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  heroSrc: string;
  heroAlt: string;
  heroWidth: number;
  heroHeight: number;
};

const posts: Post[] = [
  {
    slug: "protocol",
    href: "/protocol",
    title: "The Skinny Fat Protocol",
    excerpt:
      "The system that worked for me. How I went from skinny fat to an eight pack in six months — and why the body was just the gateway.",
    date: "May 2026",
    readTime: "6 min read",
    heroSrc: "/protocol/before.jpg",
    heroAlt: "Javi in 2022, peak skinny fat era",
    heroWidth: 1600,
    heroHeight: 1200,
  },
];

export default function PublicPage() {
  return (
    <main className="min-h-screen bg-white text-[#1f2937] font-sans selection:bg-[#b0e455] selection:text-[#0f1a0c]">

      {/* ── NAV ───────────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-10 flex items-center justify-between px-6 md:px-8 py-4 bg-white/85 backdrop-blur border-b border-[#1f2937]/8">
        <Link href="/" className="text-[#1f2937]/60 hover:text-[#0a0a0a] transition-colors">
          <ZanaLogo className="h-4" />
        </Link>
        <Link
          href="/apply"
          className="text-xs font-semibold tracking-wide text-[#4d7c0f] hover:text-[#365314] transition-colors"
        >
          Apply →
        </Link>
      </nav>

      {/* ── HEADER ────────────────────────────────────────────────────────────── */}
      <header className="max-w-2xl mx-auto px-6 pt-20 pb-12 md:pt-28 md:pb-16 border-b border-[#1f2937]/8">
        <div className="flex items-center gap-2 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#65a30d]" />
          <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#1f2937]/55">
            From Javi
          </p>
        </div>

        <h1
          className="font-display leading-[1.04] text-[#0a0a0a] mb-6"
          style={{ fontSize: "clamp(44px, 7vw, 80px)" }}
        >
          Writing.
        </h1>

        <p className="text-[#1f2937]/65 text-lg md:text-xl leading-relaxed">
          Direct, honest, no-bullshit takes on training, nutrition, and what actually works.
        </p>
      </header>

      {/* ── POSTS ─────────────────────────────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-6 py-16 md:py-20">
        <ul className="divide-y divide-[#1f2937]/8">
          {posts.map((post) => (
            <li key={post.slug} className="first:pt-0 pt-12 md:pt-16 pb-12 md:pb-16 last:pb-0">
              <Link href={post.href} className="group block">
                <div className="overflow-hidden rounded-2xl bg-[#1f2937]/5 mb-6 md:mb-8">
                  <Image
                    src={post.heroSrc}
                    alt={post.heroAlt}
                    width={post.heroWidth}
                    height={post.heroHeight}
                    sizes="(min-width: 768px) 672px, 100vw"
                    className="w-full h-auto group-hover:opacity-95 transition-opacity"
                  />
                </div>

                <div className="flex items-center gap-3 text-[12px] text-[#1f2937]/50 mb-4">
                  <span className="font-semibold tracking-wide">{post.date}</span>
                  <span className="w-1 h-1 rounded-full bg-[#1f2937]/25" />
                  <span>{post.readTime}</span>
                </div>

                <h2
                  className="font-display leading-[1.1] text-[#0a0a0a] group-hover:text-[#4d7c0f] transition-colors mb-4"
                  style={{ fontSize: "clamp(28px, 4vw, 40px)" }}
                >
                  {post.title}
                </h2>

                <p className="text-[#1f2937]/70 text-[17px] md:text-[18px] leading-[1.75] mb-5">
                  {post.excerpt}
                </p>

                <span className="inline-flex items-center gap-1.5 text-[#4d7c0f] font-semibold text-sm group-hover:text-[#365314] transition-colors">
                  Read article <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {posts.length === 1 && (
          <p className="text-center text-[12px] text-[#1f2937]/40 italic tracking-wide mt-12">
            More coming.
          </p>
        )}
      </section>

      {/* ── SIGNATURE ─────────────────────────────────────────────────────────── */}
      <footer className="max-w-2xl mx-auto px-6 pb-20">
        <div className="pt-10 border-t border-[#1f2937]/10 flex items-center gap-4">
          <ZanaLogo className="h-4 text-[#1f2937]/35" />
          <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#1f2937]/40">
            Javi · @javi_zana
          </span>
        </div>
      </footer>

    </main>
  );
}
