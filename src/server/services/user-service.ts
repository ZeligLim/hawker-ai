import type { SupabaseClient } from '@supabase/supabase-js';
import { getPlatformRole } from '@/server/auth/rbac';

export async function getUserRoles(client: SupabaseClient<any>, userId: string, userEmail?: string | null) {
  // Parallelize database queries to avoid waterfall
  const [restMembershipsRes, merchMembershipsRes, platformRoleRes] = await Promise.all([
    client
      .from('restaurant_memberships')
      .select('restaurant_id, role, restaurants(id, name, is_active, schedule, phone, address, lat, lng)')
      .eq('user_id', userId),
    client
      .from('merchant_memberships')
      .select('food_outlet_id, role, food_outlets(id, name, is_open, is_active, schedule, airwallex_account_id, restaurants(id, name, is_active, schedule))')
      .eq('user_id', userId),
    getPlatformRole(client, userId, userEmail)
  ]);

  let shops: Array<{ id: string; name: string; role: string; isActive?: boolean; schedule?: any }> = [];
  if (restMembershipsRes.data) {
    shops = restMembershipsRes.data.map((m: any) => ({
      id: m.restaurants?.id || m.restaurant_id,
      name: m.restaurants?.name || 'Food Hall',
      isActive: m.restaurants?.is_active ?? true,
      schedule: m.restaurants?.schedule,
      phone: m.restaurants?.phone,
      address: m.restaurants?.address,
      lat: m.restaurants?.lat,
      lng: m.restaurants?.lng,
      role: m.role || 'owner',
    }));
  }

  let booths: Array<any> = [];
  if (merchMembershipsRes.data) {
    booths = merchMembershipsRes.data.map((m: any) => ({
      id: m.food_outlets?.id || m.food_outlet_id,
      name: m.food_outlets?.name || 'Stall',
      isOpen: m.food_outlets?.is_open ?? true,
      isActive: m.food_outlets?.is_active ?? true,
      schedule: m.food_outlets?.schedule,
      airwallex_account_id: m.food_outlets?.airwallex_account_id || null,
      role: m.role || 'owner',
      venueId: m.food_outlets?.restaurants?.id,
      venueName: m.food_outlets?.restaurants?.name,
      venueIsActive: m.food_outlets?.restaurants?.is_active ?? true,
      venueSchedule: m.food_outlets?.restaurants?.schedule,
    }));
  }

  const { isSuperAdmin, isSaasOwner, role: platformRole } = platformRoleRes;

  return {
    isCustomer: true,
    hasShopOwner: shops.length > 0,
    hasBooth: booths.length > 0,
    isSuperAdmin,
    isSaasOwner,
    platformRole,
    shops,
    booths,
  };
}

import { createAdminClient } from '@/lib/supabase/server';

export async function deleteUserAccount(userId: string) {
  const adminClient = createAdminClient();
  if (!adminClient) {
    throw new Error('Admin client not configured');
  }

  const { error } = await adminClient.auth.admin.deleteUser(userId);
  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}
