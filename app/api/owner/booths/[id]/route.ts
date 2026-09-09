import { NextRequest, NextResponse } from 'next/server';
import { requireRequestUser } from '@/lib/supabase/server';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRequestUser(request);
  const { id } = await params;

  if (!auth.client || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.trim() : '';

  if (!name) {
    return NextResponse.json({ error: 'Booth name is required.' }, { status: 400 });
  }

  const { data: booth, error: boothError } = await auth.client
    .from('food_outlets')
    .select('id, restaurant_id, name')
    .eq('id', id)
    .maybeSingle();

  if (boothError) {
    return NextResponse.json({ error: boothError.message }, { status: 500 });
  }

  if (!booth) {
    return NextResponse.json({ error: 'Booth not found.' }, { status: 404 });
  }

  const { data: membership, error: membershipError } = await auth.client
    .from('restaurant_memberships')
    .select('restaurant_id, role')
    .eq('user_id', auth.user.id)
    .eq('restaurant_id', booth.restaurant_id)
    .maybeSingle();

  if (membershipError) {
    return NextResponse.json({ error: membershipError.message }, { status: 500 });
  }

  if (!membership || !['owner', 'manager'].includes(membership.role)) {
    return NextResponse.json({ error: 'You do not have permission to manage this booth.' }, { status: 403 });
  }

  const { data: updatedBooth, error: updateError } = await auth.client
    .from('food_outlets')
    .update({ name })
    .eq('id', id)
    .select('id, restaurant_id, name, created_at')
    .single();

  if (updateError || !updatedBooth) {
    return NextResponse.json({ error: updateError?.message ?? 'Unable to update booth.' }, { status: 500 });
  }

  return NextResponse.json({ booth: updatedBooth, status: 'updated' });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRequestUser(request);
  const { id } = await params;

  if (!auth.client || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  // 1. Try atomic database RPC function first
  try {
    const { data: rpcData, error: rpcError } = await (auth.client.rpc as any)('delete_booth_slot', {
      p_booth_id: id,
    });

    if (!rpcError && rpcData) {
      const parsed = typeof rpcData === 'string' ? JSON.parse(rpcData) : rpcData;
      if (parsed.error) {
        return NextResponse.json({ error: parsed.error }, { status: 400 });
      }
      return NextResponse.json({ status: 'deleted', boothId: id, details: parsed });
    }
  } catch {
    // If RPC is not yet applied, fallback to direct queries below
  }

  // 2. Direct database fallback
  const { data: booth, error: boothError } = await auth.client
    .from('food_outlets')
    .select('id, restaurant_id, name')
    .eq('id', id)
    .maybeSingle();

  if (boothError) {
    return NextResponse.json({ error: boothError.message }, { status: 500 });
  }

  if (!booth) {
    return NextResponse.json({ error: 'Booth not found.' }, { status: 404 });
  }

  const { data: membership, error: membershipError } = await auth.client
    .from('restaurant_memberships')
    .select('restaurant_id, role')
    .eq('user_id', auth.user.id)
    .eq('restaurant_id', booth.restaurant_id)
    .maybeSingle();

  if (membershipError) {
    return NextResponse.json({ error: membershipError.message }, { status: 500 });
  }

  if (!membership || !['owner', 'manager'].includes(membership.role)) {
    return NextResponse.json({ error: 'You do not have permission to delete this booth.' }, { status: 403 });
  }

  // Clean up order items and merchant orders if any exist
  const { data: merchantOrders } = await auth.client
    .from('merchant_orders')
    .select('id')
    .eq('food_outlet_id', id);

  if (merchantOrders && merchantOrders.length > 0) {
    const moIds = merchantOrders.map((mo) => mo.id);
    await auth.client.from('order_items').delete().in('merchant_order_id', moIds);
    await auth.client.from('merchant_orders').delete().eq('food_outlet_id', id);
  }

  await auth.client.from('booth_invitations').delete().eq('food_outlet_id', id);
  await auth.client.from('merchant_memberships').delete().eq('food_outlet_id', id);
  await auth.client.from('dishes').delete().eq('food_outlet_id', id);

  const { error: deleteError } = await auth.client
    .from('food_outlets')
    .delete()
    .eq('id', id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ status: 'deleted', boothId: id });
}
