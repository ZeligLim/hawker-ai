import { NextRequest, NextResponse } from 'next/server';
import { requireRequestUser } from '@/lib/supabase/server';

async function getShopAccess(auth: Awaited<ReturnType<typeof requireRequestUser>>, restaurantId: string) {
  if (!auth.client || !auth.user) return { membership: null, error: auth.error ?? 'Authentication required.' };

  const { data: membership, error } = await auth.client
    .from('restaurant_memberships')
    .select('role, restaurant_id')
    .eq('user_id', auth.user.id)
    .eq('restaurant_id', restaurantId)
    .maybeSingle();

  if (error) {
    return { membership: null, error: error.message };
  }

  if (!membership || !['owner', 'manager'].includes(membership.role)) {
    return { membership: null, error: 'You do not have permission to manage this shop.' };
  }

  return { membership, error: null };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRequestUser(request);
  const { id } = await params;

  if (!auth.client || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { membership, error } = await getShopAccess(auth, id);
  if (error || !membership) {
    return NextResponse.json({ error }, { status: error ? 403 : 404 });
  }

  const { data: restaurant, error: restaurantError } = await auth.client
    .from('restaurants')
    .select('id, name, slug, address, lat, lng, is_active, status, created_at')
    .eq('id', id)
    .maybeSingle();

  if (restaurantError || !restaurant) {
    return NextResponse.json({ error: restaurantError?.message ?? 'Shop not found.' }, { status: 404 });
  }

  return NextResponse.json({
    shop: {
      ...restaurant,
      is_active: restaurant.is_active ?? true,
      status: restaurant.status ?? (restaurant.is_active === false ? 'suspended' : 'approved'),
    },
    role: membership.role,
  });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRequestUser(request);
  const { id } = await params;

  if (!auth.client || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { membership, error } = await getShopAccess(auth, id);
  if (error || !membership) {
    return NextResponse.json({ error }, { status: error ? 403 : 404 });
  }

  const update: {
    is_active?: boolean;
    status?: string;
    name?: string;
    slug?: string;
    address?: string;
    lat?: number;
    lng?: number;
  } = {};

  if (typeof body.is_active === 'boolean') {
    update.is_active = body.is_active;
    update.status = body.is_active ? 'approved' : 'suspended';
  } else if (typeof body.status === 'string') {
    update.status = body.status;
    if (body.status === 'suspended') {
      update.is_active = false;
    } else if (body.status === 'approved') {
      update.is_active = true;
    }
  }

  if (typeof body.name === 'string' && body.name.trim()) {
    update.name = body.name.trim();
    const slugSource = typeof body.slug === 'string' && body.slug.trim() ? body.slug.trim() : update.name;
    update.slug = slugSource
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'shop';
  }

  if (typeof body.address === 'string') {
    update.address = body.address.trim() || 'Address not set';
  }

  if (typeof body.lat === 'number') update.lat = body.lat;
  if (typeof body.lng === 'number') update.lng = body.lng;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No fields provided for update.' }, { status: 400 });
  }

  const { data: restaurant, error: updateError } = await auth.client
    .from('restaurants')
    .update(update)
    .eq('id', id)
    .select('id, name, slug, address, lat, lng, is_active, status, created_at')
    .maybeSingle();

  if (updateError || !restaurant) {
    return NextResponse.json({ error: updateError?.message ?? 'Could not update shop.' }, { status: 500 });
  }

  return NextResponse.json({
    shop: {
      ...restaurant,
      is_active: restaurant.is_active ?? true,
      status: restaurant.status ?? (restaurant.is_active === false ? 'suspended' : 'approved'),
    },
    role: membership.role,
    status: 'updated',
  });
}
