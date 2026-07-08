import { getServerSupabaseClient, getServerActiveBusinessId } from '../serverHelper';
import { Expense } from './expenses.service';

export async function getServerExpenses(): Promise<Expense[]> {
  const supabase = await getServerSupabaseClient();
  const businessId = await getServerActiveBusinessId();
  if (!businessId) return [];

  const { data, error } = await supabase
    .from('expenses')
    .select('*, supplier:suppliers(name)')
    .eq('business_id', businessId)
    .order('expense_date', { ascending: false });

  if (error) throw error;
  return data || [];
}
