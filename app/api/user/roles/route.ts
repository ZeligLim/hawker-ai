import { NextRequest, NextResponse } from 'next/server';
import { requireRequestUser } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) {
    return NextResponse.json({
      isCustomer: true,
      hasShopOwner: false,
      hasBooth: false,
      shops: [],
      booths: [],
    });
  }

  // Check restaurant_memberships (Shop Owner)
  let shops: Array<{ id: string; name: string; role: string }> = [];
  try {
    const { data: restMemberships } = await auth.client
      .from('restaurant_memberships')
      .select('restaurant_id, role, restaurants(id, name)')
      .eq('user_id', auth.user.id);

    if (restMemberships) {
      shops = restMemberships.map((m: any) => ({
        id: m.restaurants?.id || m.restaurant_id,
        name: m.restaurants?.name || 'Food Hall',
        role: m.role || 'owner',
      }));
    }
  } catch {
    // ignore
  }

  // Check merchant_memberships (Booth Owner)
  let booths: Array<{ id: string; name: string; role: string }> = [];
  try {
    const { data: merchMemberships } = await auth.client
      .from('merchant_memberships')
      .select('food_outlet_id, role, food_outlets(id, name)')
      .eq('user_id', auth.user.id);

    if (merchMemberships) {
      booths = merchMemberships.map((m: any) => ({
        id: m.food_outlets?.id || m.food_outlet_id,
        name: m.food_outlets?.name || 'Stall',
        role: m.role || 'owner',
      }));
    }
  } catch {
    // ignore
  }

  return NextResponse.json({
    isCustomer: true,
    hasShopOwner: shops.length > 0,
    hasBooth: booths.length > 0,
    shops,
    booths,
  });
}
