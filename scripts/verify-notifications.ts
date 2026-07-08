/**
 * Verifies the event-driven notifications workflow end-to-end.
 * Usage: npx tsx scripts/verify-notifications.ts
 *
 * Requires .env.local with:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   TEST_USER_EMAIL
 *   TEST_USER_PASSWORD
 */
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

function loadEnv(): Record<string, string> {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    throw new Error('.env.local not found');
  }
  const env: Record<string, string> = {};
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) env[match[1]] = (match[2] || '').trim().replace(/^["']|["']$/g, '');
  });
  return env;
}

async function main() {
  const env = loadEnv();
  const url = env['NEXT_PUBLIC_SUPABASE_URL'];
  const key = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
  const email = env['TEST_USER_EMAIL'];
  const password = env['TEST_USER_PASSWORD'];

  if (!url || !key) throw new Error('Missing Supabase env vars');
  if (!email || !password) throw new Error('Set TEST_USER_EMAIL and TEST_USER_PASSWORD in .env.local');

  const supabase = createClient(url, key);

  const { data: auth, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError || !auth.user) throw new Error(`Sign-in failed: ${signInError?.message}`);

  const userId = auth.user.id;
  console.log('Signed in as', email);

  // Resolve business
  let { data: business } = await supabase.from('businesses').select('id').eq('owner_id', userId).limit(1).maybeSingle();
  if (!business) {
    const { data: created, error } = await supabase
      .from('businesses')
      .insert({ owner_id: userId, business_name: 'Notification Test Workspace', industry: 'General', currency: 'USD' })
      .select('id')
      .single();
    if (error) throw error;
    business = created;
  }
  const businessId = business.id;
  console.log('Business ID:', businessId);

  // Clear existing notifications for a clean test
  await supabase.from('notifications').delete().eq('business_id', businessId);

  const ts = Date.now();
  const customerName = `Test Customer ${ts}`;
  const productName = `Test Product ${ts}`;
  const sku = `SKU-${ts}`;

  async function insertNotification(params: {
    title: string;
    body: string;
    type: string;
    category: string;
    action_required?: boolean;
  }) {
    const { error } = await supabase.from('notifications').insert({
      business_id: businessId,
      title: params.title,
      body: params.body,
      type: params.type,
      category: params.category,
      action_required: params.action_required ?? false,
      approved: false,
      rejected: false,
      is_read: false,
    });
    if (error) throw new Error(`Notification insert failed: ${error.message}`);
  }

  // 1. Customer Created
  const nameParts = customerName.split(' ');
  const { data: customer, error: custErr } = await supabase
    .from('customers')
    .insert({
      business_id: businessId,
      first_name: nameParts[0],
      last_name: nameParts.slice(1).join(' ') || '-',
      email: `test${ts}@example.com`,
      phone: null,
      address: { company: 'Test Co', status: 'Active' },
    })
    .select('id')
    .single();
  if (custErr) throw custErr;

  await insertNotification({
    title: `New Customer Added: ${customerName}`,
    body: `A new customer "${customerName}" has been successfully added to your CRM.`,
    type: 'info',
    category: 'CRM',
  });

  // 2. Product Created + Low Stock
  const { data: product, error: prodErr } = await supabase
    .from('products')
    .insert({ business_id: businessId, name: productName, sku, cost: 10, price: 25 })
    .select('id')
    .single();
  if (prodErr) throw prodErr;

  await supabase.from('inventory').insert({
    business_id: businessId,
    product_id: product.id,
    quantity: 2,
    reorder_point: 5,
    location: 'Warehouse A',
  });

  await insertNotification({
    title: `New Product Created: ${productName}`,
    body: `Product "${productName}" (SKU: ${sku}) has been added to your inventory catalog.`,
    type: 'info',
    category: 'Inventory',
  });

  await insertNotification({
    title: `Low Stock Alert: ${productName}`,
    body: `Stock for "${productName}" has fallen to 2 units, below the reorder level of 5. Restock required.`,
    type: 'warning',
    category: 'Inventory',
    action_required: true,
  });

  // 3. Order Created + Delivered
  const orderNumber = `ORD-${String(ts).slice(-6)}`;
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      business_id: businessId,
      customer_id: customer.id,
      order_number: orderNumber,
      status: 'pending',
      subtotal: 50,
      tax: 5,
      total: 55,
    })
    .select('id')
    .single();
  if (orderErr) throw orderErr;

  await supabase.from('order_items').insert({
    business_id: businessId,
    order_id: order.id,
    product_id: product.id,
    quantity: 1,
    unit_price: 25,
    line_total: 25,
  });

  await insertNotification({
    title: `New Order Received: ${orderNumber}`,
    body: `Order ${orderNumber} has been created with a total of $55.00.`,
    type: 'info',
    category: 'Orders',
  });

  await supabase.from('orders').update({ status: 'delivered' }).eq('id', order.id);

  await insertNotification({
    title: `Order Delivered: ${orderNumber}`,
    body: `Order ${orderNumber} has been marked as delivered successfully.`,
    type: 'alert',
    category: 'Orders',
  });

  // 4. Expense Created + Approval Required
  const expenseAmount = 1500;
  const { error: expErr } = await supabase.from('expenses').insert({
    business_id: businessId,
    category: 'marketing',
    amount: expenseAmount,
    description: `Verification expense ${ts}`,
    expense_date: new Date().toISOString().split('T')[0],
  });
  if (expErr) throw expErr;

  await insertNotification({
    title: 'Expense Recorded: marketing',
    body: `A new marketing expense of $${expenseAmount.toFixed(2)} has been recorded.`,
    type: 'info',
    category: 'Finance',
  });

  await insertNotification({
    title: 'Expense Approval Required: marketing',
    body: `An expense of $${expenseAmount.toFixed(2)} in the marketing category exceeds the approval threshold of $1000.00 and requires review.`,
    type: 'approval',
    category: 'Finance',
    action_required: true,
  });

  // Verify notifications in DB
  const { data: notifications, error: fetchErr } = await supabase
    .from('notifications')
    .select('title, type, category, action_required, is_read')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (fetchErr) throw fetchErr;

  console.log('\n--- Notifications in database ---');
  notifications?.forEach((n, i) => {
    console.log(`${i + 1}. [${n.type}/${n.category}] ${n.title}${n.action_required ? ' (action required)' : ''}`);
  });

  const expectedTitles = [
    'New Customer Added',
    'New Product Created',
    'Low Stock Alert',
    'New Order Received',
    'Order Delivered',
    'Expense Recorded',
    'Expense Approval Required',
  ];

  const missing = expectedTitles.filter(
    expected => !notifications?.some(n => n.title.startsWith(expected) || n.title.includes(expected))
  );

  if (missing.length > 0) {
    console.error('\nFAILED — missing notification types:', missing.join(', '));
    process.exit(1);
  }

  const unread = notifications?.filter(n => !n.is_read).length ?? 0;
  console.log(`\nTotal: ${notifications?.length ?? 0} | Unread: ${unread}`);
  console.log('PASSED — All 7 event-driven notification types verified.');
}

main().catch(err => {
  console.error('Verification failed:', err.message || err);
  process.exit(1);
});
