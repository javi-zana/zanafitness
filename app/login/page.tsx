"use client";

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

const ZIcon = () => (
  <svg viewBox="0 0 32 32" className="h-6" fill="none" stroke="currentColor" strokeWidth="5" strokeMiterlimit="10">
    <path d="M0,2 H32 L18.3,14" />
    <path d="M13.7,18 L0,30 H32" />
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <main className="min-h-screen bg-[#0f141b] text-white flex flex-col">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-[#2d3a4b]">
        <Link href="/" className="text-white">
          <ZIcon />
        </Link>
        <Link href="/" className="font-mono text-[9px] uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
          &larr; Back
        </Link>
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">

          {/* Header */}
          <div className="text-center mb-10">
            <p className="font-mono text-[9px] tracking-[0.3em] text-[#b3cdff] uppercase mb-3">Member Access</p>
            <h1 className="text-2xl font-light tracking-[0.15em] uppercase text-white mb-2">
              Welcome back.
            </h1>
            <p className="font-mono text-[9px] tracking-widest text-gray-500 uppercase">
              Enter your email to receive a login link
            </p>
          </div>

          {sent ? (
            <div className="bg-[#121821] border border-[#2d3a4b] rounded p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full border-2 border-[#b3cdff] flex items-center justify-center mx-auto mb-2">
                <svg viewBox="0 0 16 16" className="w-5 h-5 text-[#b3cdff]" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 8l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="font-mono text-[9px] tracking-widest text-[#b3cdff] uppercase">Check your inbox</p>
              <p className="text-sm text-gray-300 leading-relaxed">
                We sent a login link to<br />
                <span className="text-white font-medium">{email}</span>
              </p>
              <p className="font-mono text-[9px] text-gray-500 uppercase tracking-wider">
                Click the link to access your dashboard.
              </p>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#121821] border border-[#2d3a4b] rounded px-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#b3cdff]/50 transition-colors font-mono text-sm tracking-wide"
              />

              {error && (
                <p className="font-mono text-[9px] text-red-400 tracking-wider text-center uppercase">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#b3cdff] text-[#0f141b] font-mono text-[9px] font-bold tracking-[0.3em] uppercase py-4 rounded hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Login Link'}
              </button>

              <p className="text-center font-mono text-[8px] text-gray-600 tracking-wider uppercase">
                Not a member?{' '}
                <Link href="/system" className="text-[#b3cdff] hover:text-white transition-colors">
                  View plans
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>

    </main>
  );
}
