import React from 'react';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/shared/Sidebar';
import TopNav from '@/components/shared/TopNav';
import { createClient } from '@/lib/supabase/server';

/**
 * DashboardLayout is a Server Component.
 *
 * It runs on every request to any route inside (dashboard)/.
 * 1. Creates a server-side Supabase client (reads cookies — no network round-trip).
 * 2. Calls getUser() — the only secure way to get session data server-side.
 * 3. Redirects to /login if there is no authenticated user.
 *    This is a defense-in-depth safeguard on top of middleware.ts.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If somehow middleware was bypassed, redirect here as a hard guard.
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-brand-bg bg-radial-glow bg-grid-pattern bg-fixed">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <TopNav />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto px-6 py-6 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
