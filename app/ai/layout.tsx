import type { Metadata } from 'next'

// Standalone internal tool — deliberately its OWN look, not the member app's.
// Dark utilitarian "ops console" aesthetic, fixed (ignores the member theme toggle).
export const metadata: Metadata = {
  title: 'ZANA · internal',
  robots: { index: false, follow: false },
}

export default function AiLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
      {children}
    </div>
  )
}
