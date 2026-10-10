import type { SupabaseClient } from '@supabase/supabase-js';

export async function createBooth(client: SupabaseClient<any>, userId: string, restaurantId: string, name: string) {
  const { data: membership, error: membershipError } = await client
    .from('restaurant_memberships')
    .select('restaurant_id, role')
    .eq('user_id', userId)
    .eq('restaurant_id', restaurantId)
    .maybeSingle();

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  if (!membership || !['owner', 'manager'].includes(membership.role)) {
    throw new Error('Forbidden: You do not have permission to create booths for this shop.');
  }

  const { data: booth, error: insertError } = await client
    .from('food_outlets')
    .insert({
      restaurant_id: restaurantId,
      name,
      status: 'approved',
      is_open: true,
    })
    .select('id, restaurant_id, name, created_at')
    .single();

  if (insertError || !booth) {
    throw new Error(insertError?.message ?? 'Unable to create booth.');
  }

  return booth;
}
