import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    env[match[1]] = (match[2] || '').trim();
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

const CREDENTIALS_TO_TRY = [
  { email: 'stholkappiyan1@gmail.com', password: 'tholkappiyan007' },
  { email: 'stholkappiyan1@gmail.com', password: 'Tholkappiyan007' },
  { email: 'stholkappiyan1@gmail.com', password: 'tholkappiyan007!' },
  { email: 'stholkappiyan1@gmail.com', password: 'Tholkappiyan007!' },
];

async function trySignIn() {
  for (const creds of CREDENTIALS_TO_TRY) {
    const { data, error } = await supabase.auth.signInWithPassword(creds);
    if (!error && data.session) {
      console.log('Sign-in succeeded with password:', creds.password);
      console.log('User ID:', data.session.user.id);
      return data.session;
    } else {
      console.log(`Failed [${creds.password}]: ${error?.message}`);
    }
  }
  return null;
}

trySignIn().then(session => {
  if (!session) {
    console.log('\nAll credential attempts failed. Please provide the correct password.');
  }
});
