import { getBrowserSupabaseClient as getSupabaseClient, getBrowserActiveBusinessId as getActiveBusinessId } from '../clientHelper';
import { notifyExpenseCreated, notifyExpenseApprovalRequired } from '../notifications/notifications.service';

// Expenses above this threshold require approval notification
const APPROVAL_THRESHOLD = 1000;

export type ExpenseCategory = 'payroll' | 'rent' | 'utilities' | 'marketing' | 'software' | 'supplies' | 'other';

export interface Expense {
  id: string;
  business_id: string;
  supplier_id: string | null;
  category: ExpenseCategory;
  amount: number;
  description: string | null;
  expense_date: string;
  created_at: string;
  updated_at: string;
  supplier?: { name: string } | null;
}

export interface CreateExpensePayload {
  category: ExpenseCategory;
  amount: number;
  description: string;
  expense_date: string;
}

export async function getExpenses(): Promise<Expense[]> {
  const supabase = getSupabaseClient();
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



export async function searchExpenses(query: string): Promise<Expense[]> {
  const all = await getExpenses();
  const lower = query.toLowerCase();
  return all.filter(e =>
    (e.description && e.description.toLowerCase().includes(lower)) ||
    e.category.toLowerCase().includes(lower) ||
    (e.supplier?.name && e.supplier.name.toLowerCase().includes(lower))
  );
}

export async function createExpense(payload: CreateExpensePayload): Promise<Expense> {
  const supabase = getSupabaseClient();
  const businessId = await getActiveBusinessId();
  if (!businessId) throw new Error('No active business ID');

  const { data, error } = await supabase
    .from('expenses')
    .insert({ ...payload, business_id: businessId })
    .select('*, supplier:suppliers(name)')
    .single();

  if (error) throw error;

  // Fire notifications asynchronously
  notifyExpenseCreated(payload.category, payload.amount).catch(console.error);
  if (payload.amount >= APPROVAL_THRESHOLD) {
    notifyExpenseApprovalRequired(payload.category, payload.amount, APPROVAL_THRESHOLD).catch(console.error);
  }

  return data;
}


export async function updateExpense(id: string, payload: Partial<CreateExpensePayload>): Promise<Expense> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('expenses')
    .update(payload)
    .eq('id', id)
    .select('*, supplier:suppliers(name)')
    .single();

  if (error) throw error;
  return data;
}

export async function deleteExpense(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
