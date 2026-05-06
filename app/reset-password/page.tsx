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
  const [status, setStatus] = useState<'loading' | 'ready' | 'expired'>('loading');

  useEffect(() => {
    const supabase = createClient();

    const timer = setTimeout(() => setStatus('expired'), 8000);

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        clearTimeout(timer);
        setStatus('ready');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        clearTimeout(timer);
        setStatus('ready');
      }
    });

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) { setError(updateError.message); }
    else { router.push('/dashboard'); router.refresh(); }
  };

  return (
    <main className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] flex flex-col">

      <nav className="flex items-center justify-between px-8 py-5 border-b border-[var(--c-border)]">
        <Link href="/" className="text-[var(--c-text)]"><ZanaLogo className="h-5" /></Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 bg-[var(--c-accent-text)]/8 border border-[var(--c-border2)] rounded-full px-4 py-1.5 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--c-accent-text)]" />
              <p className="text-xs font-medium text-[var(--c-accent-text)]">Account Setup</p>
            </span>
            <h1 className="font-display leading-none mb-3" style={{ fontSize: "clamp(32px, 5vw, 48px)" }}>
              Set your<br />password.
            </h1>
            <p className="text-sm text-[var(--c-text3)]">Choose a password for your account</p>
          </div>

          {status === 'loading' && (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-[var(--c-border2)] border-t-[var(--c-accent-text)] rounded-full animate-spin" />
            </div>
          )}

          {status === 'expired' && (
            <div className="text-center space-y-5">
              <div className="bg-red-500/8 border border-red-500/20 rounded-2xl px-5 py-5">
                <p className="text-sm text-red-400 leading-relaxed">
                  This link has expired or is invalid.<br />
                  Please request a new one.
                </p>
              </div>
              <Link
                href="/login"
                className="block w-full bg-[#b0e455] text-[#0f1a0c] font-semibold text-sm py-4 rounded-2xl hover:bg-[#c9f070] transition-colors text-center"
              >
                Back to Login
              </Link>
            </div>
          )}

          {status === 'ready' && (
            <form onSubmit={handleReset} className="space-y-3">
              <input
                type="password"
                placeholder="New password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[var(--c-card)] border border-[var(--c-border2)] rounded-2xl px-4 py-4 text-sm text-[var(--c-text)] placeholder-[var(--c-text4)] focus:outline-none focus:border-[#b0e455]/40 transition-colors"
              />
              <input
                type="password"
                placeholder="Confirm password"
                required
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="w-full bg-[var(--c-card)] border border-[var(--c-border2)] rounded-2xl px-4 py-4 text-sm text-[var(--c-text)] placeholder-[var(--c-text4)] focus:outline-none focus:border-[#b0e455]/40 transition-colors"
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
