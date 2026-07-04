import React from 'react';
import Sidebar from '@/components/shared/Sidebar';
import TopNav from '@/components/shared/TopNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
