import { NextRequest, NextResponse } from 'next/server';
import { requireRequestUser } from '@/lib/supabase/server';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) {
    return NextResponse.json({ error: auth.error ?? 'Authentication required' }, { status: 401 });
  }

  const { id } = await context.params;

  // Verify the order belongs to the user
  const { data: order, error: orderError } = await auth.client
    .from('orders')
    .select('id, status')
    .eq('id', id)
    .eq('customer_id', auth.user.id)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: 'Order not found or unauthorized' }, { status: 404 });
  }

  if (['COMPLETED', 'CANCELLED', 'CANCELLATION_REQUESTED'].includes(order.status)) {
    return NextResponse.json({ error: `Cannot cancel an order that is ${order.status}` }, { status: 400 });
  }

  // Update order status to CANCELLATION_REQUESTED
  const { error: updateOrderError } = await auth.client
    .from('orders')
    .update({ status: 'CANCELLATION_REQUESTED' })
    .eq('id', id);

  if (updateOrderError) {
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }

  // Update all merchant_orders to CANCELLATION_REQUESTED and save previous status
  // We need to fetch them first to know their previous status
  const { data: merchantOrders, error: moError } = await auth.client
    .from('merchant_orders')
    .select('id, status')
    .eq('order_id', id);

  if (!moError && merchantOrders) {
    for (const mOrder of merchantOrders) {
      if (!['COMPLETED', 'CANCELLED', 'CANCELLATION_REQUESTED'].includes(mOrder.status)) {
        await auth.client
          .from('merchant_orders')
          .update({ 
            status: 'CANCELLATION_REQUESTED',
            previous_status: mOrder.status 
          })
          .eq('id', mOrder.id);
      }
    }
  }

  return NextResponse.json({ success: true, status: 'CANCELLATION_REQUESTED' });
}
