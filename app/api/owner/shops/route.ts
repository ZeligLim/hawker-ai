import { NextRequest, NextResponse } from 'next/server';
import { requireRequestUser } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });

  const { data: memberships, error: membershipsError } = await auth.client
    .from('restaurant_memberships')
    .select('restaurant_id, role, restaurants(id, name, slug, address, created_at)')
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: false });

  if (membershipsError) {
    return NextResponse.json({ error: membershipsError.message }, { status: 500 });
  }

  const restaurantIds = memberships?.map((membership) => membership.restaurant_id) ?? [];

  let booths: { id: string; restaurant_id: string; name: string; created_at: string }[] = [];
  if (restaurantIds.length > 0) {
    const { data, error } = await auth.client
      .from('food_outlets')
      .select('id, restaurant_id, name, created_at')
      .in('restaurant_id', restaurantIds);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    booths = data ?? [];
  }

  const boothsByRestaurant = new Map<string, Array<{ id: string; name: string }>>();
  booths.forEach((booth) => {
    const existing = boothsByRestaurant.get(booth.restaurant_id) ?? [];
    existing.push({ id: booth.id, name: booth.name });
    boothsByRestaurant.set(booth.restaurant_id, existing);
  });

  const shops = (memberships ?? []).map((membership) => {
    const restaurant = Array.isArray(membership.restaurants) ? membership.restaurants[0] : membership.restaurants;

    return {
      id: membership.restaurant_id,
      name: restaurant?.name ?? 'Unknown shop',
      slug: restaurant?.slug ?? null,
      address: restaurant?.address ?? null,
      createdAt: restaurant?.created_at ?? null,
      role: membership.role,
      booths: boothsByRestaurant.get(membership.restaurant_id) ?? [],
    };
  });

  return NextResponse.json({ shops });
}
