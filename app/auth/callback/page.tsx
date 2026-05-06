"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

function Spinner() {
  return (
    <div className="min-h-screen bg-[var(--c-bg)] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[var(--c-border2)] border-t-[#b0e455] rounded-full animate-spin" />
    </div>
  );
}

function Callback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createClient();
    const next = searchParams.get('next') ?? '/dashboard';
    const code = searchParams.get('code');
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type');
    const error = searchParams.get('error');
    const errorCode = searchParams.get('error_code');

    const fail = (msg?: string) =>
      router.replace(`/login?error=${encodeURIComponent(msg ?? 'Login failed. Please try again.')}`);

    if (error) {
      fail(errorCode === 'otp_expired'
        ? 'Your login link expired. Please request a new one.'
        : 'Login failed. Please try again.');
      return;
    }

    // PKCE code flow (reset password from browser, some invite configs)
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) fail();
        else router.replace(next);
      });
      return;
    }

    // OTP / invite / recovery token_hash flow
    if (tokenHash && type) {
      supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as 'invite' | 'recovery' | 'signup' | 'magiclink' | 'email',
      }).then(({ error }) => {
        if (error) fail();
        else router.replace(next);
      });
      return;
    }

    // Hash-based (implicit) flow — Supabase auto-processes #access_token in URL hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY')) {
        subscription.unsubscribe();
        router.replace(next);
      }
    });

    const timer = setTimeout(() => fail(), 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  return <Spinner />;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <Callback />
    </Suspense>
  );
}
