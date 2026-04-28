"use client";

import { useState, FormEvent, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

const ZIcon = () => (
  <svg viewBox="0 0 32 32" className="h-6" fill="none" stroke="currentColor" strokeWidth="5" strokeMiterlimit="10">
    <path d="M0,2 H32 L18.3,14" />
    <path d="M13.7,18 L0,30 H32" />
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
      <div className="bg-[#121821] border border-[#2d3a4b] rounded p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-[#b3cdff] flex items-center justify-center mx-auto">
          <svg viewBox="0 0 16 16" className="w-5 h-5 text-[#b3cdff]" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 8l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="font-mono text-[9px] tracking-widest text-[#b3cdff] uppercase">Check your inbox</p>
        <p className="text-sm text-gray-300 leading-relaxed">
          A password reset link has been sent to<br />
          <span className="text-white font-medium">{forgotEmail}</span>
        </p>
        <button
          onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(''); }}
          className="font-mono text-[8px] tracking-widest uppercase text-gray-500 hover:text-white transition-colors"
        >
          Back to login
        </button>
      </div>
    ) : (
      <form onSubmit={handleForgotPassword} className="space-y-4">
        <p className="font-mono text-[9px] text-gray-400 tracking-wide text-center">
          Enter your email and we&apos;ll send a reset link.
        </p>
        <input
          type="email"
          placeholder="Email address"
          required
          value={forgotEmail}
          onChange={e => setForgotEmail(e.target.value)}
          className="w-full bg-[#121821] border border-[#2d3a4b] rounded px-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#b3cdff]/50 transition-colors font-mono text-sm tracking-wide"
        />
        <button
          type="submit"
          disabled={forgotLoading}
          className="w-full bg-[#b3cdff] text-[#0f141b] font-mono text-[9px] font-bold tracking-[0.3em] uppercase py-4 rounded hover:bg-white transition-colors disabled:opacity-40"
        >
          {forgotLoading ? 'Sending...' : 'Send Reset Link'}
        </button>
        <button
          type="button"
          onClick={() => setShowForgot(false)}
          className="w-full font-mono text-[8px] tracking-widest uppercase text-gray-500 hover:text-white transition-colors"
        >
          Back to login
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <input
        type="email"
        placeholder="Email address"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full bg-[#121821] border border-[#2d3a4b] rounded px-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#b3cdff]/50 transition-colors font-mono text-sm tracking-wide"
      />
      <input
        type="password"
        placeholder="Password"
        required
        value={password}
        onChange={e => setPassword(e.target.value)}
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
        className="w-full bg-[#b3cdff] text-[#0f141b] font-mono text-[9px] font-bold tracking-[0.3em] uppercase py-4 rounded hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => setShowForgot(true)}
          className="font-mono text-[8px] tracking-widest uppercase text-gray-500 hover:text-white transition-colors"
        >
          Forgot password?
        </button>
        <Link href="/system" className="font-mono text-[8px] tracking-widest uppercase text-[#b3cdff] hover:text-white transition-colors">
          View plans
        </Link>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#0f141b] text-white flex flex-col">

      <nav className="flex items-center justify-between px-8 py-6 border-b border-[#2d3a4b]">
        <Link href="/" className="text-white">
          <ZIcon />
        </Link>
        <Link href="/" className="font-mono text-[9px] uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
          &larr; Back
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <p className="font-mono text-[9px] tracking-[0.3em] text-[#b3cdff] uppercase mb-3">Member Access</p>
            <h1 className="text-2xl font-light tracking-[0.15em] uppercase text-white mb-2">
              Welcome back.
            </h1>
            <p className="font-mono text-[9px] tracking-widest text-gray-500 uppercase">
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
