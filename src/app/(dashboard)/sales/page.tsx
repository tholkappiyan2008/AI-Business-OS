"use client";

import React, { useEffect, useState } from 'react';
// useClientStore not used in this file
import { MOCK_SALES_FUNNEL, MOCK_SALES_TREND, MOCK_TOP_CUSTOMERS } from '@/data/mockData';
import { Target, ShieldAlert } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

export default function SalesDashboard() {
  const [mounted, setMounted] = useState(false);

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
      {/* Sales metrics summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Weekly Revenue Velocity</p>
          <p className="text-xl font-bold text-white mt-1">$122,000</p>
          <span className="text-[9px] text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded-full mt-2 inline-block">
            +11% vs forecast target
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Customer Acquisition Cost</p>
          <p className="text-xl font-bold text-white mt-1">$45.20</p>
          <span className="text-[9px] text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded-full mt-2 inline-block">
            -8.5% improvement
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Predicted Deal Win Rate</p>
          <p className="text-xl font-bold text-white mt-1">68.2%</p>
          <span className="text-[9px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full mt-2 inline-block">
            Adjusted by Sales Agent
          </span>
        </div>
      </div>

      {/* Revenue Forecast chart and Funnel breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Revenue Trends Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl min-h-[340px] flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Weekly Pipeline Projection</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Comparing actual revenue against target baseline and agent forecast</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-semibold">
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-slate-500" /> Baseline
              </span>
              <span className="flex items-center gap-1 text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Forecast
              </span>
              <span className="flex items-center gap-1 text-green-400">
                <span className="w-2 h-2 rounded-full bg-green-500" /> Actual
              </span>
            </div>
          </div>

          <div className="flex-1 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_SALES_TREND} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} />
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
                <Line type="monotone" dataKey="baseline" stroke="rgba(255,255,255,0.3)" strokeDasharray="3 3" dot={false} strokeWidth={1.5} />
                <Line type="monotone" dataKey="forecast" stroke="#3B82F6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="actual" stroke="#22C55E" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funnel Dropoff bar chart */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Sales Funnel Efficiency</h3>
            <p className="text-[10px] text-slate-400 mb-4">Pipeline volume per conversions stage</p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_SALES_FUNNEL} layout="vertical" margin={{ top: 0, right: 10, left: -25, bottom: 0 }}>
                  <XAxis type="number" stroke="none" tick={false} />
                  <YAxis dataKey="stage" type="category" stroke="rgba(255,255,255,0.3)" fontSize={9} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '10px'
                    }}
                  />
                  <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={12}>
                    {MOCK_SALES_FUNNEL.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 mt-2">
            {MOCK_SALES_FUNNEL.map((stage, i) => (
              <div key={i} className="flex items-center justify-between text-[9px] font-semibold text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.fill }} />
                  {stage.stage}
                </span>
                <span>{stage.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Customer listing and pipeline analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Top Enterprise Clients</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Highest volume accounts by sales order frequency</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 font-semibold uppercase text-[9px] tracking-wider">
                  <th className="pb-3 pr-2">Company Name</th>
                  <th className="pb-3 pr-2">Volume</th>
                  <th className="pb-3 pr-2">Deals count</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {MOCK_TOP_CUSTOMERS.map((cust, i) => (
                  <tr key={i} className="group hover:bg-white/5 transition-colors">
                    <td className="py-3 text-slate-300 font-medium">{cust.name}</td>
                    <td className="py-3 font-semibold text-white">{cust.volume}</td>
                    <td className="py-3 text-slate-400">{cust.sales}</td>
                    <td className="py-3 text-right">
                      <span className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                        cust.status === 'Active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {cust.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lead scoring metrics */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Target className="w-4 h-4 text-blue-400" /> Active Lead Quality
            </h3>

            <div className="space-y-3">
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1.5 text-left">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-white">Enterprise TechCorp</span>
                  <span className="text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">95/100 Fit</span>
                </div>
                <p className="text-[10px] text-slate-400">Sales Agent recommended scheduling executive demo immediately.</p>
              </div>

              <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1.5 text-left">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-white">Apex Logistics SA</span>
                  <span className="text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">88/100 Fit</span>
                </div>
                <p className="text-[10px] text-slate-400">Proposal sent, currently analyzing decision makers timeline.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-[10px] text-slate-500">
            <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>Lead fit index verified dynamically using historical client parameters.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
