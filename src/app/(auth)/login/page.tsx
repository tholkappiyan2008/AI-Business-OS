"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmailNotConfirmed, setIsEmailNotConfirmed] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setIsEmailNotConfirmed(false);
    setResendSuccess(false);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Supabase returns this specific message when email confirmation is ON
        // and the user has not yet clicked their confirmation link.
        if (
          error.message === 'Email not confirmed' ||
          (error as { code?: string }).code === 'email_not_confirmed'
        ) {
          setIsEmailNotConfirmed(true);
          setError(
            'Your email address has not been confirmed yet. Please check your inbox (and spam folder) for the confirmation link we sent when you signed up.'
          );
        } else {
          setError(error.message);
        }
        setLoading(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (!error) {
        setResendSuccess(true);
      }
    } catch {
      // silently ignore — the main error message is still shown
    } finally {
      setResendLoading(false);
    }
  };

  const handleThirdPartyLogin = (provider: string) => {
    // Optionally implement OAuth later
    console.log(`Third party login with ${provider} not implemented yet`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-[#F3F4F6] relative overflow-hidden bg-grid-pattern px-4">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 rounded-2xl glass-panel border border-white/5 shadow-2xl relative z-10 bg-slate-900/30"
      >
        {/* Brand Header */}
        <div className="text-center mb-8 space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30">
              <Sparkles className="w-4 h-4 text-blue-400" />
            </div>
            <span className="font-semibold text-sm tracking-wider uppercase text-white">
              AI Business OS
            </span>
          </Link>
          <h2 className="text-xl font-bold text-white pt-2">Welcome Back</h2>
          <p className="text-xs text-slate-400">Initialize corporate workspace connectivity</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex flex-col gap-2 text-red-400 text-xs">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
            {isEmailNotConfirmed && (
              <div className="pl-6 flex flex-col gap-2">
                {resendSuccess ? (
                  <div className="flex items-center gap-1.5 text-green-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirmation email resent! Check your inbox.</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={resendLoading}
                    className="self-start text-[11px] underline text-red-300 hover:text-red-200 disabled:opacity-50 transition-colors"
                  >
                    {resendLoading ? 'Sending...' : 'Resend confirmation email'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Corporate Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm glass-input text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-400">Security Key / Password</label>
              <a href="#" className="text-[10px] text-blue-400 hover:underline">Forgot?</a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-sm glass-input text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Remember me toggle */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-white/10 bg-slate-900/50 text-blue-600 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
              />
              <span>Remember execution token</span>
            </label>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full glow-btn py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-50 text-white font-medium text-xs shadow-lg shadow-blue-500/10 flex items-center justify-center gap-1.5 transition-all mt-6"
          >
            {loading ? 'Validating credentials...' : 'Enter Operating Console'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-[10px] uppercase tracking-wider text-slate-500">or connect via</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {/* Third Party Auth */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleThirdPartyLogin('google')}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all duration-200"
          >
            {/* Google Logo Mock */}
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-6.887 4.114-4.833 0-8.75-3.917-8.75-8.75s3.917-8.75 8.75-8.75c2.254 0 4.3.85 5.85 2.236L21.1 2.236A12.44 12.44 0 0 0 12.24 0C5.48 0 0 5.48 0 12.24s5.48 12.24 12.24 12.24c6.76 0 12.24-5.48 12.24-12.24 0-.74-.066-1.47-.19-2.18l-12.05-.015z" />
            </svg>
            <span>Google</span>
          </button>

          <button
            onClick={() => handleThirdPartyLogin('microsoft')}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all duration-200"
          >
            {/* Microsoft Logo Mock */}
            <svg className="w-3.5 h-3.5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M0 0h11.4v11.4H0zM12.6 0H24v11.4H12.6zM0 12.6h11.4V24H0zM12.6 12.6H24V24H12.6z" />
            </svg>
            <span>Microsoft</span>
          </button>
        </div>

        {/* Signup Link */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            Don&apos;t have an access token?{' '}
            <Link href="/signup" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors font-medium">
              Request Authorization
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
