"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { Award, Plus, Edit2, Trash2, X } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  getCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  MarketingCampaign,
  CreateMarketingCampaignPayload
} from '@/services/marketing/marketing.service';

export default function MarketingDashboard() {
  const [mounted, setMounted] = useState(false);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<MarketingCampaign | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<CreateMarketingCampaignPayload>({
    campaign_name: '',
    channel: '',
    budget: 0,
    spent: 0,
    revenue_generated: 0,
    clicks: 0,
    impressions: 0,
    conversions: 0,
    status: 'Active',
    start_date: '',
    end_date: ''
  });

  const fetchData = async () => {
    try {
      const data = await getCampaigns();
      setCampaigns(data);
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  // Calculate KPIs
  const { avgRoi, avgCac, avgCtr, chartData, topPerformer } = useMemo<{
    avgRoi: string | number;
    avgCac: string | number;
    avgCtr: string | number;
    chartData: { channel: string; spent: number; revenue: number; roi: number }[];
    topPerformer: MarketingCampaign | null;
  }>(() => {
    if (campaigns.length === 0) {
      return { avgRoi: '0.00', avgCac: '0.00', avgCtr: '0.00', chartData: [], topPerformer: null };
    }

    let totalRevenue = 0;
    let totalSpent = 0;
    let totalConversions = 0;
    let totalClicks = 0;
    let totalImpressions = 0;

    const channelMap = new Map<string, { spent: number; revenue: number }>();

    let bestRoi = 0;
    let top: MarketingCampaign | null = null;

    campaigns.forEach(c => {
      totalRevenue += Number(c.revenue_generated) || 0;
      totalSpent += Number(c.spent) || 0;
      totalConversions += Number(c.conversions) || 0;
      totalClicks += Number(c.clicks) || 0;
      totalImpressions += Number(c.impressions) || 0;

      // Aggregating for chart
      const existing = channelMap.get(c.channel) || { spent: 0, revenue: 0 };
      existing.spent += Number(c.spent) || 0;
      existing.revenue += Number(c.revenue_generated) || 0;
      channelMap.set(c.channel, existing);

      // Top performer calculation
      const roi = (Number(c.spent) || 0) > 0 ? (Number(c.revenue_generated) || 0) / (Number(c.spent) || 0) : 0;
      if (roi > bestRoi) {
        bestRoi = roi;
        top = c;
      }
    });

    const cData = Array.from(channelMap.entries()).map(([channel, data]) => ({
      channel,
      spent: data.spent,
      revenue: data.revenue,
      roi: data.spent > 0 ? Number((data.revenue / data.spent).toFixed(2)) : 0
    }));

    return {
      avgRoi: totalSpent > 0 ? (totalRevenue / totalSpent).toFixed(2) : '0.00',
      avgCac: totalConversions > 0 ? (totalSpent / totalConversions).toFixed(2) : '0.00',
      avgCtr: totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00',
      chartData: cData.sort((a, b) => b.revenue - a.revenue), // sort by revenue desc
      topPerformer: top
    };
  }, [campaigns]);

  const openModal = (campaign?: MarketingCampaign) => {
    if (campaign) {
      setEditingCampaign(campaign);
      setFormData({
        campaign_name: campaign.campaign_name,
        channel: campaign.channel,
        budget: campaign.budget,
        spent: campaign.spent,
        revenue_generated: campaign.revenue_generated,
        clicks: campaign.clicks,
        impressions: campaign.impressions,
        conversions: campaign.conversions,
        status: campaign.status,
        start_date: campaign.start_date || '',
        end_date: campaign.end_date || ''
      });
    } else {
      setEditingCampaign(null);
      setFormData({
        campaign_name: '',
        channel: '',
        budget: 0,
        spent: 0,
        revenue_generated: 0,
        clicks: 0,
        impressions: 0,
        conversions: 0,
        status: 'Active',
        start_date: '',
        end_date: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCampaign(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingCampaign) {
        await updateCampaign(editingCampaign.id, formData);
      } else {
        await createCampaign(formData);
      }
      await fetchData(); // Refresh data
      closeModal();
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save campaign. Check console.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    try {
      await deleteCampaign(id);
      await fetchData();
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete campaign.');
    }
  };

  if (!mounted || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-900/50 rounded-xl border border-white/5" />
          ))}
        </div>
        <div className="h-80 bg-slate-900/50 rounded-2xl border border-white/5" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 text-left relative">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">Marketing Analytics</h2>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors shadow shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" /> Add Campaign
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center">
          <Award className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white">No marketing campaigns yet</h3>
          <p className="text-slate-400 mt-2">Click &quot;Add Campaign&quot; to create your first marketing campaign.</p>
        </div>
      ) : (
        <>
          {/* KPI Stats Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-5 rounded-2xl">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Average ROI</p>
              <p className="text-xl font-bold text-white mt-1">{avgRoi}x</p>
              <span className="text-[9px] text-slate-500 font-medium mt-2 inline-block">
                Total Revenue / Total Spent
              </span>
            </div>

            <div className="glass-card p-5 rounded-2xl">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Average CAC</p>
              <p className="text-xl font-bold text-white mt-1">${avgCac}</p>
              <span className="text-[9px] text-slate-500 font-medium mt-2 inline-block">
                Total Spent / Total Conversions
              </span>
            </div>

            <div className="glass-card p-5 rounded-2xl">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Average CTR</p>
              <p className="text-xl font-bold text-white mt-1">{avgCtr}%</p>
              <span className="text-[9px] text-slate-500 font-medium mt-2 inline-block">
                Total Clicks / Total Impressions
              </span>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Spent vs Revenue Bar Chart */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl min-h-[340px] flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Channel Spent vs Revenue</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Live aggregated financial return metrics per channel</p>
                </div>
              </div>

              <div className="flex-1 h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                    <XAxis dataKey="channel" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
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
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px' }} />
                    <Bar dataKey="spent" name="Spent" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="revenue" name="Revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Channels ROI Index list */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">ROI Channel Index</h3>
                <p className="text-[10px] text-slate-400 mb-4">Live return factor by channel</p>

                <div className="space-y-3.5 mt-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {chartData.map((c, i) => {
                    const isUnderperforming = c.roi < 1.5;
                    return (
                      <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/5 border border-white/5">
                        <span className="font-semibold text-slate-300">{c.channel}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-slate-500">${c.spent.toLocaleString()}</span>
                          <span className={`font-bold px-2 py-0.5 rounded text-[9px] ${
                            isUnderperforming ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                          }`}>
                            {c.roi}x ROI
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {topPerformer && (
                <div className="pt-4 border-t border-white/5 flex items-center gap-1.5 text-[9px] text-slate-500 mt-4">
                  <Award className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span>Top campaign: {topPerformer.campaign_name} yielding {(topPerformer.revenue_generated / (topPerformer.spent || 1)).toFixed(2)}x ROI.</span>
                </div>
              )}
            </div>
          </div>

          {/* Live Campaigns Table */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Live Campaign Analytics</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Real-time performance tracking for all campaigns</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 font-semibold uppercase text-[9px] tracking-wider">
                    <th className="pb-3 pr-2">Campaign</th>
                    <th className="pb-3 pr-2">Channel</th>
                    <th className="pb-3 pr-2 text-right">Spent / Budget</th>
                    <th className="pb-3 pr-2 text-right">Revenue</th>
                    <th className="pb-3 pr-2 text-center">CTR</th>
                    <th className="pb-3 pr-2 text-right">Conversions</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {campaigns.map((c) => {
                    const ctr = c.impressions > 0 ? ((c.clicks / c.impressions) * 100).toFixed(1) : '0.0';
                    return (
                      <tr key={c.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 text-slate-300 font-medium">
                          {c.campaign_name}
                          <div className="text-[9px] text-slate-500 font-normal mt-0.5">{c.status}</div>
                        </td>
                        <td className="py-3 text-slate-400">{c.channel}</td>
                        <td className="py-3 text-right text-slate-300">
                          ${c.spent.toLocaleString()} / <span className="text-slate-500">${c.budget.toLocaleString()}</span>
                        </td>
                        <td className="py-3 text-right text-green-400 font-mono">${c.revenue_generated.toLocaleString()}</td>
                        <td className="py-3 text-center text-blue-400 font-mono">{ctr}%</td>
                        <td className="py-3 text-right font-bold text-white">{c.conversions} leads</td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openModal(c)}
                              className="p-1.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(c.id)}
                              className="p-1.5 text-slate-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-white/5 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-semibold text-white">
                {editingCampaign ? 'Edit Campaign' : 'Create Campaign'}
              </h3>
              <button onClick={closeModal} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar text-sm">
              <form id="campaign-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Campaign Name</label>
                    <input required type="text" name="campaign_name" value={formData.campaign_name} onChange={handleChange} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Channel</label>
                    <input required type="text" name="channel" value={formData.channel} onChange={handleChange} placeholder="e.g. LinkedIn, Google" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Budget ($)</label>
                    <input required type="number" min="0" step="0.01" name="budget" value={formData.budget} onChange={handleChange} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Spent ($)</label>
                    <input required type="number" min="0" step="0.01" name="spent" value={formData.spent} onChange={handleChange} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Revenue ($)</label>
                    <input required type="number" min="0" step="0.01" name="revenue_generated" value={formData.revenue_generated} onChange={handleChange} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Clicks</label>
                    <input required type="number" min="0" name="clicks" value={formData.clicks} onChange={handleChange} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Impressions</label>
                    <input required type="number" min="0" name="impressions" value={formData.impressions} onChange={handleChange} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Conversions</label>
                    <input required type="number" min="0" name="conversions" value={formData.conversions} onChange={handleChange} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500">
                      <option value="Active">Active</option>
                      <option value="Paused">Paused</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Start Date</label>
                    <input type="date" name="start_date" value={formData.start_date || ''} onChange={handleChange} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 [color-scheme:dark]" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">End Date</label>
                    <input type="date" name="end_date" value={formData.end_date || ''} onChange={handleChange} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 [color-scheme:dark]" />
                  </div>
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-white/5 bg-slate-900/30 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="campaign-form"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow shadow-blue-500/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
