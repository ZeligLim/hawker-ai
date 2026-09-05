import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';

export function createRequestSupabaseClient(request: NextRequest): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const authorization = request.headers.get('authorization');
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: authorization ? { headers: { Authorization: authorization } } : undefined,
  });
}

export async function requireRequestUser(request: NextRequest) {
  const client = createRequestSupabaseClient(request);
  if (!client) {
    return { client: null, user: null, error: 'Supabase is not configured.' };
  }

  const { data, error } = await client.auth.getUser();
  if (error || !data.user) {
    return { client, user: null, error: 'Authentication required.' };
  }

  return { client, user: data.user, error: null };
}
