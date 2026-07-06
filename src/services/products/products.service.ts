import { getBrowserSupabaseClient as getSupabaseClient, getBrowserActiveBusinessId as getActiveBusinessId } from '../clientHelper';

export interface Product {
  id: string;
  business_id: string;
  supplier_id: string | null;
  sku: string | null;
  name: string;
  description: string | null;
  price: number;
  cost: number;
  created_at: string;
  updated_at: string;
}

export async function getProducts(): Promise<Product[]> {
  const supabase = await getSupabaseClient();
  const businessId = await getActiveBusinessId();
  if (!businessId) return [];

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createProduct(product: Omit<Product, 'id' | 'business_id' | 'created_at' | 'updated_at'>): Promise<Product> {
  const supabase = await getSupabaseClient();
  const businessId = await getActiveBusinessId();
  if (!businessId) throw new Error('No active business ID');

  const { data, error } = await supabase
    .from('products')
    .insert({
      ...product,
      business_id: businessId
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function updateProduct(id: string, product: Partial<Omit<Product, 'id' | 'business_id' | 'created_at' | 'updated_at'>>): Promise<Product> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}
