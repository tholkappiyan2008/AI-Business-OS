import { getBrowserSupabaseClient as getSupabaseClient, getBrowserActiveBusinessId as getActiveBusinessId } from '../clientHelper';

export interface Operation {
  id: string;
  business_id: string;
  title: string;
  department: string;
  assigned_to: string;
  priority: string;
  status: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface OperationLog {
  id: string;
  business_id: string;
  operation_id: string;
  action: string;
  details: string;
  created_at: string;
}

export async function getOperations(): Promise<Operation[]> {
  const supabase = getSupabaseClient();
  const businessId = await getActiveBusinessId();
  if (!businessId) return [];

  const { data, error } = await supabase
    .from('operations')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[OperationsService] Error fetching operations:', error.message);
    throw error;
  }
  return data as Operation[];
}

export async function createOperation(operation: Omit<Operation, 'id' | 'business_id' | 'created_at' | 'updated_at'>): Promise<Operation> {
  const supabase = getSupabaseClient();
  const businessId = await getActiveBusinessId();
  if (!businessId) throw new Error('No active business ID');

  const { data: newOp, error } = await supabase
    .from('operations')
    .insert({ ...operation, business_id: businessId })
    .select('*')
    .single();

  if (error) {
    console.error('[OperationsService] Error creating operation:', error.message);
    throw error;
  }

  // Create log
  await supabase.from('operation_logs').insert({
    business_id: businessId,
    operation_id: newOp.id,
    action: 'Operation Created',
    details: `Created new operation: ${newOp.title}`
  });

  return newOp as Operation;
}

export async function updateOperation(id: string, updates: Partial<Operation>): Promise<Operation> {
  const supabase = getSupabaseClient();
  const businessId = await getActiveBusinessId();
  if (!businessId) throw new Error('No active business ID');

  // get current state to compare status
  const { data: currentOp } = await supabase.from('operations').select('status, title').eq('id', id).single();

  const { data: updatedOp, error } = await supabase
    .from('operations')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('business_id', businessId)
    .select('*')
    .single();

  if (error) {
    console.error('[OperationsService] Error updating operation:', error.message);
    throw error;
  }

  // Determine action text
  let action = 'Operation Updated';
  let details = `Updated operation: ${updatedOp.title}`;
  
  if (currentOp && currentOp.status !== updatedOp.status && updatedOp.status === 'Completed') {
    action = 'Operation Completed';
    details = `Operation marked as completed: ${updatedOp.title}`;
  }

  await supabase.from('operation_logs').insert({
    business_id: businessId,
    operation_id: updatedOp.id,
    action,
    details
  });

  return updatedOp as Operation;
}

export async function deleteOperation(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const businessId = await getActiveBusinessId();
  if (!businessId) return;

  const { error } = await supabase
    .from('operations')
    .delete()
    .eq('id', id)
    .eq('business_id', businessId);

  if (error) {
    console.error('[OperationsService] Error deleting operation:', error.message);
    throw error;
  }
}

export async function getOperationLogs(): Promise<OperationLog[]> {
  const supabase = getSupabaseClient();
  const businessId = await getActiveBusinessId();
  if (!businessId) return [];

  const { data, error } = await supabase
    .from('operation_logs')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(50); // limit timeline

  if (error) {
    console.error('[OperationsService] Error fetching operation logs:', error.message);
    throw error;
  }
  return data as OperationLog[];
}
