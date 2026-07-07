import { getBrowserSupabaseClient as getSupabaseClient, getBrowserActiveBusinessId as getActiveBusinessId } from '../clientHelper';

export interface MonthlyDataPoint {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface TopProduct {
  name: string;
  sku: string;
  total_sold: number;
  total_revenue: number;
}

export interface TopCustomer {
  name: string;
  order_count: number;
  total_spent: number;
}

export interface LowStockProduct {
  name: string;
  sku: string;
  quantity: number;
  reorder_level: number;
}

export interface AnalyticsData {
  monthlyData: MonthlyDataPoint[];
  topProducts: TopProduct[];
  topCustomers: TopCustomer[];
  lowStockProducts: LowStockProduct[];
  totalRevenue: number;
  totalExpenses: number;
  totalOrders: number;
  totalCustomers: number;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getLastNMonths(n: number): { label: string; year: number; month: number }[] {
  const result = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({
      label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`,
      year: d.getFullYear(),
      month: d.getMonth()
    });
  }
  return result;
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  const supabase = getSupabaseClient();
  const businessId = await getActiveBusinessId();
  if (!businessId) {
    return {
      monthlyData: [], topProducts: [], topCustomers: [],
      lowStockProducts: [], totalRevenue: 0, totalExpenses: 0,
      totalOrders: 0, totalCustomers: 0
    };
  }

  // Fetch all needed data in parallel
  const [ordersRes, expensesRes, orderItemsRes, inventoryRes, customersCountRes] = await Promise.all([
    supabase
      .from('orders')
      .select('id, total, status, customer_id, created_at, customer:customers(first_name, last_name)')
      .eq('business_id', businessId),
    supabase
      .from('expenses')
      .select('amount, expense_date')
      .eq('business_id', businessId),
    supabase
      .from('order_items')
      .select('product_id, quantity, line_total, product:products(name, sku)')
      .eq('business_id', businessId),
    supabase
      .from('inventory')
      .select('quantity, reorder_point, product:products(name, sku)')
      .eq('business_id', businessId),
    supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
  ]);

  if (ordersRes.error) throw ordersRes.error;
  if (expensesRes.error) throw expensesRes.error;
  if (orderItemsRes.error) throw orderItemsRes.error;
  if (inventoryRes.error) throw inventoryRes.error;

  const orders = ordersRes.data || [];
  const expenses = expensesRes.data || [];
  const orderItems = orderItemsRes.data || [];
  const inventory = inventoryRes.data || [];
  const totalCustomers = customersCountRes.count || 0;

  // ── Monthly Data (last 6 months) ──────────────────────────────
  const months = getLastNMonths(6);
  const monthlyData: MonthlyDataPoint[] = months.map(({ label, year, month }) => {
    const monthRevenue = orders
      .filter(o => {
        const d = new Date(o.created_at);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .reduce((s, o) => s + Number(o.total || 0), 0);

    const monthExpenses = expenses
      .filter(e => {
        const d = new Date(e.expense_date);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .reduce((s, e) => s + Number(e.amount || 0), 0);

    return {
      month: label,
      revenue: monthRevenue,
      expenses: monthExpenses,
      profit: monthRevenue - monthExpenses
    };
  });

  // ── Top Selling Products ──────────────────────────────────────
  const productMap: Record<string, { name: string; sku: string; total_sold: number; total_revenue: number }> = {};
  orderItems.forEach(item => {
    const pid = item.product_id;
    if (!pid) return;
    const prod = item.product as { name?: string; sku?: string } | null;
    if (!productMap[pid]) {
      productMap[pid] = {
        name: prod?.name || 'Unknown',
        sku: prod?.sku || '—',
        total_sold: 0,
        total_revenue: 0
      };
    }
    productMap[pid].total_sold += Number(item.quantity || 0);
    productMap[pid].total_revenue += Number(item.line_total || 0);
  });

  const topProducts: TopProduct[] = Object.values(productMap)
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, 5);

  // ── Top Customers ─────────────────────────────────────────────
  const custMap: Record<string, { name: string; order_count: number; total_spent: number }> = {};
  orders.forEach(order => {
    if (!order.customer_id) return;
    const cust = order.customer as { first_name?: string; last_name?: string } | null;
    const name = cust ? `${cust.first_name || ''} ${cust.last_name || ''}`.trim() : 'Unknown';
    if (!custMap[order.customer_id]) {
      custMap[order.customer_id] = { name, order_count: 0, total_spent: 0 };
    }
    custMap[order.customer_id].order_count += 1;
    custMap[order.customer_id].total_spent += Number(order.total || 0);
  });

  const topCustomers: TopCustomer[] = Object.values(custMap)
    .sort((a, b) => b.total_spent - a.total_spent)
    .slice(0, 5);

  // ── Low Stock Products ────────────────────────────────────────
  const lowStockProducts: LowStockProduct[] = inventory
    .filter(i => Number(i.quantity) <= Number(i.reorder_point))
    .map(i => {
      const prod = i.product as { name?: string; sku?: string } | null;
      return {
        name: prod?.name || 'Unknown',
        sku: prod?.sku || '—',
        quantity: Number(i.quantity),
        reorder_level: Number(i.reorder_point)
      };
    })
    .slice(0, 10);

  // ── Totals ────────────────────────────────────────────────────
  const totalRevenue = orders.reduce((s, o) => s + Number(o.total || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const totalOrders = orders.length;

  return {
    monthlyData,
    topProducts,
    topCustomers,
    lowStockProducts,
    totalRevenue,
    totalExpenses,
    totalOrders,
    totalCustomers
  };
}
