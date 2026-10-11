import type { SupabaseClient } from '@supabase/supabase-js';

export async function getOwnerAnalytics(client: SupabaseClient<any>, userId: string, period: string) {
  const { data: restaurantMemberships, error: restError } = await client
    .from('restaurant_memberships')
    .select('restaurant_id, role')
    .eq('user_id', userId);

  if (restError) {
    throw new Error(restError.message);
  }

  const authorizedRestaurantMemberships = (restaurantMemberships || []).filter(
    (m) => ['owner', 'manager'].includes(m.role)
  );

  if (authorizedRestaurantMemberships.length === 0) {
    throw new Error('Forbidden: Shop owner or manager permissions required for venue analytics.');
  }

  const restaurantIds = authorizedRestaurantMemberships.map((r) => r.restaurant_id).filter(Boolean);
  let shopOutletIds: string[] = [];

  let foodOutlets: Array<{ id: string; name: string }> = [];
  if (restaurantIds.length > 0) {
    const { data: shopOutlets } = await client
      .from('food_outlets')
      .select('id, name')
      .in('restaurant_id', restaurantIds);
      
    foodOutlets = shopOutlets ?? [];
  }

  const effectiveOutletIds = foodOutlets.map((o) => o.id);

  if (effectiveOutletIds.length === 0) {
    return {
      totalRevenue: 0,
      totalOrders: 0,
      averageTicket: 0,
      maxRevenue: 1,
      booths: [],
    };
  }

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

  const { data: merchantOrders, error: ordersError } = await client
    .from('merchant_orders')
    .select('id, food_outlet_id, status, subtotal, created_at')
    .in('food_outlet_id', effectiveOutletIds)
    .gte('created_at', cutoffDate.toISOString());

  if (ordersError) {
    throw new Error(ordersError.message);
  }

  const orders = (merchantOrders ?? []).filter((o) => o.status !== 'cancelled');

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

  const booths = foodOutlets
    .map((outlet) => {
      const metrics = boothMetrics.get(outlet.id) ?? { orders: 0, revenue: 0 };
      return {
        id: outlet.id,
        name: outlet.name,
        periodOrders: metrics.orders,
        periodRevenue: metrics.revenue,
      };
    })
    .sort((a, b) => b.periodRevenue - a.periodRevenue);

  const maxRevenue = Math.max(...booths.map((b) => b.periodRevenue), 1);
  const activeBoothCount = booths.filter((b) => b.periodOrders > 0).length;
  const totalBooths = booths.length;
  const platformFee = totalRevenue * 0.02 + totalOrders * 0.5;
  const merchantPayout = Math.max(0, totalRevenue - platformFee);

  return {
    totalRevenue,
    totalOrders,
    averageTicket,
    maxRevenue,
    booths,
    activeBoothCount,
    totalBooths,
    platformFee,
    merchantPayout,
  };
}
