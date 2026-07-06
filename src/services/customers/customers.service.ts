import { getBrowserSupabaseClient as getSupabaseClient, getBrowserActiveBusinessId as getActiveBusinessId } from '../clientHelper';

export interface Customer {
  id: string;
  business_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  address: Record<string, string | number | null> | null;
  created_at: string;
  updated_at: string;
}

export async function getCustomers(): Promise<Customer[]> {
  const supabase = await getSupabaseClient();
  const businessId = await getActiveBusinessId();
  if (!businessId) return [];

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createCustomer(customer: Omit<Customer, 'id' | 'business_id' | 'created_at' | 'updated_at'>): Promise<Customer> {
  const supabase = await getSupabaseClient();
  const businessId = await getActiveBusinessId();
  if (!businessId) throw new Error('No active business ID');

  const { data, error } = await supabase
    .from('customers')
    .insert({
      ...customer,
      business_id: businessId
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function updateCustomer(id: string, customer: Partial<Omit<Customer, 'id' | 'business_id' | 'created_at' | 'updated_at'>>): Promise<Customer> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from('customers')
    .update(customer)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}
