"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Placeholder Supabase OTP auth
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      // In production: supabase.auth.signInWithOtp({ email })
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-navy-900 text-white flex flex-col items-center justify-center p-6">
      <Link href="/" className="absolute top-8 left-8 text-babyblue-500 hover:text-white uppercase tracking-widest text-sm font-medium transition-colors">
        &larr; Back
      </Link>
      
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-medium tracking-wide uppercase mb-2">Zana Access</h1>
          <p className="text-gray-400 text-sm tracking-widest uppercase">Enter your email to continue</p>
        </div>

        {sent ? (
          <div className="bg-navy-800 p-8 rounded-2xl text-center space-y-4 border border-navy-700">
            <h2 className="text-babyblue-500 font-bold tracking-widest uppercase">Check your inbox</h2>
            <p className="text-gray-300 text-sm">We've sent a magic link to <span className="text-white font-medium">{email}</span></p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-navy-800 border border-navy-700 rounded-lg px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-babyblue-500 focus:ring-1 focus:ring-babyblue-500 transition-colors uppercase tracking-wider text-sm"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-babyblue-500 text-navy-900 font-bold px-6 py-4 rounded-lg uppercase tracking-widest hover:bg-babyblue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Continue'}
            </button>
            <p className="text-center text-xs text-gray-500 mt-4 tracking-wider">
              By continuing, you agree to our Terms of Service.
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
