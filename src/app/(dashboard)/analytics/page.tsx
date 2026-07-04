"use client";

import React, { useEffect, useState } from 'react';
import { Sparkles, Calendar, Info } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function AnalyticsDashboard() {
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
        <div className="h-96 bg-slate-900/50 rounded-2xl border border-white/5" />
      </div>
    );
  }

  // Multi-year forecast mock data
  const forecastData = [
    { year: '2022', ARR: 1200000, target: 1200000 },
    { year: '2023', ARR: 2400000, target: 2000000 },
    { year: '2024', ARR: 3800000, target: 3500000 },
    { year: '2025', ARR: 5900000, target: 5000000 },
    { year: '2026', ARR: 8500000, target: 7500000 },
    { year: '2027 (Est)', ARR: 12800000, target: 11000000 }
  ];

  // Heatmap mock grid data (7 days, 10 hour slots)
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const HOURS = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
  
  // Generating deterministic load scores for the heatmap cells
  const getLoadColorClass = (dayIndex: number, hourIndex: number) => {
    const val = (dayIndex * 3 + hourIndex * 2) % 10;
    if (val > 7) return 'bg-blue-500 border-blue-400/40 shadow-blue-500/10 hover:border-blue-400'; // High load
    if (val > 4) return 'bg-blue-600/60 border-blue-500/20 hover:border-blue-400/50'; // Medium load
    if (val > 2) return 'bg-blue-700/20 border-blue-600/10 hover:border-blue-500/30'; // Low load
    return 'bg-white/5 border-transparent'; // Idle
  };

  const getLoadText = (dayIndex: number, hourIndex: number) => {
    const val = (dayIndex * 3 + hourIndex * 2) % 10;
    if (val > 7) return 'High Workload: 85-92%';
    if (val > 4) return 'Normal Load: 45-60%';
    if (val > 2) return 'Low Intensity: 15-30%';
    return 'System Idle: <5%';
  };

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Compound Annual Growth Rate</p>
          <p className="text-xl font-bold text-white mt-1">74.5% CAGR</p>
          <span className="text-[9px] text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded-full mt-2 inline-block">
            Outperforming SaaS benchmark
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Operational Node Efficiency</p>
          <p className="text-xl font-bold text-white mt-1">94.8% SLA</p>
          <span className="text-[9px] text-slate-400 font-medium mt-2 inline-block">
            Measured across 15,400 runs
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Predicted 2027 ARR</p>
          <p className="text-xl font-bold text-white mt-1">$12.8M</p>
          <span className="text-[9px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full mt-2 inline-block">
            Confidence interval: High
          </span>
        </div>
      </div>

      {/* Multi-year growth chart */}
      <div className="glass-panel p-6 rounded-2xl min-h-[340px] flex flex-col justify-between">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Long-term ARR Projections</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Historical and projected annual recurring revenue growth modeling</p>
          </div>
        </div>

        <div className="flex-1 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData} margin={{ top: 10, right: 5, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorARR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="year" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} tickFormatter={(val) => `$${val / 1000000}M`} />
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
              <Area type="monotone" dataKey="ARR" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorARR)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heatmap Grid & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">System load distribution</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Daily automated execution peaks across target hour slots</p>
          </div>

          <div className="space-y-2">
            {DAYS.map((day, dIdx) => (
              <div key={day} className="flex items-center gap-3">
                <span className="w-8 text-[10px] font-semibold text-slate-500">{day}</span>
                <div className="flex-1 grid grid-cols-8 gap-2">
                  {HOURS.map((hour, hIdx) => {
                    const colorClass = getLoadColorClass(dIdx, hIdx);
                    const loadText = getLoadText(dIdx, hIdx);
                    return (
                      <div
                        key={hour}
                        title={`${day} @ ${hour} - ${loadText}`}
                        className={`h-6 rounded border border-white/5 transition-all cursor-pointer ${colorClass}`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-[9px] font-semibold text-slate-500 pt-2 border-t border-white/5">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Mon - Sun hourly slices</span>
            <div className="flex items-center gap-2">
              <span>Idle</span>
              <span className="w-2.5 h-2.5 rounded bg-white/5" />
              <span className="w-2.5 h-2.5 rounded bg-blue-700/20" />
              <span className="w-2.5 h-2.5 rounded bg-blue-600/60" />
              <span className="w-2.5 h-2.5 rounded bg-blue-500" />
              <span>Max</span>
            </div>
          </div>
        </div>

        {/* AI insights desk */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-400" /> Deep AI Business Insights
            </h3>

            <div className="space-y-3.5 text-left text-xs leading-relaxed text-slate-300">
              <div className="flex gap-2">
                <Info className="w-4.5 h-4.5 text-blue-400 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Correlation detected</strong>: Marketing newsletter click-through rates correlate strongly (r=0.82) with organic pricing-page searches over a 48h lag.
                </p>
              </div>

              <div className="flex gap-2">
                <Info className="w-4.5 h-4.5 text-purple-400 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Cash Optimization opportunity</strong>: Reallocating Google Search ad budget to LinkedIn Enterprise ads will yield a projected 22% increase in SQLs.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 text-[9px] text-slate-500 font-semibold">
            Insights formulated dynamically by Analytics Agent.
          </div>
        </div>
      </div>
    </div>
  );
}
