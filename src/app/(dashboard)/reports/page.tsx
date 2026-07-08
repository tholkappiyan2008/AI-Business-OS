"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useClientStore } from '@/hooks/useClientStore';
import { FileText, Download, Sparkles, Plus, RefreshCw, CalendarRange, Trash2 } from 'lucide-react';
import {
  getReports,
  getReportSchedules,
  generateReport,
  deleteReport,
  ensureDefaultSchedules,
  Report,
  ReportSchedule
} from '@/services/reports/report.service';

export default function ReportsPage() {
  const [mounted, setMounted] = useState(false);
  const { addActivity } = useClientStore();

  const [reports, setReports] = useState<Report[]>([]);
  const [schedules, setSchedules] = useState<ReportSchedule[]>([]);
  
  const [generatingReport, setGeneratingReport] = useState<boolean>(false);
  
  const [selectedAgent, setSelectedAgent] = useState('CEO Agent');
  const [selectedType, setSelectedType] = useState('Synthesis');

  const [filterType, setFilterType] = useState('All');
  const [filterDate, setFilterDate] = useState('All Time');

  const fetchData = async () => {
    try {
      await ensureDefaultSchedules();
      const [reps, scheds] = await Promise.all([
        getReports(),
        getReportSchedules()
      ]);
      setReports(reps);
      setSchedules(scheds);
    } catch (err) {
      console.error('Error fetching reports data:', err);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      const newReport = await generateReport(selectedAgent, selectedType);
      addActivity(`Generated AI Report: "${newReport.report_name}"`, 'ceo');
      await fetchData(); // refresh list
    } catch (err) {
      console.error('Failed to generate report:', err);
      alert('Error generating report. Check console.');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm('Delete this report record?')) return;
    try {
      await deleteReport(id);
      setReports(prev => prev.filter(r => r.id !== id));
      addActivity(`Deleted report: "${name}"`, 'ceo');
    } catch (err) {
      console.error('Failed to delete report:', err);
    }
  };

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      // Type filter
      if (filterType !== 'All' && r.report_type !== filterType) return false;
      
      // Date filter (simple implementation)
      if (filterDate !== 'All Time' && r.created_at) {
        const date = new Date(r.created_at);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        
        if (filterDate === 'Last 7 Days' && diffDays > 7) return false;
        if (filterDate === 'Last 30 Days' && diffDays > 30) return false;
      }
      return true;
    });
  }, [reports, filterType, filterDate]);

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 bg-slate-900/50 rounded-2xl border border-white/5" />
        <div className="h-64 bg-slate-900/50 rounded-2xl border border-white/5" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* Visual Report Request Panel */}
      <div className="glass-panel p-6 rounded-2xl bg-gradient-to-r from-blue-950/20 via-slate-900/30 to-transparent flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1 max-w-xl">
          <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-400" /> On-Demand AI Report Generation
          </h3>
          <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
            Select a specialized corporate agent and initiate an automated data reconciliation. The agent will fetch live database records, score metrics against historical indices, and compose a downloadable CSV document.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            disabled={generatingReport}
            className="text-[10px] bg-slate-900 border border-white/5 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value="CEO Agent">CEO Agent (Strategy Brief)</option>
            <option value="Finance Agent">Finance Agent (Reconciliation)</option>
            <option value="Sales Agent">Sales Agent (Pipeline Metrics)</option>
            <option value="Inventory Agent">Inventory Agent (Warehouse)</option>
            <option value="Marketing Agent">Marketing Agent (Ads Ledger)</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            disabled={generatingReport}
            className="text-[10px] bg-slate-900 border border-white/5 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value="Synthesis">Synthesis</option>
            <option value="Audit">Audit</option>
            <option value="Forecast">Forecast</option>
            <option value="Ledger">Ledger</option>
          </select>

          <button
            onClick={handleGenerateReport}
            disabled={generatingReport}
            className="glow-btn px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-[10px] font-bold text-white rounded-lg shadow shadow-blue-500/10 flex items-center justify-center gap-1.5 transition-all whitespace-nowrap"
          >
            {generatingReport ? (
              <>Compiling Records... <RefreshCw className="w-3.5 h-3.5 animate-spin" /></>
            ) : (
              <>Generate Report <Plus className="w-3.5 h-3.5" /></>
            )}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="text-xs bg-slate-900 border border-white/5 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
        >
          <option value="All">All Types</option>
          <option value="Synthesis">Synthesis</option>
          <option value="Audit">Audit</option>
          <option value="Forecast">Forecast</option>
          <option value="Ledger">Ledger</option>
        </select>
        
        <select
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="text-xs bg-slate-900 border border-white/5 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
        >
          <option value="All Time">All Time</option>
          <option value="Last 7 Days">Last 7 Days</option>
          <option value="Last 30 Days">Last 30 Days</option>
        </select>
      </div>

      {/* Main Grid: Available Reports and Scheduled Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports Ledger (Columns 1-2) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Document Registry</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Recently generated audits and executive brief records</p>
          </div>

          {filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-slate-400 font-medium">No reports generated yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 font-semibold uppercase text-[9px] tracking-wider">
                    <th className="pb-3 pr-2">Report Name</th>
                    <th className="pb-3 pr-2">Format & Type</th>
                    <th className="pb-3 pr-2">Generated Date</th>
                    <th className="pb-3 pr-2">Author Agent</th>
                    <th className="pb-3 pr-2 text-right">Size / Download</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredReports.map((rep) => (
                    <tr key={rep.id} className="group hover:bg-white/5 transition-colors">
                      <td className="py-3 pr-2 flex items-center gap-2 text-slate-300 font-semibold">
                        <FileText className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                        <span>{rep.report_name}</span>
                      </td>
                      <td className="py-3 pr-2">
                        <span className="inline-block text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 mr-2">
                          {rep.file_type}
                        </span>
                        <span className="text-[9px] text-slate-500">{rep.report_type}</span>
                      </td>
                      <td className="py-3 pr-2 text-slate-500">
                        {rep.generated_at ? new Date(rep.generated_at).toLocaleString() : 'Unknown'}
                      </td>
                      <td className="py-3 pr-2 text-slate-400 font-medium">{rep.agent_name}</td>
                      <td className="py-3 pr-2 text-right">
                        <a
                          href={rep.download_url}
                          download={`${rep.report_name.replace(/\s+/g, '_')}.csv`}
                          onClick={() => {
                            addActivity(`Downloaded report ${rep.id}: "${rep.report_name}"`, 'ceo');
                          }}
                          className="inline-flex items-center gap-1.5 text-[10px] text-blue-400 font-bold hover:underline"
                        >
                          {rep.file_size} <Download className="w-3.5 h-3.5" />
                        </a>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDelete(rep.id, rep.report_name)}
                          className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                          title="Delete Report"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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

            {schedules.length === 0 ? (
              <p className="text-xs text-slate-500">No schedules set.</p>
            ) : (
              <div className="space-y-3">
                {schedules.map(sched => (
                  <div key={sched.id} className="p-3.5 rounded-xl border border-white/5 bg-slate-900/40 space-y-2 text-left">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-white">{sched.name}</span>
                      <span className="text-[9px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded font-mono">
                        {sched.frequency}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">{sched.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
