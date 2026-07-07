"use client";

import React, { useEffect, useState } from 'react';
import { useClientStore } from '@/hooks/useClientStore';
import { Search, Plus, Edit2, Trash2, X, ShoppingCart } from 'lucide-react';
import { Order, OrderStatus, getOrders, createOrder, updateOrderStatus, deleteOrder, searchOrders } from '@/services/orders/orders.service';
import { getCustomers, Customer } from '@/services/customers/customers.service';
import { getProducts, UnifiedProduct } from '@/services/inventory/inventory.service';

export default function OrderManagementDashboard() {
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<UnifiedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { addActivity } = useClientStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for creating an order
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [orderItems, setOrderItems] = useState<{ product_id: string; quantity: number }[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [ordersData, customersData, productsData] = await Promise.all([
        getOrders(),
        getCustomers(),
        getProducts()
      ]);
      setOrders(ordersData);
      setCustomers(customersData);
      setProducts(productsData);
    } catch (err: unknown) {
      console.error('Error loading data:', err);
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
      const data = await searchOrders(searchQuery);
      setOrders(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setSelectedCustomerId('');
    setOrderItems([{ product_id: '', quantity: 1 }]);
    setIsAddModalOpen(true);
  };

  const openEditModal = (o: Order) => {
    setEditingOrder(o);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string, orderNum: string) => {
    if (!confirm(`Are you sure you want to delete order ${orderNum}?`)) return;
    try {
      await deleteOrder(id);
      addActivity(`Deleted order ${orderNum}`, 'sales');
      loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : JSON.stringify(err, null, 2));
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) return alert('Please select a customer.');
    if (orderItems.some(i => !i.product_id || i.quantity <= 0)) return alert('Please complete all product rows.');

    setIsSubmitting(true);
    try {
      // Calculate totals
      let subtotal = 0;
      const formattedItems = orderItems.map(item => {
        const prod = products.find(p => p.id === item.product_id);
        const price = prod ? prod.selling_price : 0;
        subtotal += price * item.quantity;
        return {
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: price
        };
      });

      const tax = subtotal * 0.00; // 0% tax for MVP
      const total = subtotal + tax;

      const newOrder = await createOrder({
        customer_id: selectedCustomerId,
        subtotal,
        tax,
        total,
        items: formattedItems
      });

      addActivity(`Created order ${newOrder.order_number}`, 'sales');
      setIsAddModalOpen(false);
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

  const handleEditStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    setIsSubmitting(true);
    try {
      await updateOrderStatus(editingOrder.id, editingOrder.status);
      addActivity(`Updated order ${editingOrder.order_number} status`, 'sales');
      setIsEditModalOpen(false);
      loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : JSON.stringify(err, null, 2));
    } finally {
      setIsSubmitting(false);
    }
  };

  const addOrderItemRow = () => {
    setOrderItems([...orderItems, { product_id: '', quantity: 1 }]);
  };

  const updateOrderItem = (index: number, field: string, value: string | number) => {
    const newItems = [...orderItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setOrderItems(newItems);
  };

  const removeOrderItem = (index: number) => {
    if (orderItems.length <= 1) return;
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'delivered': return 'bg-green-500/10 text-green-400';
      case 'shipped': return 'bg-blue-500/10 text-blue-400';
      case 'cancelled': return 'bg-red-500/10 text-red-400';
      case 'pending': return 'bg-amber-500/10 text-amber-400';
      default: return 'bg-slate-500/10 text-slate-400';
    }
  };

  if (!mounted || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-slate-900/50 rounded-xl border border-white/5" />
        <div className="h-96 bg-slate-900/50 rounded-2xl border border-white/5" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-red-950/20 border border-red-500/30 text-red-400">
        <h3 className="font-bold text-sm">Error Loading Orders</h3>
        <p className="text-xs mt-1">{error}</p>
      </div>
    );
  }

  // Calculate live summary metrics
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const totalPending = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="space-y-6 pb-12 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search orders, customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </form>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Order
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Sales Revenue</p>
          <p className="text-xl font-bold text-white mt-1">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <span className="text-[9px] text-slate-400 mt-2 inline-block">All time</span>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Orders</p>
          <p className="text-xl font-bold text-white mt-1">{orders.length}</p>
          <span className="text-[9px] text-slate-400 mt-2 inline-block">Lifetime volume</span>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pending Orders</p>
          <p className="text-xl font-bold text-white mt-1">{totalPending}</p>
          <span className="text-[9px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full mt-2 inline-block">
            Needs fulfillment
          </span>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
            <ShoppingCart className="w-4 h-4 text-blue-400" /> Order Management List
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Live transactional records</p>
        </div>

        <div className="overflow-x-auto">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-slate-400">No orders found.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 font-semibold uppercase text-[9px] tracking-wider">
                  <th className="pb-3 pr-2">Order #</th>
                  <th className="pb-3 pr-2">Customer</th>
                  <th className="pb-3 pr-2">Date</th>
                  <th className="pb-3 pr-2">Total</th>
                  <th className="pb-3 pr-2">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-3 pr-2 font-mono text-slate-300 font-semibold">{order.order_number}</td>
                    <td className="py-3 pr-2 text-white">{order.customer?.name || 'Unknown Customer'}</td>
                    <td className="py-3 pr-2 text-slate-400">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="py-3 pr-2 text-slate-300">${Number(order.total).toFixed(2)}</td>
                    <td className="py-3 pr-2">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(order)} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Edit Status">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(order.id, order.order_number)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete Order">
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

      {/* CREATE ORDER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-2xl rounded-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-white mb-6">Create New Order</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-6 text-sm text-slate-300">
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Select Customer</label>
                <select
                  required
                  value={selectedCustomerId}
                  onChange={e => setSelectedCustomerId(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
                >
                  <option value="" disabled>Select a customer...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email || 'No email'})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <label className="text-xs font-semibold text-slate-400">Order Items (Reduces Inventory)</label>
                </div>
                
                {orderItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <select
                      required
                      value={item.product_id}
                      onChange={e => updateOrderItem(idx, 'product_id', e.target.value)}
                      className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
                    >
                      <option value="" disabled>Select product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.product_name} - ${p.selling_price} ({p.quantity} in stock)
                        </option>
                      ))}
                    </select>
                    <input
                      required
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={e => updateOrderItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-24 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => removeOrderItem(idx)}
                      disabled={orderItems.length === 1}
                      className="p-2 text-slate-500 hover:text-red-400 disabled:opacity-30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addOrderItemRow}
                  className="text-xs text-blue-400 font-semibold hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add another item
                </button>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STATUS MODAL */}
      {isEditModalOpen && editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-sm rounded-2xl p-6 relative">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-white mb-6">Update Order Status</h2>
            <p className="text-xs text-slate-400 mb-4">Order: <span className="font-mono text-white">{editingOrder.order_number}</span></p>
            <form onSubmit={handleEditStatusSubmit} className="space-y-6 text-sm text-slate-300">
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Status</label>
                <select
                  required
                  value={editingOrder.status}
                  onChange={e => setEditingOrder({ ...editingOrder, status: e.target.value as OrderStatus })}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
                >
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
