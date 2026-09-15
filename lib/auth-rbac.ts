import type { NextRequest } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types.ts';
import { requireRequestUser, createAdminClient } from './supabase/server.ts';

export type PlatformRole = 'superadmin' | 'saas_owner' | 'support' | null;

/**
 * Checks if a given role qualifies as a platform admin with access to
 * sensitive cross-tenant configurations (pricing models, platform fees, monetization).
 */
export function isPlatformAdminRole(role: string | null | undefined): boolean {
  return role === 'superadmin' || role === 'saas_owner';
}

/**
 * Resolves the platform role for an authenticated user.
 * Evaluates:
 * 1. Dedicated `platform_roles` database table (PostgreSQL RLS protected).
 * 2. Bootstrap environment variable `SUPERADMIN_EMAILS` (comma-separated list).
 */
export async function getPlatformRole(
  client: SupabaseClient<Database>,
  userId: string,
  userEmail?: string | null
): Promise<{ role: PlatformRole; isSuperAdmin: boolean; isSaasOwner: boolean; isPlatformAdmin: boolean }> {
  // Check bootstrap superadmin environment list (case-insensitive)
  const envSuperadmins = (process.env.SUPERADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const emailLower = userEmail?.trim().toLowerCase() ?? '';
  const isEnvSuperAdmin = emailLower ? envSuperadmins.includes(emailLower) : false;

  // Query PostgreSQL platform_roles table
  // Use admin client if available to ensure accurate role resolution across tenant boundaries
  const dbClient = createAdminClient() ?? client;
  let dbRole: PlatformRole = null;

  try {
    const { data, error } = await dbClient
      .from('platform_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (!error && data?.role) {
      dbRole = data.role as PlatformRole;
    }
  } catch {
    // If table doesn't exist yet or query fails, fall back gracefully to env check
  }

  const effectiveRole: PlatformRole = dbRole ?? (isEnvSuperAdmin ? 'saas_owner' : null);
  const isSuperAdmin = effectiveRole === 'superadmin';
  const isSaasOwner = effectiveRole === 'saas_owner' || (isEnvSuperAdmin && effectiveRole !== 'superadmin');
  const isPlatformAdmin = isPlatformAdminRole(effectiveRole);

  return {
    role: effectiveRole,
    isSuperAdmin,
    isSaasOwner,
    isPlatformAdmin,
  };
}

/**
 * API route guard to enforce platform admin privileges.
 * Returns 401 if unauthenticated, 403 if authenticated but not superadmin/saas_owner.
 */
export async function requirePlatformAdmin(request: NextRequest) {
  const auth = await requireRequestUser(request);

  if (!auth.client || !auth.user) {
    return {
      authorized: false as const,
      user: null,
      client: null,
      role: null,
      response: Response.json({ error: auth.error ?? 'Authentication required.' }, { status: 401 }),
    };
  }

  const { role, isPlatformAdmin } = await getPlatformRole(auth.client, auth.user.id, auth.user.email);

  if (!isPlatformAdmin) {
    return {
      authorized: false as const,
      user: auth.user,
      client: auth.client,
      role,
      response: Response.json(
        { error: 'Forbidden: Access is restricted strictly to platform owners and SaaS superadmins.' },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true as const,
    user: auth.user,
    client: auth.client,
    role,
    response: null,
  };
}
