import { NextRequest, NextResponse } from 'next/server';
import { requireRequestUser } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });

  const { data: memberships, error: membershipError } = await auth.client
    .from('merchant_memberships')
    .select('food_outlet_id')
    .eq('user_id', auth.user.id);
  if (membershipError) return NextResponse.json({ error: membershipError.message }, { status: 500 });

  const outletIds = memberships?.map((membership) => membership.food_outlet_id) ?? [];
  if (outletIds.length === 0) return NextResponse.json({ orders: [] });

  const { data, error } = await auth.client
    .from('merchant_orders')
    .select('id, order_id, food_outlet_id, status, subtotal, created_at, updated_at, order_items(id, dish_id, dish_name, unit_price, quantity, customizations, notes)')
    .in('food_outlet_id', outletIds)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ orders: data ?? [] });
}
