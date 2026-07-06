"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      // If session is null after signUp, Supabase requires email confirmation.
      // Do NOT attempt signInWithPassword — it will fail with "Email not confirmed".
      if (!data.session) {
        // Email confirmation is ON → show the check-inbox message and stop.
        setSuccess(true);
        setLoading(false);
        return;
      }

      // Email confirmation is OFF → session was granted immediately, redirect.
      router.push('/dashboard');
      router.refresh();

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleThirdPartyLogin = (provider: string) => {
    // Optionally implement OAuth later
    console.log(`Third party signup with ${provider} not implemented yet`);
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
          <h2 className="text-xl font-bold text-white pt-2">Create Workspace</h2>
          <p className="text-xs text-slate-400">Initialize a new corporate access token</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-2 text-green-400 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              Account created! Check your inbox for a confirmation email and click the verification link.
              Once confirmed, return here to{' '}
              <Link href="/login" className="underline font-semibold hover:text-green-300">
                log in
              </Link>.
            </p>
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

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full glow-btn py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-50 text-white font-medium text-xs shadow-lg shadow-blue-500/10 flex items-center justify-center gap-1.5 transition-all mt-6"
          >
            {loading ? 'Initializing...' : 'Generate Access Token'} <ArrowRight className="w-4 h-4" />
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

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            Already have an access token?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors font-medium">
              Initialize Connectivity
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
