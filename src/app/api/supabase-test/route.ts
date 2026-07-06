import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Attempt to make a simple unauthenticated query to check connection
    // We'll just try to get the current timestamp or fetch from a non-existent table
    // A successful connection will either return a clean error (like table not found) or data, but won't crash on connection.
    const { error } = await supabase.from('_test_connection').select('*').limit(1)

    // Note: If the table doesn't exist, Supabase returns a '42P01' code, meaning it connected successfully to Postgres.
    // If it's a completely invalid API key/URL, it will throw an auth or fetch error.
    if (error && error.code !== '42P01') {
      return NextResponse.json({ status: 'error', message: 'Failed to connect to Supabase', details: error }, { status: 500 })
    }

    return NextResponse.json({ status: 'success', message: 'Successfully connected to Supabase!' })
  } catch (err: unknown) {
    return NextResponse.json({ status: 'error', message: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}
