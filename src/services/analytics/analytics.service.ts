import { getBrowserSupabaseClient as getSupabaseClient, getBrowserActiveBusinessId as getActiveBusinessId } from '../clientHelper';

export async function calculateRevenue(): Promise<number> {
  const supabase = await getSupabaseClient();
  const businessId = await getActiveBusinessId();
  if (!businessId) return 0;

  const { data: orders, error } = await supabase
    .from('orders')
    .select('total')
    .eq('business_id', businessId);

  if (error) throw error;
  return orders?.reduce((sum, o) => sum + Number(o.total || 0), 0) || 0;
}

export async function calculateProfit(): Promise<number> {
  const supabase = await getSupabaseClient();
  const businessId = await getActiveBusinessId();
  if (!businessId) return 0;

  // Revenue
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('total')
    .eq('business_id', businessId);

  if (ordersError) throw ordersError;
  const revenue = orders?.reduce((sum, o) => sum + Number(o.total || 0), 0) || 0;

  // Expenses
  const { data: expenses, error: expensesError } = await supabase
    .from('expenses')
    .select('amount')
    .eq('business_id', businessId);

  if (expensesError) throw expensesError;
  const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount || 0), 0) || 0;

  return revenue - totalExpenses;
}

export async function calculateMonthlyGrowth(): Promise<number> {
  const supabase = await getSupabaseClient();
  const businessId = await getActiveBusinessId();
  if (!businessId) return 0;

  const now = new Date();
  const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

  // Revenue this month
  const { data: thisMonthOrders, error: thisError } = await supabase
    .from('orders')
    .select('total')
    .eq('business_id', businessId)
    .gte('created_at', firstDayThisMonth);

  if (thisError) throw thisError;
  const revenueThisMonth = thisMonthOrders?.reduce((sum, o) => sum + Number(o.total || 0), 0) || 0;

  // Revenue last month
  const { data: lastMonthOrders, error: lastError } = await supabase
    .from('orders')
    .select('total')
    .eq('business_id', businessId)
    .gte('created_at', firstDayLastMonth)
    .lt('created_at', firstDayThisMonth);

  if (lastError) throw lastError;
  const revenueLastMonth = lastMonthOrders?.reduce((sum, o) => sum + Number(o.total || 0), 0) || 0;

  if (revenueLastMonth === 0) {
    return revenueThisMonth > 0 ? 100 : 0;
  }

  return ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100;
}
