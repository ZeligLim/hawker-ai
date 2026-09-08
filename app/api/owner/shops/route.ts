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
      status: 'approved',
      booths: boothsByRestaurant.get(membership.restaurant_id) ?? [],
    };
  });

  return NextResponse.json({ shops });
}

export async function POST(request: NextRequest) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const address = typeof body?.address === 'string' ? body.address.trim() : 'Address not set';

  if (!name) {
    return NextResponse.json({ error: 'Shop name is required.' }, { status: 400 });
  }

  // Prevent duplicate shop creation: If user already owns/manages a shop, return existing
  const { data: existingMemberships } = await auth.client
    .from('restaurant_memberships')
    .select('restaurant_id, role, restaurants(id, name, slug, address, created_at)')
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: false })
    .limit(1);

  if (existingMemberships && existingMemberships.length > 0) {
    const existingShop = Array.isArray(existingMemberships[0].restaurants)
      ? existingMemberships[0].restaurants[0]
      : existingMemberships[0].restaurants;

    return NextResponse.json({
      shop: {
        id: existingMemberships[0].restaurant_id,
        name: existingShop?.name ?? 'Existing Shop',
        slug: existingShop?.slug ?? null,
        address: existingShop?.address ?? null,
        createdAt: existingShop?.created_at ?? null,
        role: existingMemberships[0].role,
        status: 'approved',
      },
      status: 'existing',
      message: 'You already own an active shop.',
    }, { status: 200 });
  }

  const slug = (typeof body?.slug === 'string' ? body.slug.trim() : name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'shop';

  const { data: restaurant, error: insertRestaurantError } = await auth.client
    .from('restaurants')
    .insert({
      name,
      slug,
      address,
      lat: typeof body?.lat === 'number' ? body.lat : 0,
      lng: typeof body?.lng === 'number' ? body.lng : 0,
    })
    .select('id, name, slug, address, lat, lng, created_at')
    .single();

  if (insertRestaurantError || !restaurant) {
    return NextResponse.json({ error: insertRestaurantError?.message ?? 'Could not create this shop.' }, { status: 500 });
  }

  const { error: membershipError } = await auth.client.from('restaurant_memberships').insert({
    user_id: auth.user.id,
    restaurant_id: restaurant.id,
    role: 'owner',
    invited_by: null,
  });

  if (membershipError) {
    return NextResponse.json({ error: membershipError.message }, { status: 500 });
  }

  // Provision primary stall / booth and merchant membership
  const stallName = typeof body?.stallName === 'string' && body.stallName.trim()
    ? body.stallName.trim()
    : `${name} Stall`;

  let boothRecord: { id: string; name: string } | null = null;
  const { data: booth, error: boothError } = await auth.client
    .from('food_outlets')
    .insert({
      restaurant_id: restaurant.id,
      name: stallName,
    })
    .select('id, restaurant_id, name, created_at')
    .single();

  if (!boothError && booth) {
    boothRecord = { id: booth.id, name: booth.name };
    await auth.client.from('merchant_memberships').insert({
      user_id: auth.user.id,
      food_outlet_id: booth.id,
      role: 'owner',
    });
  }

  return NextResponse.json({
    shop: {
      ...restaurant,
      status: typeof body?.status === 'string' ? body.status : 'approved',
      booths: boothRecord ? [boothRecord] : [],
    },
    status: 'created',
  }, { status: 201 });
}
