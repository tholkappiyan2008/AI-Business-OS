"use client";

import React, { useEffect, useState } from 'react';
import { useClientStore } from '@/hooks/useClientStore';
import { ShoppingCart, Search, Plus, Edit2, Trash2, X } from 'lucide-react';
import { UnifiedProduct, getProducts, createProduct, updateProduct, deleteProduct, searchProducts } from '@/services/inventory/inventory.service';

export default function InventoryDashboard() {
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<UnifiedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { addActivity } = useClientStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<UnifiedProduct | null>(null);
  
  const initialForm = {
    product_name: '', sku: '', category: 'General', supplier: '', 
    quantity: 0, cost_price: 0, selling_price: 0, reorder_level: 0
  };
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (err: unknown) {
      console.error('Error loading inventory:', err);
      setError(err instanceof Error ? err.message : JSON.stringify(err, null, 2));
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
      const data = await searchProducts(searchQuery);
      setProducts(data);
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

  const openEditModal = (p: UnifiedProduct) => {
    setEditingProduct(p);
    setFormData({
      product_name: p.product_name,
      sku: p.sku,
      category: p.category,
      supplier: p.supplier,
      quantity: p.quantity,
      cost_price: p.cost_price,
      selling_price: p.selling_price,
      reorder_level: p.reorder_level
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await deleteProduct(id);
      addActivity(`Deleted product ${name}`, 'inventory');
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
        const newProd = await createProduct(formData);
        addActivity(`Added product ${newProd.product_name}`, 'inventory');
      } else if (isEditModalOpen && editingProduct) {
        const updated = await updateProduct(editingProduct.id, formData);
        addActivity(`Updated product ${updated.product_name}`, 'inventory');
      }
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      loadData();
    } catch (err: unknown) {
      console.error('Submit Error:', err);
      const supabaseErr = err as { code?: string; message?: string; details?: string; hint?: string };
      if (supabaseErr.code || supabaseErr.details || supabaseErr.hint) {
        alert(`Supabase Error [${supabaseErr.code}]: ${supabaseErr.message}\nDetails: ${supabaseErr.details}\nHint: ${supabaseErr.hint}`);
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
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-900/50 rounded-xl border border-white/5" />
          ))}
        </div>
        <div className="h-96 bg-slate-900/50 rounded-2xl border border-white/5" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-red-950/20 border border-red-500/30 text-red-400">
        <h3 className="font-bold text-sm">Error Loading Inventory</h3>
        <p className="text-xs mt-1">{error}</p>
      </div>
    );
  }

  const lowStockCount = products.filter(p => p.quantity <= p.reorder_level).length;

  return (
    <div className="space-y-6 pb-12 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products, SKU, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </form>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Warehouse SKU Count</p>
          <p className="text-xl font-bold text-white mt-1">{products.length} Active SKUs</p>
          <span className="text-[9px] text-slate-400 mt-2 inline-block">Real-time database sync</span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Low Stock Warnings</p>
          <p className="text-xl font-bold text-white mt-1">{lowStockCount} Flags</p>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full mt-2 inline-block ${
            lowStockCount > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-green-500/10 text-green-400'
          }`}>
            {lowStockCount > 0 ? 'Restock suggested' : 'Stock levels optimal'}
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Avg Supplier Lead Time</p>
          <p className="text-xl font-bold text-white mt-1">N/A</p>
          <span className="text-[9px] text-slate-500 mt-2 inline-block">Pending PO Module</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Warehouse Inventory Levels</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Live stock counting and safety levels</p>
          </div>

          <div className="overflow-x-auto">
            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-slate-400">No products found.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 font-semibold uppercase text-[9px] tracking-wider">
                    <th className="pb-3 pr-2">Product Name</th>
                    <th className="pb-3 pr-2">SKU</th>
                    <th className="pb-3 pr-2">Stock Level</th>
                    <th className="pb-3 pr-2">Supplier</th>
                    <th className="pb-3 pr-2">Price</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map((prod) => {
                    const isLow = prod.quantity <= prod.reorder_level;
                    return (
                      <tr key={prod.id} className="hover:bg-white/5 transition-colors group">
                        <td className="py-3 pr-2 text-slate-300 font-semibold">{prod.product_name}</td>
                        <td className="py-3 pr-2 font-mono text-slate-500 text-[10px]">{prod.sku}</td>
                        <td className="py-3 pr-2 font-bold text-white">
                          {prod.quantity} units
                          {isLow && <span className="ml-2 text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded">LOW</span>}
                        </td>
                        <td className="py-3 pr-2 text-slate-400">{prod.supplier}</td>
                        <td className="py-3 pr-2 text-slate-300">${prod.selling_price.toFixed(2)}</td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditModal(prod)} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDelete(prod.id, prod.product_name)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4 text-blue-400" /> Procurement Orders
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">PO management coming soon</p>
            </div>

            <div className="text-center py-12">
               <p className="text-xs text-slate-500">No active purchase orders.</p>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 relative">
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-white mb-6">
              {isAddModalOpen ? 'Add New Product' : 'Edit Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-sm text-slate-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Product Name</label>
                  <input
                    required
                    type="text"
                    value={formData.product_name}
                    onChange={e => setFormData({ ...formData, product_name: e.target.value })}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">SKU</label>
                  <input
                    required
                    type="text"
                    value={formData.sku}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Category</label>
                  <input
                    required
                    type="text"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Supplier</label>
                  <input
                    required
                    type="text"
                    value={formData.supplier}
                    onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Quantity</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Reorder Level</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.reorder_level}
                    onChange={e => setFormData({ ...formData, reorder_level: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Cost Price</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost_price}
                    onChange={e => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Selling Price</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.selling_price}
                    onChange={e => setFormData({ ...formData, selling_price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
