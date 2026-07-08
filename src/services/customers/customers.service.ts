import { getBrowserSupabaseClient as getSupabaseClient, getBrowserActiveBusinessId as getActiveBusinessId } from '../clientHelper';
import { notifyCustomerCreated } from '../notifications/notifications.service';

export interface Customer {
  id: string;
  business_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: string;
  created_at: string;
}

interface DBCustomer {
  id: string;
  business_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  address: { company?: string; status?: string } | null;
  created_at: string;
}

function mapFromDB(d: DBCustomer): Customer {
  return {
    id: d.id,
    business_id: d.business_id,
    name: `${d.first_name} ${d.last_name}`.trim(),
    email: d.email,
    phone: d.phone,
    company: d.address?.company || null,
    status: d.address?.status || 'Active',
    created_at: d.created_at
  };
}

export async function getCustomers(): Promise<Customer[]> {
  const supabase = getSupabaseClient();
  const businessId = await getActiveBusinessId();
  if (!businessId) return [];

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapFromDB);
}

export async function searchCustomers(query: string): Promise<Customer[]> {
  const supabase = getSupabaseClient();
  const businessId = await getActiveBusinessId();
  if (!businessId) return [];

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('business_id', businessId)
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapFromDB);
}

export async function createCustomer(customer: Omit<Customer, 'id' | 'business_id' | 'created_at'>): Promise<Customer> {
  const supabase = getSupabaseClient();
  const businessId = await getActiveBusinessId();
  if (!businessId) throw new Error('No active business ID');

  const parts = (customer.name || '').split(' ');
  const first_name = parts[0] || 'Unknown';
  const last_name = parts.slice(1).join(' ') || '-';

  const payload = {
    business_id: businessId,
    first_name,
    last_name,
    email: customer.email || null,
    phone: customer.phone || null,
    address: { company: customer.company || '', status: customer.status || 'Active' }
  };

  const { data, error } = await supabase
    .from('customers')
    .insert(payload)
    .select('*')
    .single();

  if (error) throw error;
  const mapped = mapFromDB(data);

  // Fire notification asynchronously (non-blocking)
  notifyCustomerCreated(mapped.name).catch(console.error);

  return mapped;
}

export async function updateCustomer(id: string, customer: Partial<Omit<Customer, 'id' | 'business_id' | 'created_at'>>): Promise<Customer> {
  const supabase = getSupabaseClient();
  
  const payload: Partial<DBCustomer> = {};
  if (customer.name !== undefined) {
    const parts = (customer.name || '').split(' ');
    payload.first_name = parts[0] || 'Unknown';
    payload.last_name = parts.slice(1).join(' ') || '-';
  }
  if (customer.email !== undefined) payload.email = customer.email;
  if (customer.phone !== undefined) payload.phone = customer.phone;
  if (customer.company !== undefined || customer.status !== undefined) {
    // We would fetch old address to merge, but simpler to just set what we have
    // For robust update we should fetch first, but this works for basic CRM
    const { data: existing } = await supabase.from('customers').select('address').eq('id', id).single();
    payload.address = {
      ...(existing?.address || {}),
      ...(customer.company !== undefined ? { company: customer.company } : {}),
      ...(customer.status !== undefined ? { status: customer.status } : {})
    };
  }

  const { data, error } = await supabase
    .from('customers')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return mapFromDB(data);
}

export async function deleteCustomer(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
