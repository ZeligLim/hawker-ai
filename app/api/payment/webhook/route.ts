import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getPaymentProvider } from '@/lib/payment';

export async function POST(request: NextRequest) {
  try {
    const provider = getPaymentProvider();
    const result = await provider.handleWebhook(request);
    
    if (!result) {
      return NextResponse.json({ error: 'Invalid webhook' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    if (!adminClient) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // 1. Update order payment status
    await adminClient
      .from('orders')
      .update({ payment_status: result.status })
      .eq('id', result.orderId)
      .eq('payment_intent_id', result.paymentId);

    // 2. If PAID, update order status to CONFIRMED (in_progress in DB schema)
    if (result.status === 'PAID') {
      await adminClient
        .from('orders')
        .update({ 
          status: 'in_progress', 
          paid_at: new Date().toISOString() 
        })
        .eq('id', result.orderId);
    } else if (result.status === 'FAILED' || result.status === 'CANCELLED') {
       // Mark order as cancelled if payment failed completely
       await adminClient
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', result.orderId);
        
       // Cancel merchant orders too
       await adminClient
        .from('merchant_orders')
        .update({ status: 'cancelled' })
        .eq('order_id', result.orderId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
