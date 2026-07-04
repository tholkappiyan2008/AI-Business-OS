"use client";

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
// useRouter not needed
import { useClientStore } from '@/hooks/useClientStore';
import { ArrowLeft, Save, Shield, Terminal, Check } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AgentDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { agents } = useClientStore();
  const [agent, setAgent] = useState<typeof agents[0] | null>(null);
  const [promptVal, setPromptVal] = useState('');
  const [savedStatus, setSavedStatus] = useState(false);

  useEffect(() => {
    const foundAgent = agents.find(a => a.id === resolvedParams.id);
    if (foundAgent) {
      setAgent(foundAgent);
      setPromptVal(foundAgent.prompt);
    }
  }, [resolvedParams.id, agents]);

  if (!agent) {
    return (
      <div className="text-center py-20 animate-pulse space-y-4">
        <div className="h-10 bg-slate-900/50 w-24 rounded mx-auto" />
        <div className="h-64 bg-slate-900/50 max-w-lg rounded mx-auto" />
      </div>
    );
  }

  const handleSavePrompt = () => {
    setSavedStatus(true);
    // Simulate updating in global activities
    setTimeout(() => {
      setSavedStatus(false);
    }, 2000);
  };

  // Cognitive Weight pie data
  const cognitiveData = [
    { name: 'Algorithmic Inference', value: 45, color: '#3B82F6' },
    { name: 'Data Reconciliation', value: 30, color: '#8B5CF6' },
    { name: 'Syntax Checking & SLA', value: 15, color: '#22C55E' },
    { name: 'Anomaly Scanning', value: 10, color: '#F59E0B' }
  ];

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* Back navigation */}
      <div>
        <Link
          href="/agents"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Operations Squad
        </Link>
      </div>

      {/* Main Grid: Details Header */}
      <div className="glass-panel p-6 rounded-2xl bg-slate-900/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-3xl">
            {agent.avatar}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-white leading-none">{agent.name}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/15 uppercase">
                {agent.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">{agent.role} &bull; {agent.model}</p>
            <p className="text-[11px] text-slate-400 max-w-xl">{agent.description}</p>
          </div>
        </div>

        <div className="flex gap-8 text-[11px] font-semibold text-slate-500 border-l border-white/5 pl-6 hidden md:flex">
          <div>
            <p className="text-slate-400 text-base font-bold">{agent.accuracy}%</p>
            <p className="uppercase mt-0.5">Audit Accuracy</p>
          </div>
          <div>
            <p className="text-slate-400 text-base font-bold">{agent.executionCount.toLocaleString()}</p>
            <p className="uppercase mt-0.5">Automated Runs</p>
          </div>
        </div>
      </div>

      {/* Secondary layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prompt configuration (takes 2 columns) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">System Prompt Tuner</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Refine the underlying instructions for target operations</p>
            </div>
            <button
              onClick={handleSavePrompt}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-[10px] font-bold text-white transition-all shadow-md shadow-blue-500/10"
            >
              {savedStatus ? (
                <>Saved <Check className="w-3.5 h-3.5" /></>
              ) : (
                <>Save Prompt <Save className="w-3.5 h-3.5" /></>
              )}
            </button>
          </div>

          <textarea
            value={promptVal}
            onChange={(e) => setPromptVal(e.target.value)}
            rows={8}
            className="w-full p-4 text-xs font-mono bg-slate-950/60 border border-white/5 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-0 leading-relaxed"
          />

          <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/5 rounded-xl text-[10px] text-slate-400 leading-relaxed">
            <Shield className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span>
              Instructions updated here immediately deploy into the cognitive loop. Cognitive limits safeguard agents from allocating unauthorized capital.
            </span>
          </div>
        </div>

        {/* Cognitive Weight Distribution Chart */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Cognitive Focus</h3>
            <p className="text-[10px] text-slate-400 mb-4">Memory footprint allocation per task type</p>
            
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cognitiveData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {cognitiveData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '10px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart Legend */}
          <div className="space-y-2 mt-2">
            {cognitiveData.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-[9px] font-semibold text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name}
                </span>
                <span>{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Memory Logs */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-blue-400" /> Active Cognitive Memory Logs
          </h3>
          <span className="text-[9px] text-slate-500">Continuous telemetry feed</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-white/5 font-mono text-[10px] text-slate-300 space-y-2 max-h-60 overflow-y-auto">
          {agent.memoryLogs.map((log: string, idx: number) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-slate-500 whitespace-nowrap">&gt;&gt;</span>
              <span className="leading-relaxed">{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
