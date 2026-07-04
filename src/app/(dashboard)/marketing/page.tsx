"use client";

import React, { useEffect, useState } from 'react';
// useClientStore not used
import { MOCK_CAMPAIGN_PERFORMANCE, MOCK_EMAIL_ANALYTICS } from '@/data/mockData';
import { Award } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function MarketingDashboard() {
  const [mounted, setMounted] = useState(false);
  // addActivity not needed here

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-900/50 rounded-xl border border-white/5" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-slate-900/50 rounded-2xl border border-white/5" />
          <div className="h-80 bg-slate-900/50 rounded-2xl border border-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* KPI Stats Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Average Ad ROI</p>
          <p className="text-xl font-bold text-white mt-1">3.1x Factor</p>
          <span className="text-[9px] text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded-full mt-2 inline-block">
            +0.3x vs last month
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Blended Customer Acquisition Cost</p>
          <p className="text-xl font-bold text-white mt-1">$45.20</p>
          <span className="text-[9px] text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded-full mt-2 inline-block">
            -8.5% CAC decrease
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Avg Ad Click Through Rate</p>
          <p className="text-xl font-bold text-white mt-1">4.8% CTR</p>
          <span className="text-[9px] text-slate-400 font-medium mt-2 inline-block">
            Aggregated across 5 channels
          </span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spent vs Revenue Bar Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl min-h-[340px] flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Channel Spent vs Revenue</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Financial return metrics for paid acquisition channels</p>
            </div>
          </div>

          <div className="flex-1 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_CAMPAIGN_PERFORMANCE} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <XAxis dataKey="channel" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                  formatter={(val: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => [`$${Number(val).toLocaleString()}`, '']}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="spent" name="Spent" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="revenue" name="Revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channels ROI Index list */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">ROI Channel Index</h3>
            <p className="text-[10px] text-slate-400 mb-4">Return factor sorted by channel weight</p>

            <div className="space-y-3.5 mt-2">
              {MOCK_CAMPAIGN_PERFORMANCE.map((c, i) => {
                const isUnderperforming = c.roi < 1.5;
                return (
                  <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/5 border border-white/5">
                    <span className="font-semibold text-slate-300">{c.channel}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-500">Spent: ${c.spent.toLocaleString()}</span>
                      <span className={`font-bold px-2 py-0.5 rounded text-[9px] ${
                        isUnderperforming ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                      }`}>
                        {c.roi}x ROI
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center gap-1.5 text-[9px] text-slate-500">
            <Award className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span>Top performer: LinkedIn Enterprise Ads yielding 3.5x ROI.</span>
          </div>
        </div>
      </div>

      {/* Email Marketing Performance */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Email Newsletter Analytics</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Subscriber newsletter performance and downstream conversions</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-slate-500 font-semibold uppercase text-[9px] tracking-wider">
                <th className="pb-3 pr-2">Campaign Subject</th>
                <th className="pb-3 pr-2">Recipients Sent</th>
                <th className="pb-3 pr-2 text-center">Open Rate</th>
                <th className="pb-3 pr-2 text-center">Click Rate</th>
                <th className="pb-3 text-right">Conversions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {MOCK_EMAIL_ANALYTICS.map((email, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 text-slate-300 font-medium">{email.campaign}</td>
                  <td className="py-3 text-slate-400">{email.sent.toLocaleString()}</td>
                  <td className="py-3 text-center text-white font-mono">{email.openRate}</td>
                  <td className="py-3 text-center text-blue-400 font-mono">{email.clickRate}</td>
                  <td className="py-3 text-right font-bold text-white">{email.conversions} leads</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
