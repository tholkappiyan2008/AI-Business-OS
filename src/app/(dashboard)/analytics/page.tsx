"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { TrendingUp, Users, Package, AlertTriangle } from 'lucide-react';
import { getAnalyticsData, AnalyticsData } from '@/services/analytics/analytics.service';
import {
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend
} from 'recharts';

const TOOLTIP_STYLE = {
  background: 'rgba(15, 23, 42, 0.95)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '11px'
};

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-full text-slate-500 text-xs">
      {label}
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getAnalyticsData();
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
      setMounted(true);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (!mounted || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-900/50 rounded-xl border border-white/5" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[0, 1, 2, 3].map(i => <div key={i} className="h-72 bg-slate-900/50 rounded-2xl border border-white/5" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-red-950/20 border border-red-500/30 text-red-400">
        <h3 className="font-bold text-sm">Error Loading Analytics</h3>
        <p className="text-xs mt-1">{error}</p>
      </div>
    );
  }

  const { monthlyData, topProducts, topCustomers, lowStockProducts, totalRevenue, totalExpenses, totalOrders, totalCustomers } = data!;
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';
  const hasMonthlyData = monthlyData.some(m => m.revenue > 0 || m.expenses > 0);

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</p>
          <p className="text-xl font-bold text-white mt-1">${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          <span className="text-[9px] text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded-full mt-2 inline-block">All time</span>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Net Profit</p>
          <p className={`text-xl font-bold mt-1 ${netProfit >= 0 ? 'text-white' : 'text-red-400'}`}>
            {netProfit >= 0 ? '+' : ''}${Math.abs(netProfit).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <span className="text-[9px] text-slate-400 mt-2 inline-block">Margin: {profitMargin}%</span>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Orders</p>
          <p className="text-xl font-bold text-white mt-1">{totalOrders}</p>
          <span className="text-[9px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full mt-2 inline-block">
            <TrendingUp className="w-2.5 h-2.5 inline mr-1" />Lifetime
          </span>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Customers</p>
          <p className="text-xl font-bold text-white mt-1">{totalCustomers}</p>
          <span className="text-[9px] text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-full mt-2 inline-block">
            <Users className="w-2.5 h-2.5 inline mr-1" />Registered
          </span>
        </div>
      </div>

      {/* Charts Row 1: Revenue Trend + Revenue vs Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Trend */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white">Monthly Revenue Trend</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Last 6 months sales performance</p>
          </div>
          <div className="flex-1 h-56">
            {!hasMonthlyData ? (
              <EmptyChart label="No revenue data available yet" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" fontSize={9} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={9} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: unknown) => [`$${Number(v).toLocaleString()}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Revenue vs Expenses */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white">Revenue vs Expenses</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Monthly comparison last 6 months</p>
          </div>
          <div className="flex-1 h-56">
            {!hasMonthlyData ? (
              <EmptyChart label="No data available yet" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" fontSize={9} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={9} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: unknown, name: unknown) => [`$${Number(v).toLocaleString()}`, String(name)]} />
                  <Legend wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }} />
                  <Bar dataKey="revenue" fill="#3B82F6" radius={[3, 3, 0, 0]} name="Revenue" />
                  <Bar dataKey="expenses" fill="#EF4444" radius={[3, 3, 0, 0]} name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row 2: Profit Trend + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit Trend */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white">Profit Trend</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Net profit per month (Revenue − Expenses)</p>
          </div>
          <div className="flex-1 h-56">
            {!hasMonthlyData ? (
              <EmptyChart label="No profit data available yet" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" fontSize={9} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={9} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: unknown) => [`$${Number(v).toLocaleString()}`, 'Profit']} />
                  <Line type="monotone" dataKey="profit" stroke="#22C55E" strokeWidth={2} dot={{ r: 3, fill: '#22C55E' }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="mb-4 flex items-center gap-1.5">
            <Package className="w-4 h-4 text-blue-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">Top Selling Products</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">By total revenue generated</p>
            </div>
          </div>
          {topProducts.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-slate-500 text-xs">No order items yet</div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((prod, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[9px] font-bold text-slate-500 w-4">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{prod.name}</p>
                      <p className="text-[9px] font-mono text-slate-500">{prod.sku}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-white">${prod.total_revenue.toLocaleString()}</p>
                    <p className="text-[9px] text-slate-400">{prod.total_sold} sold</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Top Customers + Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="mb-4 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-purple-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">Top Customers</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">By lifetime spending</p>
            </div>
          </div>
          {topCustomers.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-slate-500 text-xs">No orders yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 font-semibold uppercase text-[9px] tracking-wider">
                    <th className="pb-2 pr-2">#</th>
                    <th className="pb-2 pr-2">Customer</th>
                    <th className="pb-2 pr-2 text-right">Orders</th>
                    <th className="pb-2 text-right">Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {topCustomers.map((cust, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="py-2 pr-2 text-slate-500 font-bold">{i + 1}</td>
                      <td className="py-2 pr-2 text-white font-medium">{cust.name}</td>
                      <td className="py-2 pr-2 text-slate-400 text-right">{cust.order_count}</td>
                      <td className="py-2 text-white font-bold text-right">${cust.total_spent.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="mb-4 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">Low Stock Alert</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Products at or below reorder level</p>
            </div>
          </div>
          {lowStockProducts.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <div className="text-center">
                <p className="text-xs text-green-400 font-semibold">All Stock Levels Healthy</p>
                <p className="text-[9px] text-slate-500 mt-1">No items below reorder threshold</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {lowStockProducts.map((prod, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                  <div>
                    <p className="text-xs font-semibold text-white">{prod.name}</p>
                    <p className="text-[9px] font-mono text-slate-500">{prod.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-amber-400">{prod.quantity} left</p>
                    <p className="text-[9px] text-slate-500">reorder @ {prod.reorder_level}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
