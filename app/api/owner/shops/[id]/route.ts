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
    .select('id, name, slug, address, lat, lng, created_at')
    .eq('id', id)
    .maybeSingle();

  if (restaurantError || !restaurant) {
    return NextResponse.json({ error: restaurantError?.message ?? 'Shop not found.' }, { status: 404 });
  }

  return NextResponse.json({ shop: restaurant, role: membership.role });
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

  const nextName = typeof body.name === 'string' ? body.name.trim() : '';
  const nextAddress = typeof body.address === 'string' ? body.address.trim() : '';
  const slugSource = typeof body.slug === 'string' ? body.slug.trim() : nextName;

  if (!nextName) {
    return NextResponse.json({ error: 'Shop name is required.' }, { status: 400 });
  }

  const slug = slugSource
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'shop';

  const update: {
    name: string;
    address: string;
    slug: string;
    lat: number;
    lng: number;
  } = {
    name: nextName,
    address: nextAddress || 'Address not set',
    slug,
    lat: typeof body.lat === 'number' ? body.lat : 0,
    lng: typeof body.lng === 'number' ? body.lng : 0,
  };

  const { data: restaurant, error: updateError } = await auth.client
    .from('restaurants')
    .update(update)
    .eq('id', id)
    .select('id, name, slug, address, lat, lng, created_at')
    .maybeSingle();

  if (updateError || !restaurant) {
    return NextResponse.json({ error: updateError?.message ?? 'Could not update shop.' }, { status: 500 });
  }

  return NextResponse.json({ shop: restaurant, role: membership.role, status: 'updated' });
}
