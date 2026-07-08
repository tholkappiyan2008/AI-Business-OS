import { getBrowserSupabaseClient as getSupabaseClient, getBrowserActiveBusinessId as getActiveBusinessId } from '../clientHelper';
import { notifyOrderCreated, notifyOrderDelivered } from '../notifications/notifications.service';

export type OrderStatus = 'draft' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface Order {
  id: string;
  business_id: string;
  customer_id: string | null;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  total: number;
  created_at: string;
  updated_at: string;
  customer?: {
    name: string;
  } | null;
  items?: OrderItem[];
}

export interface CreateOrderPayload {
  customer_id: string;
  subtotal: number;
  tax: number;
  total: number;
  items: Omit<OrderItem, 'id' | 'order_id' | 'line_total'>[];
}

export async function getOrders(): Promise<Order[]> {
  const supabase = getSupabaseClient();
  const businessId = await getActiveBusinessId();
  if (!businessId) return [];

  const { data, error } = await supabase
    .from('orders')
    .select('*, customer:customers(first_name, last_name)')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Map DB customer shape to UI shape
  return (data || []).map((order: Record<string, unknown>) => {
    const cust = order.customer as { first_name?: string; last_name?: string } | null;
    return {
      ...order,
      customer: cust ? { name: `${cust.first_name || ''} ${cust.last_name || ''}`.trim() } : null
    };
  }) as Order[];
}

export async function searchOrders(query: string): Promise<Order[]> {
  const allOrders = await getOrders();
  const lower = query.toLowerCase();
  return allOrders.filter(o => 
    o.order_number.toLowerCase().includes(lower) || 
    (o.customer?.name && o.customer.name.toLowerCase().includes(lower))
  );
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const supabase = getSupabaseClient();
  const businessId = await getActiveBusinessId();
  if (!businessId) throw new Error('No active business ID');

  const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

  // 1. Insert Order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      business_id: businessId,
      customer_id: payload.customer_id,
      order_number: orderNumber,
      status: 'pending',
      subtotal: payload.subtotal,
      tax: payload.tax,
      total: payload.total
    })
    .select('*')
    .single();

  if (orderError) throw orderError;

  // 2. Insert Order Items & 3. Reduce Inventory
  // (In a production environment, this should ideally be an RPC to ensure atomicity)
  const orderItemsData = payload.items.map(item => ({
    business_id: businessId,
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    line_total: item.quantity * item.unit_price
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemsData);

  if (itemsError) {
    // Basic rollback attempt
    await supabase.from('orders').delete().eq('id', order.id);
    throw itemsError;
  }

  // Reduce inventory quantities
  for (const item of payload.items) {
    // Fetch current inventory for this product
    const { data: invData } = await supabase
      .from('inventory')
      .select('quantity')
      .eq('product_id', item.product_id)
      .eq('business_id', businessId)
      .single();

    if (invData) {
      const newQuantity = Number(invData.quantity) - item.quantity;
      await supabase
        .from('inventory')
        .update({ quantity: newQuantity })
        .eq('product_id', item.product_id)
        .eq('business_id', businessId);
    }
  }

  const newOrder = {
    ...order,
    customer: { name: 'Processing...' } // Placeholder until refreshed
  } as Order;

  // Fire notification asynchronously
  notifyOrderCreated(orderNumber, payload.total).catch(console.error);

  return newOrder;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select('*, customer:customers(first_name, last_name)')
    .single();

  if (error) throw error;
  
  const cust = data.customer as { first_name?: string; last_name?: string } | null;
  const updatedOrder = {
    ...data,
    customer: cust ? { name: `${cust.first_name || ''} ${cust.last_name || ''}`.trim() } : null
  } as Order;

  // Fire delivered notification
  if (status === 'delivered') {
    notifyOrderDelivered(updatedOrder.order_number).catch(console.error);
  }

  return updatedOrder;
}

export async function deleteOrder(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  
  // Note: deleting the order will cascade delete order_items based on the migration schema.
  // For this MVP, we are simply deleting the order without restocking inventory.
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
