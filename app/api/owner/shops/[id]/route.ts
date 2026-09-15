import { NextRequest, NextResponse } from 'next/server';
import { requireRequestUser } from '@/lib/supabase/server';
import { getPlatformRole } from '@/lib/auth-rbac';

async function getShopAccess(auth: Awaited<ReturnType<typeof requireRequestUser>>, restaurantId: string) {
  if (!auth.client || !auth.user) return { membership: null, isPlatformAdmin: false, error: auth.error ?? 'Authentication required.' };

  const { isPlatformAdmin } = await getPlatformRole(auth.client, auth.user.id, auth.user.email);
  if (isPlatformAdmin) {
    return { membership: { role: 'superadmin', restaurant_id: restaurantId }, isPlatformAdmin: true, error: null };
  }

  const { data: membership, error } = await auth.client
    .from('restaurant_memberships')
    .select('role, restaurant_id')
    .eq('user_id', auth.user.id)
    .eq('restaurant_id', restaurantId)
    .maybeSingle();

  if (error) {
    return { membership: null, isPlatformAdmin: false, error: error.message };
  }

  if (!membership || !['owner', 'manager'].includes(membership.role)) {
    return { membership: null, isPlatformAdmin: false, error: 'You do not have permission to manage this shop.' };
  }

  return { membership, isPlatformAdmin: false, error: null };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRequestUser(request);
  const { id } = await params;

  if (!auth.client || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { membership, isPlatformAdmin, error } = await getShopAccess(auth, id);
  if (error || !membership) {
    return NextResponse.json({ error }, { status: error ? 403 : 404 });
  }

  const { data: restaurant, error: restaurantError } = await auth.client
    .from('restaurants')
    .select('id, name, slug, address, lat, lng, is_active, status, fee_payer, platform_fee_fixed, platform_fee_percent, created_at')
    .eq('id', id)
    .maybeSingle();

  if (restaurantError || !restaurant) {
    return NextResponse.json({ error: restaurantError?.message ?? 'Shop not found.' }, { status: 404 });
  }

  // Strictly restrict sensitive platform monetization settings to platform admins
  const shopData: Record<string, any> = {
    ...restaurant,
    is_active: restaurant.is_active ?? true,
    status: restaurant.status ?? (restaurant.is_active === false ? 'suspended' : 'approved'),
  };

  if (isPlatformAdmin) {
    shopData.fee_payer = (restaurant.fee_payer ?? 'CUSTOMER') as 'CUSTOMER' | 'MERCHANT';
    shopData.platform_fee_fixed = Number(restaurant.platform_fee_fixed ?? 0.50);
    shopData.platform_fee_percent = Number(restaurant.platform_fee_percent ?? 0.0000);
  } else {
    // Redact sensitive monetization configuration for non-admins
    delete shopData.fee_payer;
    delete shopData.platform_fee_fixed;
    delete shopData.platform_fee_percent;
  }

  return NextResponse.json({
    shop: shopData,
    role: membership.role,
    isPlatformAdmin,
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

  const { membership, isPlatformAdmin, error } = await getShopAccess(auth, id);
  if (error || !membership) {
    return NextResponse.json({ error }, { status: error ? 403 : 404 });
  }

  // Strictly block non-admins from attempting to modify sensitive pricing/charge models
  const hasMonetizationFields =
    body.fee_payer !== undefined ||
    body.platform_fee_fixed !== undefined ||
    body.platform_fee_percent !== undefined;

  if (hasMonetizationFields && !isPlatformAdmin) {
    return NextResponse.json(
      { error: 'Forbidden: Only SaaS superadmins and platform owners are authorized to modify monetization and fee settings.' },
      { status: 403 }
    );
  }

  const update: {
    is_active?: boolean;
    status?: string;
    name?: string;
    slug?: string;
    address?: string;
    lat?: number;
    lng?: number;
    fee_payer?: 'CUSTOMER' | 'MERCHANT';
    platform_fee_fixed?: number;
    platform_fee_percent?: number;
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

  // Only permit updating sensitive monetization parameters if caller is a platform admin
  if (isPlatformAdmin) {
    if (typeof body.fee_payer === 'string' && ['CUSTOMER', 'MERCHANT'].includes(body.fee_payer)) {
      update.fee_payer = body.fee_payer as 'CUSTOMER' | 'MERCHANT';
    }

    if (typeof body.platform_fee_fixed === 'number' && !isNaN(body.platform_fee_fixed) && body.platform_fee_fixed >= 0) {
      update.platform_fee_fixed = Number(body.platform_fee_fixed.toFixed(2));
    }

    if (typeof body.platform_fee_percent === 'number' && !isNaN(body.platform_fee_percent) && body.platform_fee_percent >= 0 && body.platform_fee_percent <= 1) {
      update.platform_fee_percent = Number(body.platform_fee_percent.toFixed(4));
    }
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No fields provided for update.' }, { status: 400 });
  }

  const { data: restaurant, error: updateError } = await auth.client
    .from('restaurants')
    .update(update)
    .eq('id', id)
    .select('id, name, slug, address, lat, lng, is_active, status, fee_payer, platform_fee_fixed, platform_fee_percent, created_at')
    .maybeSingle();

  if (updateError || !restaurant) {
    return NextResponse.json({ error: updateError?.message ?? 'Could not update shop.' }, { status: 500 });
  }

  const shopData: Record<string, any> = {
    ...restaurant,
    is_active: restaurant.is_active ?? true,
    status: restaurant.status ?? (restaurant.is_active === false ? 'suspended' : 'approved'),
  };

  if (isPlatformAdmin) {
    shopData.fee_payer = (restaurant.fee_payer ?? 'CUSTOMER') as 'CUSTOMER' | 'MERCHANT';
    shopData.platform_fee_fixed = Number(restaurant.platform_fee_fixed ?? 0.50);
    shopData.platform_fee_percent = Number(restaurant.platform_fee_percent ?? 0.0000);
  } else {
    delete shopData.fee_payer;
    delete shopData.platform_fee_fixed;
    delete shopData.platform_fee_percent;
  }

  return NextResponse.json({
    shop: shopData,
    role: membership.role,
    isPlatformAdmin,
    status: 'updated',
  });
}
