import { getServerSupabaseClient, getServerActiveBusinessId } from '../serverHelper';
import { Order } from './orders.service';

export async function getServerOrders(): Promise<Order[]> {
  const supabase = await getServerSupabaseClient();
  const businessId = await getServerActiveBusinessId();
  if (!businessId) return [];

  const { data, error } = await supabase
    .from('orders')
    .select('*, customer:customers(first_name, last_name)')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Map DB customer shape to UI shape
  return (data || []).map((order: Record<string, unknown>) => {
    const cust = order.customer as { first_name?: string; last_name?: string } | null;
    return {
      ...order,
      customer: cust ? { name: `${cust.first_name || ''} ${cust.last_name || ''}`.trim() } : null
    };
  }) as Order[];
}
