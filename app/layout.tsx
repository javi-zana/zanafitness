import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

export const metadata: Metadata = {
  title: "ZANA Fitness | Built for results",
  description: "A premium system designed to make progress inevitable.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ZANA",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* FOUC prevention: apply dark class before React hydrates */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('zana-theme');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();` }} />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#111111" media="(prefers-color-scheme: dark)" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className={`${inter.variable} font-sans min-h-screen antialiased bg-[var(--c-bg)] text-[var(--c-text)]`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
