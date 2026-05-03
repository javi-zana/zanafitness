"use client";

import { useState, FormEvent, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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

// ── Replace this href with the actual application form URL ───────────────────
const APPLICATION_FORM_URL = '#apply';

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const noAccess = searchParams.get('error') === 'no_access';
  const [error, setError] = useState(!noAccess ? (searchParams.get('error') ?? '') : '');
  const [forgotSent, setForgotSent] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError(error.message === 'Invalid login credentials'
        ? 'Incorrect email or password.'
        : error.message);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setForgotLoading(false);
    setForgotSent(true);
  };

  if (showForgot) {
    return forgotSent ? (
      <div className="bg-[var(--c-card)] border border-[var(--c-border)] rounded-2xl p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-[var(--c-accent-text)] flex items-center justify-center mx-auto bg-[var(--c-accent-text)]/8">
          <svg viewBox="0 0 16 16" className="w-5 h-5 text-[var(--c-accent-text)]" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 8l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-[var(--c-accent-text)]">Check your inbox</p>
        <p className="text-sm text-[var(--c-text)]/55 leading-relaxed">
          A reset link was sent to<br />
          <span className="text-[var(--c-text)] font-medium">{forgotEmail}</span>
        </p>
        <button
          onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(''); }}
          className="text-sm text-[var(--c-text3)] hover:text-[var(--c-text)] transition-colors"
        >
          ← Back to sign in
        </button>
      </div>
    ) : (
      <form onSubmit={handleForgotPassword} className="space-y-4">
        <p className="text-sm text-[var(--c-text3)] text-center leading-relaxed">
          Enter your email and we'll send a reset link.
        </p>
        <input
          type="email"
          placeholder="Email address"
          required
          value={forgotEmail}
          onChange={e => setForgotEmail(e.target.value)}
          className="w-full bg-[var(--c-card)] border border-[var(--c-border2)] rounded-2xl px-4 py-4 text-sm text-[var(--c-text)] placeholder-[var(--c-text4)] focus:outline-none focus:border-[#b0e455]/40 transition-colors"
        />
        <button
          type="submit"
          disabled={forgotLoading}
          className="w-full bg-[#b0e455] text-[#0f1a0c] font-semibold text-sm py-4 rounded-2xl hover:bg-[#c9f070] transition-colors disabled:opacity-40"
        >
          {forgotLoading ? 'Sending...' : 'Send Reset Link'}
        </button>
        <button
          type="button"
          onClick={() => setShowForgot(false)}
          className="w-full text-sm text-[var(--c-text3)] hover:text-[var(--c-text)] transition-colors"
        >
          ← Back to sign in
        </button>
      </form>
    );
  }

  if (noAccess) {
    return (
      <div className="space-y-5 text-center">
        <div className="w-14 h-14 rounded-full bg-[var(--c-accent-text)]/8 border border-[var(--c-border2)] flex items-center justify-center mx-auto">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 text-[var(--c-accent-text)]">
            <path d="M12 15v2m0-10v4m-7.07 7.07A10 10 0 1019.07 4.93 10 10 0 004.93 19.07z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <p className="text-base font-semibold text-[var(--c-text)]">Membership required</p>
          <p className="text-sm text-[var(--c-text3)] mt-1.5 leading-relaxed">
            Your account doesn't have an active membership.<br />
            Apply to get access.
          </p>
        </div>
        <a
          href={APPLICATION_FORM_URL}
          className="block w-full bg-[#b0e455] text-[#0f1a0c] font-semibold text-sm py-4 rounded-2xl hover:bg-[#c9f070] transition-colors text-center"
        >
          Apply to Join
        </a>
        <button
          type="button"
          onClick={async () => {
            const supabase = createClient();
            await supabase.auth.signOut();
            window.location.href = '/';
          }}
          className="text-sm text-[var(--c-text4)] hover:text-[var(--c-text)] transition-colors"
        >
          Sign in with a different account
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleLogin} className="space-y-3">
      <input
        type="email"
        placeholder="Email address"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full bg-[var(--c-card)] border border-[var(--c-border2)] rounded-2xl px-4 py-4 text-sm text-[var(--c-text)] placeholder-[var(--c-text4)] focus:outline-none focus:border-[#b0e455]/40 transition-colors"
      />
      <input
        type="password"
        placeholder="Password"
        required
        value={password}
        onChange={e => setPassword(e.target.value)}
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
        className="w-full bg-[#b0e455] text-[#0f1a0c] font-semibold text-sm py-4 rounded-2xl hover:bg-[#c9f070] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => setShowForgot(true)}
          className="text-sm text-[var(--c-text3)] hover:text-[var(--c-text)] transition-colors"
        >
          Forgot password?
        </button>
        <a
          href={APPLICATION_FORM_URL}
          className="text-sm text-[var(--c-accent-text)] hover:opacity-75 transition-colors"
        >
          Apply to join
        </a>
      </div>
    </form>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] flex flex-col">

      <nav className="flex items-center justify-center px-8 py-5 border-b border-[var(--c-border)]">
        <ZanaLogo className="h-5 text-[var(--c-text)]" />
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">

          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 bg-[var(--c-accent-text)]/8 border border-[var(--c-border2)] rounded-full px-4 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--c-accent-text)]" />
              <p className="text-xs font-medium text-[var(--c-accent-text)]">Member Access</p>
            </span>
            <h1 className="font-display leading-none mb-3" style={{ fontSize: "clamp(40px, 6vw, 60px)" }}>
              Welcome<br />back.
            </h1>
            <p className="text-sm text-[var(--c-text3)]">
              Sign in to your account
            </p>
          </div>

          <Suspense fallback={<div className="h-32" />}>
            <LoginForm />
          </Suspense>

        </div>
      </div>

    </main>
  );
}
