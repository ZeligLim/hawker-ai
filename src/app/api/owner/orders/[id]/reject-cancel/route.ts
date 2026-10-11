import { NextRequest, NextResponse } from 'next/server';
import { requireRequestUser } from '@/lib/supabase/server';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const { id } = await context.params;

  // Verify access
  const { data: merchantOrder } = await auth.client
    .from('merchant_orders')
    .select('food_outlet_id, order_id, status, previous_status')
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

  const restoredStatus = merchantOrder.previous_status || 'PENDING';

  // Restore previous status
  const { error } = await auth.client
    .from('merchant_orders')
    .update({ 
      status: restoredStatus, 
      previous_status: null,
      updated_at: new Date().toISOString() 
    })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Update parent order status based on siblings
  const { data: siblings } = await auth.client
    .from('merchant_orders')
    .select('status')
    .eq('order_id', merchantOrder.order_id);
    
  if (siblings && !siblings.some(s => s.status === 'CANCELLATION_REQUESTED')) {
      // If no siblings are pending cancellation, set parent order to PREPARING
      // Or just a general status. For V1 simplified, just set to PREPARING.
      await auth.client.from('orders').update({ status: 'PREPARING' }).eq('id', merchantOrder.order_id);
  }

  return NextResponse.json({ success: true, status: restoredStatus });
}
