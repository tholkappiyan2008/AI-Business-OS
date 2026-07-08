"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardStats, Recommendation, Task } from '@/services/dashboard/dashboard.service';
import {
  Sparkles,
  Check,
  ArrowRight,
  Clock,
  ExternalLink,
  Bot
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

interface ExecutiveDashboardClientProps {
  initialStats: DashboardStats;
}

export default function ExecutiveDashboardClient({ initialStats }: ExecutiveDashboardClientProps) {
  const [mounted, setMounted] = useState(false);
  const [localRecs, setLocalRecs] = useState<Recommendation[]>([]);
  const [localTasks, setLocalTasks] = useState<Task[]>([]);

  useEffect(() => {
    setMounted(true);
    setLocalRecs(initialStats.recommendations || []);
    setLocalTasks(initialStats.tasks || []);
  }, [initialStats]);

  const approveRecommendation = (id: string) => {
    setLocalRecs(prev => prev.filter(r => r.id !== id));
  };

  const dismissTask = (id: string) => {
    setLocalTasks(prev => prev.filter(t => t.id !== id));
  };

  if (!mounted) {
    // Beautiful Loading Skeletons
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-slate-900/50 rounded-2xl border border-white/5" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-900/50 rounded-xl border border-white/5" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-900/50 rounded-2xl border border-white/5" />
          <div className="h-96 bg-slate-900/50 rounded-2xl border border-white/5" />
        </div>
      </div>
    );
  }

  const chartData = initialStats.chartData || [];
  const activities = initialStats.activities || [];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Today's AI Summary Card */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden bg-gradient-to-r from-blue-950/20 via-slate-900/40 to-slate-900/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <Bot className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase">Today&apos;s Executive Synthesis</span>
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Updated just now
              </span>
            </div>
            <p className="text-sm font-medium text-white leading-relaxed">
              {initialStats.summary}
            </p>
            <div className="flex items-center gap-4 pt-2">
              <Link href="/chat" className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 group">
                Open Strategy Console <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {initialStats.kpis.map((kpi, idx) => {
          // Format sparkline data
          const sparkData = kpi.chartData.map((val, i) => ({ id: i, value: val }));
          return (
            <div key={idx} className="glass-card p-5 rounded-2xl flex flex-col justify-between h-[120px]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{kpi.label}</p>
                  <p className="text-xl font-bold text-white mt-1">{kpi.value}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    kpi.isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {kpi.change}
                  </span>
                  <p className="text-[9px] text-slate-500 mt-1">{kpi.subtext}</p>
                </div>
              </div>
              
              {/* Sparkline chart */}
              <div className="h-8 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparkData}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={kpi.isPositive ? "#22C55E" : "#EF4444"}
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. AI Recommendations Panel & Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Column */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col justify-between min-h-[380px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Monthly Cash Flow</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Corporate inflows versus outflows</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Inflow
              </span>
              <span className="flex items-center gap-1.5 text-purple-400">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Outflow
              </span>
            </div>
          </div>

          <div className="flex-1 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  stroke="rgba(255,255,255,0.2)"
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.2)"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
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
                <Area
                  type="monotone"
                  dataKey="inflow"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorInflow)"
                />
                <Area
                  type="monotone"
                  dataKey="outflow"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorOutflow)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Recommendations Column */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between min-h-[380px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-400" /> AI Recommendations
              </h3>
              <span className="text-[10px] bg-blue-500/10 text-blue-400 font-bold px-2 py-0.5 rounded-full">
                {localRecs.length} Actionable
              </span>
            </div>

            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
              {localRecs.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <div className="flex justify-center text-green-400">
                    <Check className="w-8 h-8 rounded-full bg-green-500/10 p-1 border border-green-500/20" />
                  </div>
                  <p className="text-xs text-slate-300 font-medium">No recommendations available.</p>
                  <p className="text-[10px] text-slate-500">Autonomous systems are maintaining stability.</p>
                </div>
              ) : (
                localRecs.map((rec) => (
                  <div key={rec.id} className="p-3.5 rounded-xl border border-white/5 bg-slate-900/40 space-y-2 text-left relative overflow-hidden group">
                    <div className="flex items-start justify-between">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        rec.urgency === 'high' ? 'bg-red-500/15 text-red-400' : rec.urgency === 'medium' ? 'bg-amber-500/15 text-amber-400' : 'bg-blue-500/15 text-blue-400'
                      }`}>
                        {rec.urgency} Priority
                      </span>
                      <span className="text-[9px] text-slate-500 font-semibold">{rec.agent}</span>
                    </div>
                    <p className="text-xs font-bold text-white truncate">{rec.title}</p>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{rec.description}</p>
                    
                    <div className="pt-2 flex items-center justify-between border-t border-white/5">
                      <span className="text-[9px] font-medium text-slate-500">{rec.action}</span>
                      <button
                        onClick={() => approveRecommendation(rec.id)}
                        className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                      >
                        Approve <Check className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

          <div className="pt-4 border-t border-white/5 text-center">
            <Link href="/agents" className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5">
              Tune Agent Cognitive Models <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Recent Activities Feed & Tasks Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Autonomous Agent Activity Log</h3>
            <span className="text-[10px] text-slate-500">Live reconciliation stream</span>
          </div>

          <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
            {activities.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                No recent activities.
              </div>
            ) : (
              activities.map((act) => {
                const date = new Date(act.time);
                const timeString = isNaN(date.getTime()) ? act.time : date.toLocaleString();
                return (
                  <div key={act.id} className="flex items-start justify-between gap-4 text-xs">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-md shadow-blue-500" />
                      <div>
                        <span className="text-slate-300 font-medium block">{act.title}</span>
                        <span className="text-[10px] text-slate-500">{act.description}</span>
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-500 whitespace-nowrap">{timeString}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">CEO Operational Board</h3>
              <span className="text-[10px] bg-white/5 border border-white/10 text-slate-400 font-semibold px-2 py-0.5 rounded">
                {localTasks.length} Pending
              </span>
            </div>

            <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
              {localTasks.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">
                  Everything is operating normally.
                </div>
              ) : (
                localTasks.map((t) => {
                  const date = new Date(t.time);
                  const timeString = isNaN(date.getTime()) ? t.time : date.toLocaleDateString();
                  return (
                    <div key={t.id} className="p-3 rounded-xl border border-white/5 bg-slate-900/30 flex items-center justify-between gap-3 text-left">
                      <div>
                        <p className="text-xs font-semibold text-white truncate max-w-[150px]">{t.title}</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">Updated: {timeString}</p>
                      </div>
                      <button
                        onClick={() => dismissTask(t.id)}
                        className="p-1 rounded bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-all text-[10px] font-bold"
                      >
                        Verify
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <Link href="/automation" className="w-full text-center py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white border border-white/10 transition-all block">
              Manage Automation Pipelines
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
