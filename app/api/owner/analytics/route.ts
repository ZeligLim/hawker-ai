import { NextRequest, NextResponse } from 'next/server';
import { requireRequestUser } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'w';

  // 1. Resolve user's outlets
  let directOutletIds: string[] = [];
  try {
    const { data: memberships } = await auth.client
      .from('merchant_memberships')
      .select('food_outlet_id')
      .eq('user_id', auth.user.id);
    if (memberships) {
      directOutletIds = memberships.map((m) => m.food_outlet_id).filter(Boolean);
    }
  } catch {
    // ignore
  }

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

  // If no assigned outlets, load all food outlets if in dev or return empty
  let foodOutlets: Array<{ id: string; name: string }> = [];
  if (outletIds.length > 0) {
    const { data: outlets } = await auth.client
      .from('food_outlets')
      .select('id, name')
      .in('id', outletIds);
    foodOutlets = outlets ?? [];
  } else {
    // Fallback to all food outlets for initial development/testing
    const { data: allOutlets } = await auth.client
      .from('food_outlets')
      .select('id, name');
    foodOutlets = allOutlets ?? [];
  }

  const effectiveOutletIds = foodOutlets.map((o) => o.id);

  if (effectiveOutletIds.length === 0) {
    return NextResponse.json({
      totalRevenue: 0,
      totalOrders: 0,
      averageTicket: 0,
      maxRevenue: 1,
      booths: [],
    });
  }

  // Calculate cutoff date based on period
  const now = new Date();
  let cutoffDate: Date;
  switch (period) {
    case 'd':
      cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'w':
      cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'm':
      cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'y':
      cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  // Fetch orders
  const { data: merchantOrders, error: ordersError } = await auth.client
    .from('merchant_orders')
    .select('id, food_outlet_id, status, subtotal, created_at')
    .in('food_outlet_id', effectiveOutletIds)
    .gte('created_at', cutoffDate.toISOString());

  if (ordersError) {
    return NextResponse.json({ error: ordersError.message }, { status: 500 });
  }

  const orders = (merchantOrders ?? []).filter((o) => o.status !== 'cancelled');

  // Group by booth
  const boothMetrics = new Map<string, { orders: number; revenue: number }>();
  for (const outlet of foodOutlets) {
    boothMetrics.set(outlet.id, { orders: 0, revenue: 0 });
  }

  let totalRevenue = 0;
  let totalOrders = 0;

  for (const order of orders) {
    const subtotal = Number(order.subtotal) || 0;
    totalRevenue += subtotal;
    totalOrders += 1;

    const current = boothMetrics.get(order.food_outlet_id) ?? { orders: 0, revenue: 0 };
    current.orders += 1;
    current.revenue += subtotal;
    boothMetrics.set(order.food_outlet_id, current);
  }

  const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const booths = foodOutlets.map((outlet) => {
    const metrics = boothMetrics.get(outlet.id) ?? { orders: 0, revenue: 0 };
    return {
      id: outlet.id,
      name: outlet.name,
      periodOrders: metrics.orders,
      periodRevenue: metrics.revenue,
    };
  });

  const maxRevenue = Math.max(...booths.map((b) => b.periodRevenue), 1);

  return NextResponse.json({
    totalRevenue,
    totalOrders,
    averageTicket,
    maxRevenue,
    booths,
  });
}
