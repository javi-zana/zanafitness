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

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(searchParams.get('error') ?? '');
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
      <div className="bg-[#162212] border border-[#b0e455]/12 rounded-2xl p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-[#b0e455] flex items-center justify-center mx-auto bg-[#b0e455]/10">
          <svg viewBox="0 0 16 16" className="w-5 h-5 text-[#b0e455]" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 8l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-[#b0e455]">Check your inbox</p>
        <p className="text-sm text-[#edf5e2]/55 leading-relaxed">
          A reset link was sent to<br />
          <span className="text-[#edf5e2] font-medium">{forgotEmail}</span>
        </p>
        <button
          onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(''); }}
          className="text-sm text-[#edf5e2]/40 hover:text-[#edf5e2] transition-colors"
        >
          ← Back to login
        </button>
      </div>
    ) : (
      <form onSubmit={handleForgotPassword} className="space-y-4">
        <p className="text-sm text-[#edf5e2]/50 text-center leading-relaxed">
          Enter your email and we'll send a reset link.
        </p>
        <input
          type="email"
          placeholder="Email address"
          required
          value={forgotEmail}
          onChange={e => setForgotEmail(e.target.value)}
          className="w-full bg-[#162212] border border-[#b0e455]/15 rounded-2xl px-4 py-4 text-sm text-[#edf5e2] placeholder-[#edf5e2]/30 focus:outline-none focus:border-[#b0e455]/40 transition-colors"
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
          className="w-full text-sm text-[#edf5e2]/40 hover:text-[#edf5e2] transition-colors"
        >
          ← Back to login
        </button>
      </form>
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
        className="w-full bg-[#162212] border border-[#b0e455]/15 rounded-2xl px-4 py-4 text-sm text-[#edf5e2] placeholder-[#edf5e2]/30 focus:outline-none focus:border-[#b0e455]/40 transition-colors"
      />
      <input
        type="password"
        placeholder="Password"
        required
        value={password}
        onChange={e => setPassword(e.target.value)}
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
        className="w-full bg-[#b0e455] text-[#0f1a0c] font-semibold text-sm py-4 rounded-2xl hover:bg-[#c9f070] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => setShowForgot(true)}
          className="text-sm text-[#edf5e2]/40 hover:text-[#edf5e2] transition-colors"
        >
          Forgot password?
        </button>
        <Link href="/system" className="text-sm text-[#b0e455] hover:text-[#c9f070] transition-colors">
          View plans
        </Link>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#0f1a0c] text-[#edf5e2] flex flex-col">

      <nav className="flex items-center justify-between px-8 py-5 border-b border-[#b0e455]/8">
        <Link href="/" className="text-[#edf5e2]">
          <ZanaLogo className="h-5 text-[#edf5e2]" />
        </Link>
        <Link href="/" className="text-sm text-[#edf5e2]/45 hover:text-[#edf5e2] transition-colors">
          ← Back
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">

          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 bg-[#b0e455]/10 border border-[#b0e455]/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b0e455]" />
              <p className="text-xs font-medium text-[#b0e455]">Member Access</p>
            </span>
            <h1 className="font-display leading-none mb-3" style={{ fontSize: "clamp(40px, 6vw, 60px)" }}>
              Welcome<br />back.
            </h1>
            <p className="text-sm text-[#edf5e2]/45">
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
