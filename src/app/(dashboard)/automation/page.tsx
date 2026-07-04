"use client";

import React, { useEffect, useState } from 'react';
import { useClientStore } from '@/hooks/useClientStore';
import { Zap, GitFork, ArrowRight, Play, Terminal, Check } from 'lucide-react';

export default function AutomationDashboard() {
  const [mounted, setMounted] = useState(false);
  const { workflows, toggleWorkflow, logs, addActivity } = useClientStore();
  const [activeBuilderTab, setActiveBuilderTab] = useState<'triggers' | 'actions'>('triggers');
  const [triggerSimulateStatus, setTriggerSimulateStatus] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-64 bg-slate-900/50 rounded-2xl border border-white/5" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-900/50 rounded-2xl border border-white/5" />
          <div className="h-80 bg-slate-900/50 rounded-2xl border border-white/5" />
        </div>
      </div>
    );
  }

  // Simulate workflow run
  const handleSimulateRun = (name: string) => {
    setTriggerSimulateStatus(name);
    addActivity(`Simulated workflow execution for: "${name}"`, 'operations');
    setTimeout(() => {
      setTriggerSimulateStatus(null);
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* 1. Visual Workflow Builder Panel */}
      <div className="glass-panel p-6 rounded-2xl space-y-4 bg-gradient-to-b from-slate-900/40 via-slate-950/20 to-transparent">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Visual Pipeline Blueprint</h3>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Define autonomous triggers and downstream agent logic</p>
          </div>
          <div className="flex gap-2">
            <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold px-2 py-0.5 rounded uppercase">
              Node Builder V2.1
            </span>
          </div>
        </div>

        {/* Builder Board Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pt-2">
          {/* Visual Canvas Board (Columns 1-3) */}
          <div className="lg:col-span-3 min-h-[220px] rounded-xl border border-dashed border-white/10 bg-slate-950/60 p-6 flex flex-col md:flex-row items-center justify-center gap-6 relative overflow-hidden">
            {/* Grid decoration */}
            <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

            {/* Node 1: Trigger */}
            <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-950/10 text-left space-y-1.5 w-44 z-10 hover:border-blue-500/45 transition-colors">
              <span className="text-[8px] font-bold uppercase tracking-wider text-blue-400">Trigger Node</span>
              <p className="text-xs font-bold text-white leading-tight">Order Created Feed</p>
              <p className="text-[9px] text-slate-400 font-medium">Source: Shopify Webhook</p>
            </div>

            {/* Link SVG connector */}
            <div className="hidden md:block text-slate-600">
              <ArrowRight className="w-5 h-5 animate-pulse" />
            </div>

            {/* Node 2: Cognitive Sentiment */}
            <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-950/10 text-left space-y-1.5 w-48 z-10 hover:border-purple-500/45 transition-colors">
              <span className="text-[8px] font-bold uppercase tracking-wider text-purple-400">AI Cognitive Core</span>
              <p className="text-xs font-bold text-white leading-tight">Reconcile Sentiment</p>
              <p className="text-[9px] text-slate-400 font-medium">Model: Gemini 1.5 Flash</p>
            </div>

            {/* Link SVG connector */}
            <div className="hidden md:block text-slate-600">
              <ArrowRight className="w-5 h-5 animate-pulse" />
            </div>

            {/* Node 3: Condition check */}
            <div className="p-4 rounded-xl border border-green-500/20 bg-green-950/10 text-left space-y-1.5 w-44 z-10 hover:border-green-500/45 transition-colors">
              <span className="text-[8px] font-bold uppercase tracking-wider text-green-400">Conditional Action</span>
              <p className="text-xs font-bold text-white leading-tight">Refund if Negative</p>
              <p className="text-[9px] text-slate-400 font-medium">Target: Stripe Refund</p>
            </div>
          </div>

          {/* Node Settings Sidebar (Column 4) */}
          <div className="p-4 rounded-xl border border-white/5 bg-slate-900/25 text-left space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex gap-2 border-b border-white/5 pb-2 text-[10px] font-bold">
                <button
                  onClick={() => setActiveBuilderTab('triggers')}
                  className={`flex-1 pb-1 transition-colors ${activeBuilderTab === 'triggers' ? 'text-blue-400 border-b border-blue-500' : 'text-slate-500'}`}
                >
                  Triggers
                </button>
                <button
                  onClick={() => setActiveBuilderTab('actions')}
                  className={`flex-1 pb-1 transition-colors ${activeBuilderTab === 'actions' ? 'text-blue-400 border-b border-blue-500' : 'text-slate-500'}`}
                >
                  Actions
                </button>
              </div>

              {activeBuilderTab === 'triggers' ? (
                <div className="space-y-2.5 text-[10px]">
                  <div className="p-2 rounded bg-white/5 border border-white/5 cursor-pointer hover:border-blue-500/30">
                    <p className="font-bold text-white">Daily Bank Feed Received</p>
                    <p className="text-slate-500">Cron scheduled check</p>
                  </div>
                  <div className="p-2 rounded bg-white/5 border border-white/5 cursor-pointer hover:border-blue-500/30">
                    <p className="font-bold text-white">Stock drops below limit</p>
                    <p className="text-slate-500">Inventory threshold alert</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 text-[10px]">
                  <div className="p-2 rounded bg-white/5 border border-white/5 cursor-pointer hover:border-blue-500/30">
                    <p className="font-bold text-white">Trigger Restock Order</p>
                    <p className="text-slate-500">Inventory API hook</p>
                  </div>
                  <div className="p-2 rounded bg-white/5 border border-white/5 cursor-pointer hover:border-blue-500/30">
                    <p className="font-bold text-white">Slack Channel Alert</p>
                    <p className="text-slate-500">Message integrations</p>
                  </div>
                </div>
              )}
            </div>

            <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-[10px] font-bold text-white rounded-lg shadow shadow-blue-500/10 flex items-center justify-center gap-1">
              Add Node Element <GitFork className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Secondary layout splits: Workflows List and Execution Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workflows List */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-white">Active Automation Pipelines</h3>
            <span className="text-[10px] text-slate-500">Click toggle to pause execution</span>
          </div>

          <div className="space-y-3.5 max-h-[280px] overflow-y-auto pr-1">
            {workflows.map((wf) => {
              const isActive = wf.status === 'Active';
              const isSimulating = triggerSimulateStatus === wf.name;
              return (
                <div key={wf.id} className="p-3.5 rounded-xl border border-white/5 bg-slate-900/40 flex items-center justify-between gap-4 text-left">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Zap className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                      <p className="text-xs font-bold text-white">{wf.name}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">Trigger: {wf.trigger}</p>
                    <p className="text-[9px] text-slate-500">Steps: {wf.steps} &bull; Success rate: {wf.successRate} &bull; Ran: {wf.lastRun}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleSimulateRun(wf.name)}
                      disabled={isSimulating}
                      className="p-1.5 rounded bg-white/5 border border-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all text-[10px] font-bold"
                    >
                      {isSimulating ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => toggleWorkflow(wf.id)}
                      className={`text-[9px] font-bold uppercase px-2.5 py-1 rounded-lg border transition-all ${
                        isActive
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : 'bg-slate-800 text-slate-400 border-white/5'
                      }`}
                    >
                      {wf.status}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Execution Logs */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-blue-400" /> System Automation Logs
            </h3>
            <span className="text-[9px] text-slate-500 font-mono">Live events</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5 font-mono text-[9px] space-y-2.5 max-h-[280px] overflow-y-auto">
            {logs.map((log, i) => {
              const isSuccess = log.level === 'success';
              const isWarning = log.level === 'warning';
              return (
                <div key={i} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="text-slate-500 font-semibold">[{log.timestamp}]</span>
                  <span className={`font-bold uppercase ${isSuccess ? 'text-green-400' : isWarning ? 'text-amber-400' : 'text-blue-400'}`}>
                    {log.level}
                  </span>
                  <span className="text-slate-400 font-medium">[{log.workflow}]</span>
                  <span className="text-slate-200 flex-1">{log.event}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
