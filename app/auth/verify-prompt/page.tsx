"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

function VerifyPrompt() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tokenHash = searchParams.get('token_hash');
  const type = (searchParams.get('type') ?? 'recovery') as
    | 'invite' | 'recovery' | 'signup' | 'magiclink' | 'email';
  const next = searchParams.get('next') ?? '/reset-password';
  const isInvite = type === 'invite';

  const handleVerify = async () => {
    if (!tokenHash) { setError('Invalid link. Please request a new one.'); return; }
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (verifyError) {
      setError('This link has expired or is invalid. Please request a new one.');
      setLoading(false);
      return;
    }
    router.replace(next);
  };

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-2 bg-[var(--c-accent-text)]/8 border border-[var(--c-border2)] rounded-full px-4 py-1.5 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--c-accent-text)]" />
          <p className="text-xs font-medium text-[var(--c-accent-text)]">
            {isInvite ? 'Account Setup' : 'Password Reset'}
          </p>
        </span>
        <h1 className="font-display leading-none mb-3" style={{ fontSize: 'clamp(32px, 5vw, 48px)' }}>
          {isInvite ? <>Welcome to<br />Zana.</> : <>Reset your<br />password.</>}
        </h1>
        <p className="text-sm text-[var(--c-text3)] leading-relaxed">
          {isInvite
            ? 'Your account is ready. Click below to set up your password.'
            : 'Click below to continue to password reset.'}
        </p>
      </div>

      {!tokenHash || error ? (
        <div className="space-y-4">
          <div className="bg-red-500/8 border border-red-500/20 rounded-2xl px-5 py-5 text-center">
            <p className="text-sm text-red-400 leading-relaxed">
              {error || 'Invalid link. Please request a new one.'}
            </p>
          </div>
          <Link
            href="/login"
            className="block w-full bg-[#b0e455] text-[#0f1a0c] font-semibold text-sm py-4 rounded-2xl hover:bg-[#c9f070] transition-colors text-center"
          >
            Back to Login
          </Link>
        </div>
      ) : (
        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full bg-[#b0e455] text-[#0f1a0c] font-semibold text-sm py-4 rounded-2xl hover:bg-[#c9f070] transition-colors disabled:opacity-40"
        >
          {loading ? 'Verifying...' : isInvite ? 'Set Up My Account' : 'Continue to Reset Password'}
        </button>
      )}
    </div>
  );
}

export default function VerifyPromptPage() {
  return (
    <main className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] flex flex-col">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[var(--c-border)]">
        <Link href="/" className="text-[var(--c-text)]"><ZanaLogo className="h-5" /></Link>
      </nav>
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <Suspense fallback={
          <div className="w-6 h-6 border-2 border-[var(--c-border2)] border-t-[#b0e455] rounded-full animate-spin" />
        }>
          <VerifyPrompt />
        </Suspense>
      </div>
    </main>
  );
}
