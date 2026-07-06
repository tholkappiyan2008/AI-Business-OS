import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    env[match[1]] = match[2] || '';
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'] || env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
  console.log('Testing getProducts query...');
  const { data, error } = await supabase
    .from('inventory')
    .select('*, product:products(id, name, sku, price, cost)') // removed missing columns
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Query Error Details:', JSON.stringify(error, null, 2));
  } else {
    console.log('Query succeeded. Data:', data);
  }
}

testQuery();
