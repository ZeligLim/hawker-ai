import { NextRequest, NextResponse } from 'next/server';
import { CreateOrderSchema } from '@/lib/order/schema';
import { requireRequestUser } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });

  const parsed = CreateOrderSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const input = parsed.data;
  const { data, error } = await auth.client.rpc('create_order_with_items', {
    p_table_session_id: input.tableSessionId,
    p_subtotal: input.subtotal,
    p_service_fee: input.serviceFee,
    p_total: input.total,
    p_payment_reference: input.paymentReference,
    p_items: input.items,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ orderId: data }, { status: 201 });
}

export async function GET(request: NextRequest) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });

  const { data, error } = await auth.client
    .from('orders')
    .select('id, status, subtotal, service_fee, total, created_at, merchant_orders(id, food_outlet_id, status, subtotal, order_items(id, dish_id, dish_name, unit_price, quantity, customizations, notes))')
    .eq('customer_id', auth.user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ orders: data ?? [] });
}
