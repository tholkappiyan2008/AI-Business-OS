"use client";

import React, { useEffect, useState } from 'react';
import { useClientStore } from '@/hooks/useClientStore';
import { MOCK_FINANCE_CASHFLOW, MOCK_FINANCE_EXPENSES, MOCK_INVOICES } from '@/data/mockData';
import { ShieldCheck, Check } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function FinanceDashboard() {
  const [mounted, setMounted] = useState(false);
  const [invoices, setInvoices] = useState(MOCK_INVOICES);
  const { addActivity } = useClientStore();

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

  const handleApproveInvoice = (id: string, amount: string) => {
    setInvoices(prev =>
      prev.map(inv => (inv.id === id ? { ...inv, status: 'paid' } : inv))
    );
    addActivity(`Approved payment for invoice ${id} of ${amount}`, 'finance');
  };

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Cash Reserve</p>
          <p className="text-xl font-bold text-white mt-1">$2,147,900</p>
          <span className="text-[9px] text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded-full mt-2 inline-block">
            +$375,000 this quarter
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Current Burn Rate</p>
          <p className="text-xl font-bold text-white mt-1">$98,500/mo</p>
          <span className="text-[9px] text-slate-400 font-medium mt-2 inline-block">
            Estimated runway: 22 months
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Forecasted Q3 Net Cash Flow</p>
          <p className="text-xl font-bold text-white mt-1">+$420,000</p>
          <span className="text-[9px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full mt-2 inline-block">
            Forecast confidence: 98%
          </span>
        </div>
      </div>

      {/* Cash Flow and Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Line Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl min-h-[340px] flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Cash Reserve Expansion</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Historical growth timeline</p>
            </div>
          </div>

          <div className="flex-1 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_FINANCE_CASHFLOW} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} />
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
                <Area type="monotone" dataKey="cash" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorCash)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses Category Pie Chart */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Expense Breakdown</h3>
            <p className="text-[10px] text-slate-400 mb-4">Allocation by category this cycle</p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MOCK_FINANCE_EXPENSES}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {MOCK_FINANCE_EXPENSES.map((entry, index) => (
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
                    formatter={(val: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => [`$${Number(val).toLocaleString()}`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 mt-2">
            {MOCK_FINANCE_EXPENSES.map((exp, i) => (
              <div key={i} className="flex items-center justify-between text-[9px] font-semibold text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: exp.color }} />
                  {exp.name}
                </span>
                <span>${exp.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invoices Ledger Table */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Invoice Ledger</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Verified by Finance Agent matching purchase records</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-slate-500 font-semibold uppercase text-[9px] tracking-wider">
                <th className="pb-3 pr-2">ID</th>
                <th className="pb-3 pr-2">Client / Vendor</th>
                <th className="pb-3 pr-2">Billing Date</th>
                <th className="pb-3 pr-2">Amount</th>
                <th className="pb-3 pr-2 text-center">AI Verified</th>
                <th className="pb-3 pr-2">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invoices.map((inv) => {
                const isPaid = inv.status === 'paid';
                return (
                  <tr key={inv.id} className="group hover:bg-white/5 transition-colors">
                    <td className="py-3 font-mono font-semibold text-white">{inv.id}</td>
                    <td className="py-3 text-slate-300 font-medium">{inv.client}</td>
                    <td className="py-3 text-slate-400">{inv.date}</td>
                    <td className="py-3 font-semibold text-white">{inv.amount}</td>
                    <td className="py-3 text-center">
                      {inv.agentVerified ? (
                        <span className="inline-flex items-center gap-1 text-[9px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/15 font-bold uppercase">
                          <ShieldCheck className="w-3 h-3" /> MATCHED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/15 font-bold uppercase">
                          MANUAL CHECK
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      <span className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                        isPaid
                          ? 'bg-green-500/10 text-green-400'
                          : inv.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {inv.status === 'pending' ? (
                        <button
                          onClick={() => handleApproveInvoice(inv.id, inv.amount)}
                          className="px-2.5 py-1 text-[9px] font-bold rounded bg-blue-600 hover:bg-blue-500 text-white transition-all shadow shadow-blue-500/10 inline-flex items-center gap-1"
                        >
                          Approve <Check className="w-3 h-3" />
                        </button>
                      ) : isPaid ? (
                        <span className="text-[10px] text-slate-500 font-medium">Reconciled</span>
                      ) : (
                        <button
                          onClick={() => handleApproveInvoice(inv.id, inv.amount)}
                          className="px-2.5 py-1 text-[9px] font-bold rounded bg-slate-800 hover:bg-slate-700 text-white transition-all inline-flex items-center gap-1"
                        >
                          Force Settle
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
