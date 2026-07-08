import { getBrowserSupabaseClient as getSupabaseClient, getBrowserActiveBusinessId as getActiveBusinessId } from '../clientHelper';
import { notifyProductCreated, notifyLowStock } from '../notifications/notifications.service';

export interface UnifiedProduct {
  id: string; // Product ID
  business_id: string;
  product_name: string;
  sku: string;
  category: string;
  supplier: string;
  quantity: number;
  cost_price: number;
  selling_price: number;
  reorder_level: number;
  created_at: string;
}

interface DBInventoryItem {
  quantity: number;
  reorder_point: number;
  business_id: string;
  product: {
    id: string;
    name: string;
    sku: string | null;
    category: string | null;
    supplier_name: string | null;
    cost: number;
    price: number;
    created_at: string;
  };
}

// Map from the split DB structure to the unified UI model
function mapFromDB(item: DBInventoryItem): UnifiedProduct {
  return {
    id: item.product.id,
    business_id: item.business_id,
    product_name: item.product.name,
    sku: item.product.sku || '',
    category: item.product.category || 'General',
    supplier: item.product.supplier_name || 'Unknown',
    quantity: Number(item.quantity),
    cost_price: Number(item.product.cost),
    selling_price: Number(item.product.price),
    reorder_level: Number(item.reorder_point),
    created_at: item.product.created_at
  };
}

export async function getProducts(): Promise<UnifiedProduct[]> {
  const supabase = getSupabaseClient();
  const businessId = await getActiveBusinessId();
  if (!businessId) return [];

  const { data, error } = await supabase
    .from('inventory')
    .select('*, product:products(id, name, sku, price, cost, created_at)')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  return (data || [])
    .filter(item => item.product) // Safety check for orphaned inventory rows
    .map(mapFromDB);
}

export async function searchProducts(query: string): Promise<UnifiedProduct[]> {
  const businessId = await getActiveBusinessId();
  if (!businessId) return [];

  // Supabase postgrest doesn't easily support deep OR filters across joins dynamically without RPC.
  // Instead, fetch and filter client-side for simplicity on small datasets, 
  // or use RPC. We'll do client-side filtering over the whole set since it's a dashboard MVP.
  const allProducts = await getProducts();
  const lowerQuery = query.toLowerCase();
  
  return allProducts.filter(p => 
    p.product_name.toLowerCase().includes(lowerQuery) || 
    p.sku.toLowerCase().includes(lowerQuery) ||
    p.category.toLowerCase().includes(lowerQuery) ||
    p.supplier.toLowerCase().includes(lowerQuery)
  );
}

export async function createProduct(payload: Omit<UnifiedProduct, 'id' | 'business_id' | 'created_at'>): Promise<UnifiedProduct> {
  const supabase = getSupabaseClient();
  const businessId = await getActiveBusinessId();
  if (!businessId) throw new Error('No active business ID');

  // 1. Insert Product
  const { data: productData, error: productError } = await supabase
    .from('products')
    .insert({
      business_id: businessId,
      name: payload.product_name,
      sku: payload.sku,
      cost: payload.cost_price,
      price: payload.selling_price
    })
    .select('*')
    .single();

  if (productError) throw productError;

  // 2. Insert Inventory
  const { data: inventoryData, error: inventoryError } = await supabase
    .from('inventory')
    .insert({
      business_id: businessId,
      product_id: productData.id,
      quantity: payload.quantity,
      reorder_point: payload.reorder_level,
      location: 'Warehouse A' // default
    })
    .select('*, product:products(id, name, sku, price, cost, created_at)')
    .single();

  if (inventoryError) {
    // Attempt basic rollback
    await supabase.from('products').delete().eq('id', productData.id);
    throw inventoryError;
  }

  // To perfectly match mapFromDB, we ensure the joined product is passed
  inventoryData.product = productData;
  const result = mapFromDB(inventoryData);

  // Fire notifications asynchronously
  notifyProductCreated(result.product_name, result.sku).catch(console.error);

  // Check if initial quantity is already below reorder level
  if (result.quantity <= result.reorder_level && result.reorder_level > 0) {
    notifyLowStock(result.product_name, result.quantity, result.reorder_level).catch(console.error);
  }

  return result;
}

export async function updateProduct(id: string, payload: Partial<Omit<UnifiedProduct, 'id' | 'business_id' | 'created_at'>>): Promise<UnifiedProduct> {
  const supabase = getSupabaseClient();
  const businessId = await getActiveBusinessId();
  if (!businessId) throw new Error('No active business ID');

  // 1. Update Product
  const productUpdate: Record<string, unknown> = {};
  if (payload.product_name !== undefined) productUpdate.name = payload.product_name;
  if (payload.sku !== undefined) productUpdate.sku = payload.sku;
  if (payload.cost_price !== undefined) productUpdate.cost = payload.cost_price;
  if (payload.selling_price !== undefined) productUpdate.price = payload.selling_price;

  if (Object.keys(productUpdate).length > 0) {
    const { error: pErr } = await supabase
      .from('products')
      .update(productUpdate)
      .eq('id', id);
    if (pErr) throw pErr;
  }

  // 2. Update Inventory
  const inventoryUpdate: Record<string, unknown> = {};
  if (payload.quantity !== undefined) inventoryUpdate.quantity = payload.quantity;
  if (payload.reorder_level !== undefined) inventoryUpdate.reorder_point = payload.reorder_level;

  if (Object.keys(inventoryUpdate).length > 0) {
    const { error: iErr } = await supabase
      .from('inventory')
      .update(inventoryUpdate)
      .eq('product_id', id);
    if (iErr) throw iErr;
  }

  // Fetch updated full object
  const { data, error } = await supabase
    .from('inventory')
    .select('*, product:products(id, name, sku, price, cost, created_at)')
    .eq('product_id', id)
    .single();

  if (error) throw error;
  const updated = mapFromDB(data);

  // Check for low stock after update
  if (payload.quantity !== undefined && updated.quantity <= updated.reorder_level && updated.reorder_level > 0) {
    notifyLowStock(updated.product_name, updated.quantity, updated.reorder_level).catch(console.error);
  }

  return updated;
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  
  // Deleting from products will cascade to inventory due to ON DELETE CASCADE
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
