import { getBrowserSupabaseClient as getSupabaseClient, getBrowserActiveBusinessId as getActiveBusinessId } from '../clientHelper';

export interface InventoryItem {
  id: string;
  business_id: string;
  product_id: string;
  quantity: number;
  reorder_point: number;
  location: string;
  created_at: string;
  updated_at: string;
  product?: {
    name: string;
    sku: string | null;
    price: number;
    cost: number;
  } | null;
}

export async function getInventory(): Promise<InventoryItem[]> {
  const supabase = await getSupabaseClient();
  const businessId = await getActiveBusinessId();
  if (!businessId) return [];

  const { data, error } = await supabase
    .from('inventory')
    .select('*, product:products(name, sku, price, cost)')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
