import { NextRequest, NextResponse } from 'next/server';
import { requireRequestUser } from '@/lib/supabase/server';
import { getPaymentProvider } from '@/server/integrations/payment';

export async function GET(request: NextRequest, context: { params: Promise<{ paymentId: string }> }) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) {
    return NextResponse.json({ error: auth.error ?? 'Authentication required' }, { status: 401 });
  }

  try {
    const { paymentId } = await context.params;
    
    // First, check DB
    const { data: order, error } = await auth.client
      .from('orders')
      .select('payment_status, id')
      .eq('payment_intent_id', paymentId)
      .eq('customer_id', auth.user.id)
      .single() as any;

    if (error || !order) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Optionally check external provider if still pending
    if (order.payment_status === 'PENDING' || order.payment_status === 'PROCESSING') {
      try {
        const provider = getPaymentProvider();
        const externalStatus = await provider.getPaymentStatus(paymentId);
        
        if (externalStatus.status !== order.payment_status) {
           // We shouldn't strictly update here usually (rely on webhook), 
           // but for some providers polling is necessary.
           // Leaving as read-only DB state for now based on webhook reliability.
        }
      } catch {
        // Ignore provider errors on status poll
      }
    }

    return NextResponse.json({
      paymentId,
      status: order.payment_status,
      orderId: order.id
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch payment status' }, { status: 500 });
  }
}
