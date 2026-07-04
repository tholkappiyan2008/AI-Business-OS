"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useClientStore } from '@/hooks/useClientStore';
import { Menu, Bell, Sparkles, Calendar } from 'lucide-react';

export default function TopNav() {
  const pathname = usePathname();
  const { setSidebarOpen, notifications } = useClientStore();

  // Get Page Title from Pathname
  const getPageTitle = () => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length === 0) return 'Overview';
    const mainPart = parts[0];
    if (mainPart === 'chat') return 'AI Cognitive Chat';
    if (mainPart === 'agents') {
      if (parts[1]) {
        // e.g. /agents/ceo-agent
        const agentName = parts[1].replace('-agent', '').toUpperCase();
        return `${agentName} Agent Intelligence`;
      }
      return 'AI Operations Squad';
    }
    return mainPart.charAt(0).toUpperCase() + mainPart.slice(1);
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const unreadNotificationsCount = notifications.filter(n => !n.approved).length;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 border-b border-white/5 bg-slate-950/40 backdrop-blur-md">
      {/* Left side: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 xl:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base font-semibold text-white tracking-tight">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Right side: Actions, Date, Notifications */}
      <div className="flex items-center gap-4">
        {/* Date Display */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-400 bg-white/5 border border-white/5 rounded-lg px-3 py-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formattedDate}</span>
        </div>

        {/* AI Chat Shortcut */}
        <Link
          href="/chat"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/10 border border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-600/20 text-xs font-medium text-blue-400 transition-all duration-200"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Ask AI Agent</span>
        </Link>

        {/* Notification Bell */}
        <Link
          href="/notifications"
          className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1 right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
