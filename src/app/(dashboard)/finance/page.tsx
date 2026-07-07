"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useClientStore } from '@/hooks/useClientStore';
import { Search, Plus, Edit2, Trash2, X } from 'lucide-react';
import {
  Expense, ExpenseCategory,
  getExpenses, createExpense, updateExpense, deleteExpense, searchExpenses
} from '@/services/expenses/expenses.service';
import { getOrders } from '@/services/orders/orders.service';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';

const CATEGORY_COLORS: Record<string, string> = {
  payroll:    '#3B82F6',
  rent:       '#8B5CF6',
  utilities:  '#22C55E',
  marketing:  '#F59E0B',
  software:   '#EF4444',
  supplies:   '#EC4899',
  other:      '#6B7280'
};

const CATEGORIES: ExpenseCategory[] = ['payroll', 'rent', 'utilities', 'marketing', 'software', 'supplies', 'other'];

interface PieSlice { name: string; value: number; color: string; }

function computeKPIs(expenses: Expense[], totalRevenue: number) {
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const cashReserve = totalRevenue - totalExpenses;

  const now = new Date();
  const currentMonthExpenses = expenses.filter(e => {
    const d = new Date(e.expense_date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const burnRate = currentMonthExpenses.reduce((s, e) => s + Number(e.amount), 0);

  // Forecast: average monthly burn over last 3 months * 12 – current burn
  const past3 = [0, 1, 2].map(offset => {
    const d = new Date(now.getFullYear(), now.getMonth() - offset - 1, 1);
    return expenses
      .filter(e => {
        const ed = new Date(e.expense_date);
        return ed.getFullYear() === d.getFullYear() && ed.getMonth() === d.getMonth();
      })
      .reduce((s, e) => s + Number(e.amount), 0);
  });
  const hasHistory = past3.some(v => v > 0);
  const avgMonthlyBurn = hasHistory ? past3.reduce((s, v) => s + v, 0) / 3 : null;
  const forecastAnnual = avgMonthlyBurn !== null ? (totalRevenue - avgMonthlyBurn * 12) : null;

  return { cashReserve, burnRate, forecastAnnual, hasHistory };
}

function buildPieData(expenses: Expense[]): PieSlice[] {
  const totals: Record<string, number> = {};
  expenses.forEach(e => {
    totals[e.category] = (totals[e.category] || 0) + Number(e.amount);
  });
  return Object.entries(totals).map(([cat, val]) => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    value: val,
    color: CATEGORY_COLORS[cat] || '#6B7280'
  }));
}

const initialForm = { category: 'other' as ExpenseCategory, amount: 0, description: '', expense_date: new Date().toISOString().split('T')[0] };

export default function FinanceDashboard() {
  const [mounted, setMounted] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { addActivity } = useClientStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [expData, orders] = await Promise.all([getExpenses(), getOrders()]);
      setExpenses(expData);
      const rev = orders.reduce((s, o) => s + Number(o.total), 0);
      setTotalRevenue(rev);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
      setMounted(true);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) { loadData(); return; }
    try {
      setLoading(true);
      const data = await searchExpenses(searchQuery);
      setExpenses(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData(initialForm);
    setIsAddModalOpen(true);
  };

  const openEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    setFormData({
      category: exp.category,
      amount: Number(exp.amount),
      description: exp.description || '',
      expense_date: exp.expense_date
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string, label: string) => {
    if (!confirm(`Delete expense "${label}"?`)) return;
    try {
      await deleteExpense(id);
      addActivity(`Deleted expense ${label}`, 'finance');
      loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : JSON.stringify(err, null, 2));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isAddModalOpen) {
        await createExpense(formData);
        addActivity(`Added expense $${formData.amount} (${formData.category})`, 'finance');
      } else if (isEditModalOpen && editingExpense) {
        await updateExpense(editingExpense.id, formData);
        addActivity(`Updated expense $${formData.amount}`, 'finance');
      }
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const se = err as { code?: string; message?: string; details?: string; hint?: string };
      if (se.code) {
        alert(`Supabase Error [${se.code}]: ${se.message}\nDetails: ${se.details}\nHint: ${se.hint}`);
      } else {
        alert(err instanceof Error ? err.message : JSON.stringify(err, null, 2));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map(i => <div key={i} className="h-28 bg-slate-900/50 rounded-xl border border-white/5" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-slate-900/50 rounded-2xl border border-white/5" />
          <div className="h-80 bg-slate-900/50 rounded-2xl border border-white/5" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-red-950/20 border border-red-500/30 text-red-400">
        <h3 className="font-bold text-sm">Error Loading Finance Data</h3>
        <p className="text-xs mt-1">{error}</p>
      </div>
    );
  }

  const { cashReserve, burnRate, forecastAnnual, hasHistory } = computeKPIs(expenses, totalRevenue);
  const pieData = buildPieData(expenses);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Cash Reserve</p>
          <p className={`text-xl font-bold mt-1 ${cashReserve >= 0 ? 'text-white' : 'text-red-400'}`}>
            {cashReserve >= 0 ? '+' : '-'}${Math.abs(cashReserve).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[9px] text-slate-400 mt-2 inline-block">Revenue − Total Expenses</span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Current Burn Rate</p>
          <p className="text-xl font-bold text-white mt-1">
            ${burnRate.toLocaleString(undefined, { minimumFractionDigits: 2 })}/mo
          </p>
          <span className="text-[9px] text-slate-400 mt-2 inline-block">Expenses this month</span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Forecasted Annual Net Cash</p>
          {hasHistory && forecastAnnual !== null ? (
            <>
              <p className={`text-xl font-bold mt-1 ${forecastAnnual >= 0 ? 'text-white' : 'text-red-400'}`}>
                {forecastAnnual >= 0 ? '+' : '-'}${Math.abs(forecastAnnual).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <span className="text-[9px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full mt-2 inline-block">
                Based on 3-month avg burn
              </span>
            </>
          ) : (
            <>
              <p className="text-xl font-bold text-slate-400 mt-1">—</p>
              <span className="text-[9px] text-slate-500 mt-2 inline-block">Not enough historical data</span>
            </>
          )}
        </div>
      </div>

      {/* Expense Breakdown Chart + Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense Ledger (full list + search + CRUD) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Expense Ledger</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Total: ${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-slate-900/50 border border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50"
                />
              </form>
              <button
                onClick={openAddModal}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Expense
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {expenses.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-slate-400">No expenses recorded yet.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 font-semibold uppercase text-[9px] tracking-wider">
                    <th className="pb-3 pr-2">Date</th>
                    <th className="pb-3 pr-2">Category</th>
                    <th className="pb-3 pr-2">Description</th>
                    <th className="pb-3 pr-2">Amount</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {expenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-white/5 transition-colors group">
                      <td className="py-3 pr-2 text-slate-400">{new Date(exp.expense_date).toLocaleDateString()}</td>
                      <td className="py-3 pr-2">
                        <span
                          className="text-[9px] font-bold uppercase px-2 py-0.5 rounded"
                          style={{ background: `${CATEGORY_COLORS[exp.category]}20`, color: CATEGORY_COLORS[exp.category] }}
                        >
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3 pr-2 text-slate-300 max-w-[180px] truncate">
                        {exp.description || exp.supplier?.name || '—'}
                      </td>
                      <td className="py-3 pr-2 font-semibold text-white">${Number(exp.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(exp)} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(exp.id, exp.description || exp.category)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Pie Chart — Expense Breakdown */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Expense Breakdown</h3>
            <p className="text-[10px] text-slate-400 mb-4">Allocation by category</p>

            {pieData.length === 0 ? (
              <div className="flex items-center justify-center h-44 text-slate-500 text-xs">No expense data yet</div>
            ) : (
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
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
                      formatter={(val: unknown) => [`$${Number(val).toLocaleString()}`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="space-y-1.5 mt-2">
            {pieData.map((exp, i) => (
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

      {/* MODALS */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 relative">
            <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-white mb-6">
              {isAddModalOpen ? 'Add Expense' : 'Edit Expense'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-sm text-slate-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Category</label>
                  <select
                    required
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Amount ($)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
                    placeholder="Optional description"
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Date</label>
                  <input
                    required
                    type="date"
                    value={formData.expense_date}
                    onChange={e => setFormData({ ...formData, expense_date: e.target.value })}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
