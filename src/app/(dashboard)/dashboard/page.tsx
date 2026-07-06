import React from 'react';
import { getDashboardStats } from '@/services/dashboard/dashboard.service';
import ExecutiveDashboardClient from './ExecutiveDashboardClient';

// This page reads cookies via the server Supabase client — must be dynamic
export const dynamic = 'force-dynamic';


export default async function ExecutiveDashboard() {
  const stats = await getDashboardStats();
  return <ExecutiveDashboardClient initialStats={stats} />;
}
