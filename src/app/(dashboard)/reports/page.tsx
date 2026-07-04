"use client";

import React, { useEffect, useState } from 'react';
import { useClientStore } from '@/hooks/useClientStore';
import { FileText, Download, Sparkles, Plus, RefreshCw, CalendarRange } from 'lucide-react';

export default function ReportsPage() {
  const [mounted, setMounted] = useState(false);
  const { addActivity } = useClientStore();

  const [reports, setReports] = useState([
    { id: 'REP-001', name: 'Q2 Corporate Earnings Synthesis', type: 'PDF', date: 'Jul 4, 2026', size: '1.2 MB', author: 'CEO Agent' },
    { id: 'REP-002', name: 'June Warehouse Audit & Procurement Forecast', type: 'CSV', date: 'Jul 1, 2026', size: '340 KB', author: 'Inventory Agent' },
    { id: 'REP-003', name: 'Paid Ads Performance & ROI Attribution Ledger', type: 'PDF', date: 'Jun 28, 2026', size: '890 KB', author: 'Marketing Agent' },
    { id: 'REP-004', name: 'Weekly System SLA & Workflow Telemetry Logs', type: 'CSV', date: 'Jun 25, 2026', size: '2.1 MB', author: 'Operations Agent' }
  ]);

  const [generatingReport, setGeneratingReport] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState('ceo-agent');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 bg-slate-900/50 rounded-2xl border border-white/5" />
        <div className="h-64 bg-slate-900/50 rounded-2xl border border-white/5" />
      </div>
    );
  }

  const handleGenerateReport = () => {
    const authorName = selectedAgent === 'ceo-agent' ? 'CEO Agent' : selectedAgent === 'finance-agent' ? 'Finance Agent' : 'Sales Agent';
    setGeneratingReport('compiling');
    
    // Simulate generation delay
    setTimeout(() => {
      const newReport = {
        id: `REP-00${reports.length + 1}`,
        name: `Automated Executive Briefing (${authorName})`,
        type: 'PDF',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        size: '520 KB',
        author: authorName
      };

      setReports(prev => [newReport, ...prev]);
      setGeneratingReport(null);
      addActivity(`Generated AI Report: "${newReport.name}"`, 'ceo');
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* Visual Report Request Panel */}
      <div className="glass-panel p-6 rounded-2xl bg-gradient-to-r from-blue-950/20 via-slate-900/30 to-transparent flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1 max-w-xl">
          <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-400" /> On-Demand AI Report Generation
          </h3>
          <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
            Select a specialized corporate agent and initiate an automated data reconciliation. The agent will fetch live database records, score metrics against historical indices, and compose a downloadable document.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            disabled={generatingReport !== null}
            className="text-[10px] bg-slate-900 border border-white/5 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value="ceo-agent">CEO Agent (Strategy Brief)</option>
            <option value="finance-agent">Finance Agent (Reconciliation)</option>
            <option value="sales-agent">Sales Agent (Pipeline Metrics)</option>
          </select>

          <button
            onClick={handleGenerateReport}
            disabled={generatingReport !== null}
            className="glow-btn px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-[10px] font-bold text-white rounded-lg shadow shadow-blue-500/10 flex items-center justify-center gap-1.5 transition-all"
          >
            {generatingReport ? (
              <>Compiling Records... <RefreshCw className="w-3.5 h-3.5 animate-spin" /></>
            ) : (
              <>Request AI Report <Plus className="w-3.5 h-3.5" /></>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Available Reports and Scheduled Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports Ledger (Columns 1-2) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Document Registry</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Recently generated audits and executive brief records</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 font-semibold uppercase text-[9px] tracking-wider">
                  <th className="pb-3 pr-2">Report Name</th>
                  <th className="pb-3 pr-2">Format</th>
                  <th className="pb-3 pr-2">Compiled Date</th>
                  <th className="pb-3 pr-2">Author Agent</th>
                  <th className="pb-3 text-right">Size / Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reports.map((rep) => (
                  <tr key={rep.id} className="group hover:bg-white/5 transition-colors">
                    <td className="py-3 pr-2 flex items-center gap-2 text-slate-300 font-semibold">
                      <FileText className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                      <span>{rep.name}</span>
                    </td>
                    <td className="py-3 pr-2">
                      <span className={`inline-block text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        rep.type === 'PDF' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                      }`}>
                        {rep.type}
                      </span>
                    </td>
                    <td className="py-3 pr-2 text-slate-500">{rep.date}</td>
                    <td className="py-3 pr-2 text-slate-400 font-medium">{rep.author}</td>
                    <td className="py-3 text-right">
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          addActivity(`Downloaded report ${rep.id}: "${rep.name}"`, 'ceo');
                        }}
                        className="inline-flex items-center gap-1.5 text-[9px] text-blue-400 font-bold hover:underline"
                      >
                        {rep.size} <Download className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reports Scheduler Sidebar (Column 3) */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between min-h-[300px]">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <CalendarRange className="w-4 h-4 text-blue-400" /> Executive Brief Schedules
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Automated briefing distribution triggers</p>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-white/5 bg-slate-900/40 space-y-2 text-left">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-white">Monday Earnings Sync</span>
                  <span className="text-[9px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded font-mono">WEEKLY</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">CEO Agent delivers a full QTD ARR and operational index digest every Monday at 08:00 AM.</p>
              </div>

              <div className="p-3.5 rounded-xl border border-white/5 bg-slate-900/40 space-y-2 text-left">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-white">Monthly Cost Attribution Audit</span>
                  <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-mono">MONTHLY</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">Finance Agent builds tax runway forecasts and software invoice audits on the 1st of every month.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
