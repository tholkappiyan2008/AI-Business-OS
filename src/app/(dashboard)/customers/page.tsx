"use client";

import React, { useEffect, useState } from 'react';
import { useClientStore } from '@/hooks/useClientStore';
import { Search, Plus, Edit2, Trash2, X } from 'lucide-react';
import { Customer, getCustomers, createCustomer, updateCustomer, deleteCustomer, searchCustomers } from '@/services/customers/customers.service';

export default function CustomersDashboard() {
  const [mounted, setMounted] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { addActivity } = useClientStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '', status: 'Active' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const data = await getCustomers();
      setCustomers(data);
    } catch (err: unknown) {
      console.error('Error loading customers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch customers');
    } finally {
      setLoading(false);
      setMounted(true);
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      return loadData();
    }
    try {
      setLoading(true);
      const data = await searchCustomers(searchQuery);
      setCustomers(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData({ name: '', email: '', phone: '', company: '', status: 'Active' });
    setIsAddModalOpen(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({ name: c.name, email: c.email || '', phone: c.phone || '', company: c.company || '', status: c.status || 'Active' });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await deleteCustomer(id);
      addActivity(`Deleted customer ${name}`, 'customers');
      loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isAddModalOpen) {
        const newCustomer = await createCustomer(formData);
        addActivity(`Added customer ${newCustomer.name}`, 'customers');
      } else if (isEditModalOpen && editingCustomer) {
        const updated = await updateCustomer(editingCustomer.id, formData);
        addActivity(`Updated customer ${updated.name}`, 'customers');
      }
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      loadData();
    } catch (err: unknown) {
      console.error('Submit Error:', err);
      const supabaseErr = err as { code?: string; message?: string; details?: string; hint?: string };
      if (supabaseErr.code || supabaseErr.details || supabaseErr.hint) {
        console.error('Code:', supabaseErr.code);
        console.error('Message:', supabaseErr.message);
        console.error('Details:', supabaseErr.details);
        console.error('Hint:', supabaseErr.hint);
        alert(`Supabase Error [${supabaseErr.code}]: ${supabaseErr.message}\nDetails: ${supabaseErr.details}\nHint: ${supabaseErr.hint}`);
      } else {
        alert(err instanceof Error ? err.message : 'Operation failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="space-y-6 animate-pulse">
         <div className="h-16 bg-slate-900/50 rounded-2xl border border-white/5" />
         <div className="h-96 bg-slate-900/50 rounded-2xl border border-white/5" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 text-left relative">
      {error && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/40 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
        <form onSubmit={handleSearch} className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
          />
        </form>
        <button
          onClick={openAddModal}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      {/* Customers List */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Company</th>
                <th className="pb-3 pr-4">Contact</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 text-sm">No customers found.</td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-3 pr-4 font-semibold text-slate-200">{c.name}</td>
                    <td className="py-3 pr-4 text-slate-400">{c.company || '-'}</td>
                    <td className="py-3 pr-4 text-slate-400 text-xs">
                      <div>{c.email || '-'}</div>
                      <div className="text-slate-500">{c.phone || '-'}</div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${c.status === 'Active' ? 'bg-green-500/10 text-green-400' : 'bg-slate-800 text-slate-400'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 text-right space-x-2">
                      <button onClick={() => openEditModal(c)} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-all opacity-0 group-hover:opacity-100">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(c.id, c.name)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {isAddModalOpen ? 'Add New Customer' : 'Edit Customer'}
              </h2>
              <button 
                onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Name *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Phone</label>
                <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Company</label>
                <input type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Lead">Lead</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all">
                  {isSubmitting ? 'Saving...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
