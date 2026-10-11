import { NextRequest, NextResponse } from 'next/server';
import { requireRequestUser } from '@/lib/supabase/server';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const { id } = await context.params;

  // Verify access
  const { data: merchantOrder } = await auth.client
    .from('merchant_orders')
    .select('food_outlet_id, order_id, status')
    .eq('id', id)
    .single();

  if (!merchantOrder) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

  const { data: membership } = await auth.client
    .from('merchant_memberships')
    .select('food_outlet_id')
    .eq('user_id', auth.user.id)
    .eq('food_outlet_id', merchantOrder.food_outlet_id)
    .single();

  if (!membership) return NextResponse.json({ error: 'No merchant access.' }, { status: 403 });

  if (merchantOrder.status !== 'CANCELLATION_REQUESTED') {
    return NextResponse.json({ error: 'Order is not pending cancellation.' }, { status: 400 });
  }

  // Update to CANCELLED
  const { error } = await auth.client
    .from('merchant_orders')
    .update({ status: 'CANCELLED', updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Optionally, if all merchant_orders for the parent order are CANCELLED, cancel the parent order.
  const { data: siblings } = await auth.client
    .from('merchant_orders')
    .select('status')
    .eq('order_id', merchantOrder.order_id);
    
  if (siblings && siblings.every(s => s.status === 'CANCELLED')) {
     await auth.client.from('orders').update({ status: 'CANCELLED' }).eq('id', merchantOrder.order_id);
  }

  return NextResponse.json({ success: true, status: 'CANCELLED' });
}
