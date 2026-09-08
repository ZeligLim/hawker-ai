import { NextRequest, NextResponse } from 'next/server';
import { requireRequestUser } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });

  let directOutletIds: string[] = [];
  try {
    const { data: memberships, error: membershipError } = await auth.client
      .from('merchant_memberships')
      .select('food_outlet_id')
      .eq('user_id', auth.user.id);

    if (!membershipError && memberships) {
      directOutletIds = memberships.map((membership) => membership.food_outlet_id).filter(Boolean);
    }
  } catch {
    // ignore
  }

  // Also include booths belonging to restaurants where user is an owner/manager
  const { data: restaurantMemberships } = await auth.client
    .from('restaurant_memberships')
    .select('restaurant_id')
    .eq('user_id', auth.user.id);

  const restaurantIds = restaurantMemberships?.map((r) => r.restaurant_id).filter(Boolean) ?? [];
  let shopOutletIds: string[] = [];

  if (restaurantIds.length > 0) {
    const { data: shopOutlets } = await auth.client
      .from('food_outlets')
      .select('id')
      .in('restaurant_id', restaurantIds);

    shopOutletIds = shopOutlets?.map((o) => o.id).filter(Boolean) ?? [];
  }

  const outletIds = Array.from(new Set([...directOutletIds, ...shopOutletIds]));
  if (outletIds.length === 0) {
    return NextResponse.json({ error: 'Forbidden: Stall worker authorization required.' }, { status: 403 });
  }

  const { data, error } = await auth.client
    .from('merchant_orders')
    .select(`
      id,
      order_id,
      food_outlet_id,
      status,
      subtotal,
      merchant_payout_amount,
      payment_status,
      refund_amount,
      created_at,
      updated_at,
      orders(
        table_session_id
      ),
      order_items(
        id,
        dish_id,
        dish_name,
        unit_price,
        quantity,
        customizations,
        notes,
        is_refunded,
        refund_amount,
        refund_reason
      )
    `)
    .in('food_outlet_id', outletIds)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ orders: data ?? [] });
}
