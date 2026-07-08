import { getBrowserSupabaseClient as getSupabaseClient, getBrowserActiveBusinessId as getActiveBusinessId } from '../clientHelper';

const NOTIFICATIONS_CHANGED_EVENT = 'notifications-changed';

/** Notify listeners (e.g. TopNav badge) that the notification list changed. */
export function dispatchNotificationsChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(NOTIFICATIONS_CHANGED_EVENT));
  }
}

export function subscribeToNotificationsChanged(handler: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, handler);
  return () => window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, handler);
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DBNotification {
  id: string;
  business_id: string;
  user_id?: string | null;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

// ─── Core CRUD ───────────────────────────────────────────────────────────────

export async function getNotifications(): Promise<DBNotification[]> {
  const supabase = getSupabaseClient();
  const businessId = await getActiveBusinessId();
  if (!businessId) return [];

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as DBNotification[];
}

export async function getUnreadNotificationCount(): Promise<number> {
  const supabase = getSupabaseClient();
  const businessId = await getActiveBusinessId();
  if (!businessId) return 0;

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .eq('is_read', false);

  if (error) throw error;
  return count ?? 0;
}

export async function createNotification(params: {
  type: string;
  title: string;
  body: string;
}): Promise<DBNotification | null> {
  const supabase = getSupabaseClient();
  const businessId = await getActiveBusinessId();
  if (!businessId) return null;

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      business_id: businessId,
      type: params.type,
      title: params.title,
      body: params.body,
      is_read: false,
    })
    .select('*')
    .single();

  if (error) {
    console.error('[Notifications] Failed to create notification:', error.message);
    return null;
  }
  dispatchNotificationsChanged();
  return data as DBNotification;
}

export async function markAsRead(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);
  if (error) throw error;
  dispatchNotificationsChanged();
}

export async function deleteNotification(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id);
  if (error) throw error;
  dispatchNotificationsChanged();
}

export async function clearAllNotifications(): Promise<void> {
  const supabase = getSupabaseClient();
  const businessId = await getActiveBusinessId();
  if (!businessId) return;

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('business_id', businessId);
  if (error) throw error;
  dispatchNotificationsChanged();
}

export async function markAllAsRead(): Promise<void> {
  const supabase = getSupabaseClient();
  const businessId = await getActiveBusinessId();
  if (!businessId) return;

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('business_id', businessId)
    .eq('is_read', false);
  if (error) throw error;
  dispatchNotificationsChanged();
}

// ─── Business Event Helpers ───────────────────────────────────────────────────

export async function notifyCustomerCreated(customerName: string): Promise<void> {
  await createNotification({
    title: `New Customer Added: ${customerName}`,
    body: `A new customer "${customerName}" has been successfully added to your CRM.`,
    type: 'info'
  });
}

export async function notifyProductCreated(productName: string, sku: string): Promise<void> {
  await createNotification({
    title: `New Product Created: ${productName}`,
    body: `Product "${productName}" (SKU: ${sku}) has been added to your inventory catalog.`,
    type: 'info'
  });
}

export async function notifyOrderCreated(orderNumber: string, total: number): Promise<void> {
  await createNotification({
    title: `New Order Received: ${orderNumber}`,
    body: `Order ${orderNumber} has been created with a total of $${total.toFixed(2)}.`,
    type: 'info'
  });
}

export async function notifyOrderDelivered(orderNumber: string): Promise<void> {
  await createNotification({
    title: `Order Delivered: ${orderNumber}`,
    body: `Order ${orderNumber} has been marked as delivered successfully.`,
    type: 'alert'
  });
}

export async function notifyLowStock(productName: string, currentQty: number, reorderLevel: number): Promise<void> {
  await createNotification({
    title: `Low Stock Alert: ${productName}`,
    body: `Stock for "${productName}" has fallen to ${currentQty} units, below the reorder level of ${reorderLevel}. Restock required.`,
    type: 'warning'
  });
}

export async function notifyExpenseCreated(category: string, amount: number): Promise<void> {
  await createNotification({
    title: `Expense Recorded: ${category}`,
    body: `A new ${category} expense of $${amount.toFixed(2)} has been recorded.`,
    type: 'info'
  });
}

export async function notifyExpenseApprovalRequired(category: string, amount: number, threshold: number): Promise<void> {
  await createNotification({
    title: `Expense Approval Required: ${category}`,
    body: `An expense of $${amount.toFixed(2)} in the ${category} category exceeds the approval threshold of $${threshold.toFixed(2)} and requires review.`,
    type: 'approval'
  });
}
