import { NextRequest, NextResponse } from 'next/server';
import { requireRequestUser } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'w';

  const { data: restaurantMemberships, error: restError } = await auth.client
    .from('restaurant_memberships')
    .select('restaurant_id, role')
    .eq('user_id', auth.user.id);

  if (restError) {
    return NextResponse.json({ error: restError.message }, { status: 500 });
  }

  // Stall workers and customers cannot access shop-wide business analytics
  const authorizedRestaurantMemberships = (restaurantMemberships || []).filter(
    (m) => ['owner', 'manager'].includes(m.role)
  );

  if (authorizedRestaurantMemberships.length === 0) {
    return NextResponse.json(
      { error: 'Forbidden: Shop owner or manager permissions required for venue analytics.' },
      { status: 403 }
    );
  }

  const restaurantIds = authorizedRestaurantMemberships.map((r) => r.restaurant_id).filter(Boolean);
  let shopOutletIds: string[] = [];

  if (restaurantIds.length > 0) {
    const { data: shopOutlets } = await auth.client
      .from('food_outlets')
      .select('id')
      .in('restaurant_id', restaurantIds);

    shopOutletIds = shopOutlets?.map((o) => o.id).filter(Boolean) ?? [];
  }

  // Only aggregate booths belonging to shops this owner is authorized to manage
  let foodOutlets: Array<{ id: string; name: string }> = [];
  if (shopOutletIds.length > 0) {
    const { data: outlets } = await auth.client
      .from('food_outlets')
      .select('id, name')
      .in('id', shopOutletIds);
    foodOutlets = outlets ?? [];
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
