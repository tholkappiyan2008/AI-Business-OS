"use client";

import React, { useEffect, useState } from 'react';
import { useClientStore } from '@/hooks/useClientStore';
import { MOCK_INVENTORY_ITEMS, MOCK_PURCHASE_ORDERS } from '@/data/mockData';
import { FileClock, ShoppingCart, Check } from 'lucide-react';
import { getInventory } from '@/services/inventory/inventory.service';

export default function InventoryDashboard() {
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState(MOCK_INVENTORY_ITEMS);
  const [purchaseOrders, setPurchaseOrders] = useState(MOCK_PURCHASE_ORDERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addActivity } = useClientStore();

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getInventory();
        if (data && data.length > 0) {
          const mapped = data.map(item => ({
            id: item.id,
            name: item.product?.name || 'Unknown Product',
            sku: item.product?.sku || 'N/A',
            stock: Number(item.quantity),
            safetyLevel: Number(item.reorder_point),
            status: Number(item.quantity) <= Number(item.reorder_point) ? 'Low Stock' : 'Healthy',
            supplier: 'TechParts Corp'
          }));
          setProducts(mapped);
        }
      } catch (err: unknown) {
        console.error('Error loading inventory:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch inventory');
      } finally {
        setLoading(false);
        setMounted(true);
      }
    }
    loadData();
  }, []);

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

  // Handle restock approval
  const handleApproveRestock = (poId: string, itemSku: string) => {
    // 1. Update purchase order status
    setPurchaseOrders(prev =>
      prev.map(po => (po.id === poId ? { ...po, status: 'In Transit' } : po))
    );

    // 2. Locate product name and update its stock
    setProducts(prev =>
      prev.map(prod => {
        if (prod.sku === itemSku || prod.name.includes('Model-B')) {
          return {
            ...prod,
            stock: prod.stock + 200,
            status: 'Healthy'
          };
        }
        return prod;
      })
    );

    const po = purchaseOrders.find(p => p.id === poId);
    if (po) {
      addActivity(`Approved Purchase Order ${po.id} for 200 units of ${po.item}`, 'inventory');
    }
  };

  // Find low stock items count
  const lowStockCount = products.filter(p => p.status === 'Low Stock' || p.status === 'Critical').length;

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* Inventory KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Warehouse SKU Count</p>
          <p className="text-xl font-bold text-white mt-1">{products.length} Active SKUs</p>
          <span className="text-[9px] text-slate-400 mt-2 inline-block">Managed across 2 warehouses</span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Low Stock Warnings</p>
          <p className="text-xl font-bold text-white mt-1">{lowStockCount} Flags</p>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full mt-2 inline-block ${
            lowStockCount > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-green-500/10 text-green-400'
          }`}>
            {lowStockCount > 0 ? 'AI Restock suggested' : 'Stock levels optimal'}
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Avg Supplier Lead Time</p>
          <p className="text-xl font-bold text-white mt-1">4.2 Days</p>
          <span className="text-[9px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full mt-2 inline-block font-mono">
            Attribution: Inventory Agent
          </span>
        </div>
      </div>

      {/* Main Grid: Products Table and Active Purchase Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Ledger */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Warehouse Inventory Levels</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Real-time stock counting, safety levels, and vendor labels</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 font-semibold uppercase text-[9px] tracking-wider">
                  <th className="pb-3 pr-2">Product Name</th>
                  <th className="pb-3 pr-2">SKU</th>
                  <th className="pb-3 pr-2">Stock Level</th>
                  <th className="pb-3 pr-2">Safety Level</th>
                  <th className="pb-3 pr-2">Supplier</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map((prod) => {
                  const isHealthy = prod.status === 'Healthy';
                  const isLow = prod.status === 'Low Stock';
                  return (
                    <tr key={prod.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 pr-2 text-slate-300 font-semibold">{prod.name}</td>
                      <td className="py-3 pr-2 font-mono text-slate-500 text-[10px]">{prod.sku}</td>
                      <td className="py-3 pr-2 font-bold text-white">{prod.stock} units</td>
                      <td className="py-3 pr-2 text-slate-500">{prod.safetyLevel} units</td>
                      <td className="py-3 pr-2 text-slate-400">{prod.supplier}</td>
                      <td className="py-3 text-right">
                        <span className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                          isHealthy
                            ? 'bg-green-500/10 text-green-400'
                            : isLow
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}>
                          {prod.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Purchase Orders Sidebar */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4 text-blue-400" /> Procurement Orders
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">PO drafts generated by Supply Agent</p>
            </div>

            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
              {purchaseOrders.map((po) => {
                const isDraft = po.status === 'Drafting (AI)';
                return (
                  <div key={po.id} className="p-3.5 rounded-xl border border-white/5 bg-slate-900/40 space-y-2 text-left">
                    <div className="flex items-start justify-between">
                      <span className="font-mono text-[9px] text-slate-500 font-semibold">{po.id}</span>
                      <span className={`inline-block text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        isDraft
                          ? 'bg-blue-500/10 text-blue-400'
                          : po.status === 'In Transit'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-green-500/10 text-green-400'
                      }`}>
                        {po.status}
                      </span>
                    </div>
                    
                    <div>
                      <p className="text-xs font-bold text-white">{po.item}</p>
                      <p className="text-[9px] text-slate-400">Qty: {po.qty} units &bull; Supplier: {po.supplier}</p>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-white/5">
                      <span className="text-[10px] font-bold text-white">{po.cost}</span>
                      {isDraft ? (
                        <button
                          onClick={() => handleApproveRestock(po.id, 'SENS-MDLB-09')}
                          className="px-2 py-1 text-[9px] font-bold rounded bg-blue-600 hover:bg-blue-500 text-white transition-all inline-flex items-center gap-0.5"
                        >
                          Approve <Check className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-[9px] text-slate-500 flex items-center gap-0.5">
                          <FileClock className="w-3.5 h-3.5" /> Sent
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
