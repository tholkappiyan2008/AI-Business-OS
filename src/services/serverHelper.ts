// server-only helper — safe to import ONLY in Server Components, Route Handlers, and Server Actions
// This file uses next/headers and must NEVER be imported by client components
import { createClient } from '@/lib/supabase/server';

export async function getServerSupabaseClient() {
  return await createClient();
}

export async function getServerActiveBusinessId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // 1. Ensure profile exists to avoid foreign key violation
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) {
    console.log('User profile missing. Auto-creating profile for:', user.id);
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: user.id, email: user.email })
      .select('id')
      .maybeSingle();

    if (profileError) {
      console.error('Error auto-creating user profile:', profileError);
    }
  }

  // 2. Find first business owned by the user
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1)
    .maybeSingle();

  if (business) return business.id;

  // 3. Fallback: check if the user is an employee
  const { data: employee } = await supabase
    .from('employees')
    .select('business_id')
    .eq('profile_id', user.id)
    .limit(1)
    .maybeSingle();

  if (employee) return employee.business_id;

  // 4. Create default business if none exists
  const { data: newBusiness, error } = await supabase
    .from('businesses')
    .insert({
      owner_id: user.id,
      business_name: 'AI Business OS Workspace',
      industry: 'General',
      currency: 'USD',
    })
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('Error creating default business:', error);
    return null;
  }

  return newBusiness?.id || null;
}
