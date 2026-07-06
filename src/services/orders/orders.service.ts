import { getBrowserSupabaseClient as getSupabaseClient, getBrowserActiveBusinessId as getActiveBusinessId } from '../clientHelper';

export interface Order {
  id: string;
  business_id: string;
  customer_id: string | null;
  order_number: string;
  status: 'draft' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  subtotal: number;
  tax: number;
  total: number;
  created_at: string;
  updated_at: string;
  customer?: {
    first_name: string;
    last_name: string;
  } | null;
}

export async function getOrders(): Promise<Order[]> {
  const supabase = await getSupabaseClient();
  const businessId = await getActiveBusinessId();
  if (!businessId) return [];

  const { data, error } = await supabase
    .from('orders')
    .select('*, customer:customers(first_name, last_name)')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
