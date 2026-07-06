// client-safe helper — uses only the browser Supabase client
// Safe to import in Client Components ("use client")
// Does NOT import next/headers
import { createClient } from '@/lib/supabase/client';

export function getBrowserSupabaseClient() {
  return createClient();
}

export async function getBrowserActiveBusinessId(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Find first business owned by the user
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1)
    .maybeSingle();

  if (business) return business.id;

  // Fallback: check if the user is an employee
  const { data: employee } = await supabase
    .from('employees')
    .select('business_id')
    .eq('profile_id', user.id)
    .limit(1)
    .maybeSingle();

  if (employee) return employee.business_id;

  // Create default business if none exists
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
