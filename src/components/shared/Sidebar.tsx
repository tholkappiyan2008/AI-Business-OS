"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useClientStore } from '@/hooks/useClientStore';
import {
  LayoutDashboard,
  MessageSquare,
  Cpu,
  Coins,
  TrendingUp,
  Target,
  Package,
  Activity,
  BarChart3,
  Zap,
  FileText,
  Bell,
  Settings,
  X,
  Sparkles
} from 'lucide-react';

const MENU_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'AI Chat', href: '/chat', icon: MessageSquare },
  { label: 'AI Agents', href: '/agents', icon: Cpu },
  { label: 'Finance', href: '/finance', icon: Coins },
  { label: 'Sales', href: '/sales', icon: TrendingUp },
  { label: 'Marketing', href: '/marketing', icon: Target },
  { label: 'Inventory', href: '/inventory', icon: Package },
  { label: 'Operations', href: '/operations', icon: Activity },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Automation', href: '/automation', icon: Zap },
  { label: 'Reports', href: '/reports', icon: FileText },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, settings } = useClientStore();

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm xl:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 border-r border-white/5 bg-slate-950/80 backdrop-blur-xl transition-transform duration-300 xl:translate-x-0 xl:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header / Brand */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/5">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 group-hover:border-purple-500/40 transition-colors">
              <Sparkles className="w-4 h-4 text-blue-400 group-hover:text-purple-400 transition-colors" />
            </div>
            <span className="text-sm font-semibold tracking-wider uppercase text-white bg-clip-text">
              AI Business OS
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 xl:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group duration-200 ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-400 border-l-2 border-blue-500 pl-3.5'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Profile */}
        <div className="p-4 border-t border-white/5 bg-slate-900/30">
          <Link
            href="/settings"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-800 border border-white/10 text-base">
              {settings.profile.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                {settings.profile.name}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {settings.profile.role}
              </p>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}
