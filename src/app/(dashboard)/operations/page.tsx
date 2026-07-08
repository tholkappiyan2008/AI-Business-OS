"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useClientStore } from '@/hooks/useClientStore';
import { Server, Terminal, CheckCircle2, AlertCircle, Plus, Search, Edit2, Trash2, Clock, Calendar } from 'lucide-react';
import {
  getOperations,
  createOperation,
  updateOperation,
  deleteOperation,
  getOperationLogs,
  Operation,
  OperationLog
} from '@/services/operations/operations.service';

export default function OperationsDashboard() {
  const [mounted, setMounted] = useState(false);
  const { addActivity } = useClientStore();

  const [operations, setOperations] = useState<Operation[]>([]);
  const [logs, setLogs] = useState<OperationLog[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    assigned_to: '',
    priority: 'Medium',
    status: 'Pending',
    due_date: ''
  });

  const fetchData = async () => {
    try {
      const [ops, lg] = await Promise.all([
        getOperations(),
        getOperationLogs()
      ]);
      setOperations(ops);
      setLogs(lg);
    } catch (err) {
      console.error('Failed to fetch operations data:', err);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const kpis = useMemo(() => {
    let pending = 0;
    let completedToday = 0;
    let overdue = 0;
    let highPriority = 0;

    const todayStr = new Date().toISOString().split('T')[0];

    operations.forEach(op => {
      if (op.status === 'Pending') pending++;
      
      if (op.status === 'Completed' && op.updated_at.startsWith(todayStr)) {
        completedToday++;
      }

      if (op.priority === 'High' && op.status !== 'Completed') {
        highPriority++;
      }

      if (op.due_date && op.status !== 'Completed') {
        const due = new Date(op.due_date);
        const now = new Date();
        if (due < now) overdue++;
      }
    });

    return { pending, completedToday, overdue, highPriority };
  }, [operations]);

  const filteredOperations = useMemo(() => {
    return operations.filter(op => {
      if (statusFilter !== 'All' && op.status !== statusFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!op.title.toLowerCase().includes(query) && 
            !op.assigned_to.toLowerCase().includes(query) &&
            !op.department.toLowerCase().includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [operations, statusFilter, searchQuery]);

  const openModal = (op?: Operation) => {
    if (op) {
      setEditingId(op.id);
      setFormData({
        title: op.title,
        department: op.department,
        assigned_to: op.assigned_to,
        priority: op.priority,
        status: op.status,
        due_date: op.due_date ? new Date(op.due_date).toISOString().split('T')[0] : ''
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        department: '',
        assigned_to: '',
        priority: 'Medium',
        status: 'Pending',
        due_date: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        department: formData.department,
        assigned_to: formData.assigned_to,
        priority: formData.priority,
        status: formData.status,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null
      };

      if (editingId) {
        await updateOperation(editingId, payload);
        addActivity(`Updated operation: ${formData.title}`, 'operations');
      } else {
        await createOperation(payload);
        addActivity(`Created operation: ${formData.title}`, 'operations');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to save operation:', err);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm('Delete this operation?')) return;
    try {
      await deleteOperation(id);
      addActivity(`Deleted operation: ${title}`, 'operations');
      fetchData();
    } catch (err) {
      console.error('Failed to delete operation:', err);
    }
  };

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-900/50 rounded-xl border border-white/5" />
          ))}
        </div>
        <div className="h-96 bg-slate-900/50 rounded-2xl border border-white/5" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 text-left relative">
      {/* KPI Core Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pending Tasks</p>
          <p className="text-xl font-bold text-white mt-1">{kpis.pending}</p>
          <span className="text-[9px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full mt-2 inline-block">
            In queue
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Completed Today</p>
          <p className="text-xl font-bold text-white mt-1">{kpis.completedToday}</p>
          <span className="text-[9px] text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded-full mt-2 inline-block">
            Finished
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Overdue Tasks</p>
          <p className="text-xl font-bold text-white mt-1">{kpis.overdue}</p>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full mt-2 inline-block ${kpis.overdue > 0 ? 'text-red-400 bg-red-500/10' : 'text-slate-400 bg-slate-500/10'}`}>
            Requires attention
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">High Priority Tasks</p>
          <p className="text-xl font-bold text-white mt-1">{kpis.highPriority}</p>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full mt-2 inline-block ${kpis.highPriority > 0 ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 bg-slate-500/10'}`}>
            Critical focus
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Operations Ledger (Columns 1-2) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Active Operations</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Manage and track business tasks across departments</p>
            </div>
            <button
              onClick={() => openModal()}
              className="glow-btn px-4 py-2 bg-blue-600 hover:bg-blue-500 text-[10px] font-bold text-white rounded-lg shadow shadow-blue-500/10 flex items-center gap-1.5 transition-all whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" /> Add Operation
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search operations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-white/5 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-900 border border-white/5 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {filteredOperations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-slate-400 font-medium">No operations found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 font-semibold uppercase text-[9px] tracking-wider">
                    <th className="pb-3 pr-2">Title</th>
                    <th className="pb-3 pr-2">Department</th>
                    <th className="pb-3 pr-2">Assigned To</th>
                    <th className="pb-3 pr-2">Priority</th>
                    <th className="pb-3 pr-2">Status</th>
                    <th className="pb-3 pr-2">Due Date</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredOperations.map((op) => (
                    <tr key={op.id} className="group hover:bg-white/5 transition-colors">
                      <td className="py-3 pr-2 font-semibold text-slate-200">{op.title}</td>
                      <td className="py-3 pr-2 text-slate-400">{op.department}</td>
                      <td className="py-3 pr-2 text-slate-400">{op.assigned_to}</td>
                      <td className="py-3 pr-2">
                        <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          op.priority === 'High' ? 'bg-amber-500/10 text-amber-400' :
                          op.priority === 'Low' ? 'bg-slate-500/10 text-slate-400' :
                          'bg-blue-500/10 text-blue-400'
                        }`}>
                          {op.priority}
                        </span>
                      </td>
                      <td className="py-3 pr-2">
                        <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          op.status === 'Completed' ? 'bg-green-500/10 text-green-400' :
                          op.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400' :
                          'bg-slate-500/10 text-slate-400'
                        }`}>
                          {op.status}
                        </span>
                      </td>
                      <td className="py-3 pr-2 text-slate-500">
                        {op.due_date ? new Date(op.due_date).toLocaleDateString() : 'None'}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => openModal(op)}
                          className="p-1 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors mr-1"
                          title="Edit Operation"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(op.id, op.title)}
                          className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                          title="Delete Operation"
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

        {/* Telemetry log timeline (Column 3) */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 min-h-[300px]">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-blue-400" /> Operations Timeline
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Real-time execution telemetries</p>
          </div>

          <div className="space-y-4">
            {logs.length === 0 ? (
              <p className="text-xs text-slate-500">No activity logged yet.</p>
            ) : (
              logs.map((log, i) => {
                const isSuccess = log.action === 'Operation Completed';
                const isWarning = log.action === 'Operation Updated';
                return (
                  <div key={log.id} className="flex gap-3 text-xs">
                    <span className="font-mono text-[9px] text-slate-500 whitespace-nowrap w-12 pt-0.5">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className="flex flex-col items-center">
                      <div className="z-10 flex items-center justify-center pt-0.5">
                        {isSuccess ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-400 bg-slate-950 rounded-full" />
                        ) : isWarning ? (
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400 bg-slate-950 rounded-full" />
                        ) : (
                          <Server className="w-3.5 h-3.5 text-blue-400 bg-slate-950 rounded-full" />
                        )}
                      </div>
                      {i !== logs.length - 1 && (
                        <div className="w-px h-full min-h-[24px] bg-white/5 mt-1" />
                      )}
                    </div>
                    <div className="text-left space-y-0.5 pb-2">
                      <p className="font-semibold text-white text-[11px]">{log.action}</p>
                      <p className="text-[10px] text-slate-400">{log.details}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingId ? 'Edit Operation' : 'Add New Operation'}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                  placeholder="e.g. Q3 Server Migration"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                    placeholder="e.g. Engineering"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Assigned To</label>
                  <input
                    type="text"
                    required
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                    placeholder="e.g. John Doe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Due Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-lg transition-colors"
                >
                  Save Operation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
