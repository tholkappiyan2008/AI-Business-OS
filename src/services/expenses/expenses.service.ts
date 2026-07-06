import { getBrowserSupabaseClient as getSupabaseClient, getBrowserActiveBusinessId as getActiveBusinessId } from '../clientHelper';

export interface Expense {
  id: string;
  business_id: string;
  supplier_id: string | null;
  category: 'payroll' | 'rent' | 'utilities' | 'marketing' | 'software' | 'supplies' | 'other';
  amount: number;
  description: string | null;
  expense_date: string;
  created_at: string;
  updated_at: string;
  supplier?: {
    name: string;
  } | null;
}

export async function getExpenses(): Promise<Expense[]> {
  const supabase = await getSupabaseClient();
  const businessId = await getActiveBusinessId();
  if (!businessId) return [];

  const { data, error } = await supabase
    .from('expenses')
    .select('*, supplier:suppliers(name)')
    .eq('business_id', businessId)
    .order('expense_date', { ascending: false });

  if (error) throw error;
  return data || [];
}
