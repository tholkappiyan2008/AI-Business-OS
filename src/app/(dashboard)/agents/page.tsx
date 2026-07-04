"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useClientStore } from '@/hooks/useClientStore';
import { Bot, Search, Play, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function AgentsDirectory() {
  const { agents } = useClientStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header Brief */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">AI Operations Squad</h2>
          <p className="text-xs text-slate-400">Monitor active neural processors, cognitive weights, and core prompts</p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs glass-input focus:outline-none"
          />
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => {
          const isThinking = agent.status === 'thinking';
          const isRunning = agent.status === 'running';

          return (
            <div
              key={agent.id}
              className="glass-card rounded-2xl p-6 bg-slate-900/30 flex flex-col justify-between h-[280px] hover:-translate-y-1"
            >
              {/* Header Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" role="img" aria-label={agent.role}>
                      {agent.avatar}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{agent.name}</h3>
                      <p className="text-[10px] text-slate-400 font-medium">{agent.role}</p>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                    isThinking
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      : isRunning
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'bg-slate-800 text-slate-400 border border-white/5'
                  }`}>
                    {isThinking && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />}
                    {isRunning && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />}
                    {!isThinking && !isRunning && <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />}
                    <span className="uppercase">{agent.status}</span>
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {agent.description}
                </p>

                {/* Cognitive Specialty pill */}
                <div className="pt-2">
                  <span className="text-[9px] text-slate-400 bg-white/5 rounded border border-white/5 px-2.5 py-1 block truncate">
                    Focus: {agent.specialty}
                  </span>
                </div>
              </div>

              {/* Footer Metrics */}
              <div className="pt-4 border-t border-white/5 space-y-4">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                  <div>
                    <span className="text-slate-400">{agent.accuracy}%</span> Accuracy
                  </div>
                  <div>
                    <span className="text-slate-400">{agent.executionCount.toLocaleString()}</span> Runs
                  </div>
                  <div className="flex items-center gap-0.5 text-blue-400">
                    <ShieldCheck className="w-3.5 h-3.5" /> Checked
                  </div>
                </div>

                {/* CTA Redirect */}
                <Link
                  href={`/agents/${agent.id}`}
                  className="w-full text-center py-2 rounded-xl bg-white/5 hover:bg-blue-600/10 text-[10px] font-bold text-slate-300 hover:text-blue-400 border border-white/5 hover:border-blue-500/25 transition-all flex items-center justify-center gap-1"
                >
                  Configure Intelligence <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
