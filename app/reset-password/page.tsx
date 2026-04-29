"use client";

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

const ZanaLogo = ({ className = "h-5" }: { className?: string }) => (
  <svg viewBox="0 0 180 32" className={className} fill="none" stroke="currentColor" strokeWidth="5" strokeMiterlimit="10">
    <path d="M0,2 H32 L18.3,14" />
    <path d="M13.7,18 L0,30 H32" />
    <path d="M48,30 L64,2 L80,30" />
    <path d="M96,30 V2 L128,30 V2" />
    <path d="M144,30 L160,2 L176,30" />
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
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
      else {
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
    <main className="min-h-screen bg-[#0f1a0c] text-[#edf5e2] flex flex-col">

      <nav className="flex items-center justify-between px-8 py-5 border-b border-[#b0e455]/8">
        <Link href="/" className="text-[#edf5e2]"><ZanaLogo className="h-5 text-[#edf5e2]" /></Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 bg-[#b0e455]/10 border border-[#b0e455]/20 rounded-full px-4 py-1.5 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b0e455]" />
              <p className="text-xs font-medium text-[#b0e455]">Account Setup</p>
            </span>
            <h1 className="font-display leading-none mb-3" style={{ fontSize: "clamp(32px, 5vw, 48px)" }}>
              Set your<br />password.
            </h1>
            <p className="text-sm text-[#edf5e2]/45">Choose a password for your account</p>
          </div>

          {!ready ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-[#b0e455]/30 border-t-[#b0e455] rounded-full animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-3">
              <input
                type="password"
                placeholder="New password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#162212] border border-[#b0e455]/15 rounded-2xl px-4 py-4 text-sm text-[#edf5e2] placeholder-[#edf5e2]/30 focus:outline-none focus:border-[#b0e455]/40 transition-colors"
              />
              <input
                type="password"
                placeholder="Confirm password"
                required
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="w-full bg-[#162212] border border-[#b0e455]/15 rounded-2xl px-4 py-4 text-sm text-[#edf5e2] placeholder-[#edf5e2]/30 focus:outline-none focus:border-[#b0e455]/40 transition-colors"
              />
              {error && (
                <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3">
                  <p className="text-sm text-red-400 text-center">{error}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#b0e455] text-[#0f1a0c] font-semibold text-sm py-4 rounded-2xl hover:bg-[#c9f070] transition-colors disabled:opacity-40"
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
