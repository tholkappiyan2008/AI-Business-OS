"use client";

import React, { useEffect, useState } from 'react';
import { MOCK_SERVER_NODES, MOCK_OPERATIONS_TIMELINE } from '@/data/mockData';
import { Cpu, Server, Network, Terminal, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function OperationsDashboard() {
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

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* KPI Core Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">System Uptime SLA</p>
          <p className="text-xl font-bold text-white mt-1">99.991%</p>
          <span className="text-[9px] text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded-full mt-2 inline-block">
            Standard Stable State
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Avg Request Latency</p>
          <p className="text-xl font-bold text-white mt-1">124 ms</p>
          <span className="text-[9px] text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded-full mt-2 inline-block">
            -12ms optimization
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Active Executions Queue</p>
          <p className="text-xl font-bold text-white mt-1">0 Pending</p>
          <span className="text-[9px] text-slate-400 font-medium mt-2 inline-block">
            No pipeline congestion detected
          </span>
        </div>
      </div>

      {/* Infrastructure Nodes Grid */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Active Operational Clusters</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">CPU and Memory load indexes for specialized AI compute clusters</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCK_SERVER_NODES.map((node) => {
            const isWarning = node.status === 'warning';
            return (
              <div key={node.id} className="p-4 rounded-xl border border-white/5 bg-slate-900/40 space-y-3 text-left">
                {/* Node info header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Server className={`w-4 h-4 ${isWarning ? 'text-amber-400' : 'text-blue-400'}`} />
                    <div>
                      <p className="text-xs font-semibold text-white">{node.name}</p>
                      <p className="text-[9px] text-slate-500">{node.location} &bull; {node.id}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                    isWarning ? 'bg-amber-500/10 text-amber-400' : 'bg-green-500/10 text-green-400'
                  }`}>
                    {node.status}
                  </span>
                </div>

                {/* Progress bars */}
                <div className="grid grid-cols-2 gap-4 pt-1">
                  {/* CPU utilization */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-slate-400">
                      <span>CPU Utilization</span>
                      <span>{node.cpu}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isWarning ? 'bg-amber-500' : 'bg-blue-500'}`}
                        style={{ width: `${node.cpu}%` }}
                      />
                    </div>
                  </div>

                  {/* Memory utilization */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-slate-400">
                      <span>Memory Allocation</span>
                      <span>{node.memory}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isWarning ? 'bg-amber-500' : 'bg-blue-500'}`}
                        style={{ width: `${node.memory}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Telemetry log timeline */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-blue-400" /> Active Operations Timeline
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Real-time background automation execution telemetries</p>
        </div>

        <div className="space-y-3">
          {MOCK_OPERATIONS_TIMELINE.map((time, i) => {
            const isSuccess = time.status === 'success';
            return (
              <div key={i} className="flex gap-4 text-xs">
                <span className="font-mono text-[10px] text-slate-500 whitespace-nowrap w-16 pt-0.5">{time.time}</span>
                <div className="flex flex-col items-center">
                  <div className="z-10 flex items-center justify-center">
                    {isSuccess ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400 bg-slate-950 rounded-full" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-400 bg-slate-950 rounded-full" />
                    )}
                  </div>
                  {i !== MOCK_OPERATIONS_TIMELINE.length - 1 && (
                    <div className="w-px h-10 bg-white/5 -mt-0.5" />
                  )}
                </div>
                <div className="text-left space-y-0.5 pb-2">
                  <p className="font-semibold text-white">{time.title}</p>
                  <p className="text-[10px] text-slate-400">{time.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
