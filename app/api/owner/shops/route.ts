import { NextRequest, NextResponse } from 'next/server';
import { requireRequestUser, createAdminClient } from '@/lib/supabase/server';
import { getPlatformRole } from '@/lib/auth-rbac';

export async function GET(request: NextRequest) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });

  const { data: memberships, error: membershipsError } = await auth.client
    .from('restaurant_memberships')
    .select('restaurant_id, role, restaurants(id, name, slug, address, is_active, status, fee_payer, platform_fee_fixed, platform_fee_percent, created_at)')
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: false });

  if (membershipsError) {
    return NextResponse.json({ error: membershipsError.message }, { status: 500 });
  }

  const restaurantIds = memberships?.map((membership) => membership.restaurant_id) ?? [];

  let booths: { id: string; restaurant_id: string; name: string; is_open?: boolean; status?: string; created_at: string }[] = [];
  if (restaurantIds.length > 0) {
    const { data, error } = await auth.client
      .from('food_outlets')
      .select('id, restaurant_id, name, is_open, status, created_at')
      .in('restaurant_id', restaurantIds);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    booths = data ?? [];
  }

  const adminClient = createAdminClient() ?? auth.client;
  const boothIds = booths.map((b) => b.id);
  const membersByBooth = new Map<string, Array<{ userId: string; email: string; role: string; createdAt: string }>>();
  const invitationsByBooth = new Map<string, Array<{ id: string; email: string; expiresAt: string; createdAt: string }>>();

  if (boothIds.length > 0) {
    const { data: memberRows } = await adminClient
      .from('merchant_memberships')
      .select('user_id, food_outlet_id, role, email, created_at')
      .in('food_outlet_id', boothIds);

    memberRows?.forEach((row) => {
      const list = membersByBooth.get(row.food_outlet_id) ?? [];
      list.push({
        userId: row.user_id,
        email: row.email ?? '',
        role: row.role,
        createdAt: row.created_at,
      });
      membersByBooth.set(row.food_outlet_id, list);
    });

    const { data: inviteRows } = await adminClient
      .from('booth_invitations')
      .select('id, food_outlet_id, invited_email, expires_at, created_at')
      .in('food_outlet_id', boothIds)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString());

    inviteRows?.forEach((row) => {
      const list = invitationsByBooth.get(row.food_outlet_id) ?? [];
      list.push({
        id: row.id,
        email: row.invited_email ?? '',
        expiresAt: row.expires_at,
        createdAt: row.created_at,
      });
      invitationsByBooth.set(row.food_outlet_id, list);
    });
  }

  const boothsByRestaurant = new Map<
    string,
    Array<{
      id: string;
      name: string;
      isOpen: boolean;
      status: string;
      members: Array<{ userId: string; email: string; role: string; createdAt: string }>;
      invitations: Array<{ id: string; email: string; expiresAt: string; createdAt: string }>;
    }>
  >();
  booths.forEach((booth) => {
    const existing = boothsByRestaurant.get(booth.restaurant_id) ?? [];
    existing.push({
      id: booth.id,
      name: booth.name,
      isOpen: booth.is_open ?? true,
      status: booth.status ?? (booth.is_open === false ? 'closed' : 'approved'),
      members: membersByBooth.get(booth.id) ?? [],
      invitations: invitationsByBooth.get(booth.id) ?? [],
    });
    boothsByRestaurant.set(booth.restaurant_id, existing);
  });

  const { isPlatformAdmin } = await getPlatformRole(auth.client, auth.user.id, auth.user.email);

  const shops = (memberships ?? []).map((membership) => {
    const restaurant = Array.isArray(membership.restaurants) ? membership.restaurants[0] : membership.restaurants;

    const isActive = restaurant?.is_active ?? true;
    const status = restaurant?.status ?? (isActive ? 'approved' : 'suspended');

    return {
      id: membership.restaurant_id,
      name: restaurant?.name ?? 'Unknown shop',
      slug: restaurant?.slug ?? null,
      address: restaurant?.address ?? null,
      createdAt: restaurant?.created_at ?? null,
      role: membership.role,
      isActive,
      status,
      ...(isPlatformAdmin
        ? {
            feePayer: (restaurant?.fee_payer ?? 'CUSTOMER') as 'CUSTOMER' | 'MERCHANT',
            platformFeeFixed: Number(restaurant?.platform_fee_fixed ?? 0.50),
            platformFeePercent: Number(restaurant?.platform_fee_percent ?? 0.0000),
          }
        : {}),
      booths: boothsByRestaurant.get(membership.restaurant_id) ?? [],
    };
  });

  return NextResponse.json({ shops, isPlatformAdmin });
}

export async function POST(request: NextRequest) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const address = typeof body?.address === 'string' ? body.address.trim() : null;

  if (!name) {
    return NextResponse.json({ error: 'Shop name is required.' }, { status: 400 });
  }

  // Prevent multiple active shop ownerships for single user in MVP
  const { data: existingMemberships } = await auth.client
    .from('restaurant_memberships')
    .select('restaurant_id, role, restaurants(name, slug, address, created_at)')
    .eq('user_id', auth.user.id)
    .eq('role', 'owner')
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

  const boothCount = typeof body?.boothCount === 'number' && body.boothCount > 0
    ? Math.min(body.boothCount, 20)
    : 3; // Default 3 initial empty booth slots for the food hall

  const shopStatus = typeof body?.status === 'string' ? body.status : 'approved';

  // 1. Attempt atomic RPC if available in Supabase
  try {
    const { data: rpcData, error: rpcError } = await (auth.client.rpc as any)('register_hawker_centre', {
      p_name: name,
      p_slug: slug,
      p_address: address,
      p_lat: typeof body?.lat === 'number' ? body.lat : 0,
      p_lng: typeof body?.lng === 'number' ? body.lng : 0,
      p_booth_count: boothCount,
      p_status: shopStatus,
    });

    if (!rpcError && rpcData) {
      const parsed = typeof rpcData === 'string' ? JSON.parse(rpcData) : rpcData;
      return NextResponse.json({
        shop: {
          ...parsed,
          status: parsed.status ?? shopStatus,
          booths: [],
        },
        status: 'created',
      }, { status: 201 });
    }
  } catch {
    // RPC not installed or failed, proceed with direct table operations
  }

  // 2. Direct database operations using admin client if service role key is configured, otherwise user auth client
  const adminClient = createAdminClient();
  const dbClient = adminClient ?? auth.client;

  const { data: restaurant, error: insertRestaurantError } = await dbClient
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
    const isRlsError = insertRestaurantError?.message?.includes('violates row-level security policy');
    const errorMessage = isRlsError
      ? 'Row-level security violation on table "restaurants". Please run migration 011_restaurant_registration_rls.sql in your Supabase SQL editor.'
      : insertRestaurantError?.message ?? 'Could not create this shop.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }

  const { error: membershipError } = await dbClient.from('restaurant_memberships').insert({
    user_id: auth.user.id,
    restaurant_id: restaurant.id,
    role: 'owner',
    invited_by: null,
  });

  if (membershipError) {
    return NextResponse.json({ error: membershipError.message }, { status: 500 });
  }

  const initialSlots = Array.from({ length: boothCount }, (_, i) => ({
    restaurant_id: restaurant.id,
    name: `Booth Slot #${String(i + 1).padStart(2, '0')}`,
    status: 'approved',
    is_open: true,
  }));

  const { data: initialBooths } = await dbClient
    .from('food_outlets')
    .insert(initialSlots)
    .select('id, restaurant_id, name, created_at');

  return NextResponse.json({
    shop: {
      ...restaurant,
      status: shopStatus,
      booths: initialBooths || [],
    },
    status: 'created',
  }, { status: 201 });
}
