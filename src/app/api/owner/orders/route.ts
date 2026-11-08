import { NextRequest, NextResponse } from 'next/server';
import { requireRequestUser } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });

  const targetRestaurantId = request.nextUrl.searchParams.get('restaurantId');
  const targetBoothId = request.nextUrl.searchParams.get('boothId');

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
  let restQuery = auth.client
    .from('restaurant_memberships')
    .select('restaurant_id')
    .eq('user_id', auth.user.id);

  if (targetRestaurantId) {
    restQuery = restQuery.eq('restaurant_id', targetRestaurantId);
  }

  const { data: restaurantMemberships } = await restQuery;

  const restaurantIds = restaurantMemberships?.map((r) => r.restaurant_id).filter(Boolean) ?? [];
  let shopOutletIds: string[] = [];

  if (restaurantIds.length > 0) {
    let outletQuery = auth.client
      .from('food_outlets')
      .select('id')
      .in('restaurant_id', restaurantIds);

    if (targetBoothId) {
      outletQuery = outletQuery.eq('id', targetBoothId);
    }

    const { data: shopOutlets } = await outletQuery;
    shopOutletIds = shopOutlets?.map((o) => o.id).filter(Boolean) ?? [];
  }

  let outletIds = Array.from(new Set([...(targetRestaurantId ? [] : directOutletIds), ...shopOutletIds]));
  if (targetBoothId) {
    outletIds = outletIds.filter((id) => id === targetBoothId);
  }

  if (outletIds.length === 0) {
    return NextResponse.json({ orders: [] });
  }

  const { data, error } = await auth.client
    .from('merchant_orders')
    .select(`
      id,
      order_id,
      food_outlet_id,
      status,
      previous_status,
      subtotal,
      merchant_payout_amount,
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
        notes
      )
    `)
    .in('food_outlet_id', outletIds)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Merchant Orders Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: data ?? [] });
}
