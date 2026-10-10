import { NextRequest, NextResponse } from 'next/server';
import { requireRequestUser } from '@/lib/supabase/server';
import { getPaymentProvider } from '@/server/integrations/payment';
import { createOrder } from '@/server/services/order-service';

export async function POST(request: NextRequest) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) {
    return NextResponse.json({ error: auth.error ?? 'Authentication required' }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const { items, tableSessionId } = payload;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }
    if (!tableSessionId) {
      return NextResponse.json({ error: 'No active table session' }, { status: 400 });
    }

    // Delegate to service for validation and authoritative creation
    const orderResult = await createOrder(auth.client, payload);

    // Call Payment Provider
    const paymentProvider = getPaymentProvider();
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders?orderId=${orderResult.orderId}`;
    
    const payment = await paymentProvider.createPayment({
      orderId: orderResult.orderId!,
      amount: orderResult.totalAmount,
      currency: 'MYR',
      returnUrl
    });

    // Update order with payment ID
    await auth.client
      .from('orders')
      .update({
        payment_intent_id: payment.paymentId,
        payment_reference: process.env.PAYMENT_PROVIDER || 'mock'
      })
      .eq('id', orderResult.orderId);

    return NextResponse.json(payment);
  } catch (error: any) {
    console.error('Payment Error:', error);
    return NextResponse.json({ error: error.message || 'Payment failed' }, { status: 400 });
  }
}
