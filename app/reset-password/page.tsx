"use client";

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

const ZIcon = () => (
  <svg viewBox="0 0 32 32" className="h-6" fill="none" stroke="currentColor" strokeWidth="5" strokeMiterlimit="10">
    <path d="M0,2 H32 L18.3,14" />
    <path d="M13.7,18 L0,30 H32" />
  </svg>
);

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase puts the session in the URL hash after the reset link is clicked.
    // Just detecting that we're on this page with a valid session is enough.
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
      else {
        // No session yet — wait for the hash exchange
        const { data: listener } = supabase.auth.onAuthStateChange((event) => {
          if (event === 'PASSWORD_RECOVERY') setReady(true);
        });
        return () => listener.subscription.unsubscribe();
      }
    });
  }, []);

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { setError(error.message); }
    else { router.push('/dashboard'); router.refresh(); }
  };

  return (
    <main className="min-h-screen bg-[#141414] text-white flex flex-col">

      <nav className="flex items-center justify-between px-8 py-6 border-b border-[#2d3a4b]">
        <Link href="/" className="text-white"><ZIcon /></Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <p className="font-mono text-[9px] tracking-[0.3em] text-[#b3cdff] uppercase mb-3">Account Setup</p>
            <h1 className="text-2xl font-light tracking-[0.15em] uppercase text-white mb-2">Set your password.</h1>
            <p className="font-mono text-[9px] tracking-widest text-gray-500 uppercase">Choose a password for your account</p>
          </div>

          {!ready ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-[#b3cdff]/30 border-t-[#b3cdff] rounded-full animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <input
                type="password"
                placeholder="New password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#121821] border border-[#2d3a4b] rounded px-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#b3cdff]/50 transition-colors font-mono text-sm tracking-wide"
              />
              <input
                type="password"
                placeholder="Confirm password"
                required
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="w-full bg-[#121821] border border-[#2d3a4b] rounded px-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#b3cdff]/50 transition-colors font-mono text-sm tracking-wide"
              />
              {error && (
                <div className="bg-[#f87171]/10 border border-[#f87171]/30 rounded px-4 py-3">
                  <p className="font-mono text-[9px] text-[#f87171] tracking-wider text-center">{error}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#b3cdff] text-[#141414] font-mono text-[9px] font-bold tracking-[0.3em] uppercase py-4 rounded hover:bg-white transition-colors disabled:opacity-40"
              >
                {loading ? 'Saving...' : 'Set Password & Sign In'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
