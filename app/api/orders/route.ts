import { NextRequest, NextResponse } from 'next/server';
import { CreateOrderSchema } from '@/lib/order/schema';
import { requireRequestUser } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const auth = await requireRequestUser(request);
  if (!auth.client) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  // Allow guests to place orders if they are not authenticated

  const parsed = CreateOrderSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const input = parsed.data;

  // 1. Fetch fee settings for the outlets involved in this order
  const stallIds = Array.from(new Set(input.items.map((item) => item.stallId)));
  let feePayer: 'CUSTOMER' | 'MERCHANT' = 'CUSTOMER';
  let feeFixed = 0.50;
  let feePercent = 0.0000;

  try {
    const { data: outlets } = await auth.client
      .from('food_outlets')
      .select('id, fee_payer, platform_fee_fixed, platform_fee_percent, restaurant_id, restaurants(fee_payer, platform_fee_fixed, platform_fee_percent)')
      .in('id', stallIds);

    if (outlets && outlets.length > 0) {
      const firstOutlet: any = outlets[0];
      const rest = firstOutlet.restaurants;
      feePayer = (firstOutlet.fee_payer ?? rest?.fee_payer ?? 'CUSTOMER') as 'CUSTOMER' | 'MERCHANT';
      feeFixed = Number(firstOutlet.platform_fee_fixed ?? rest?.platform_fee_fixed ?? 0.50);
      feePercent = Number(firstOutlet.platform_fee_percent ?? rest?.platform_fee_percent ?? 0.0000);
    }
  } catch {
    // Graceful fallback to default platform settings (RM 0.50 customer paid)
  }

  // 2. Perform authoritative server-side calculation
  const subtotalAmount = Number(
    input.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
  );
  const platformFeeAmount = Number((feeFixed + subtotalAmount * feePercent).toFixed(2));

  let totalAmount: number;
  let merchantPayoutAmount: number;

  if (feePayer === 'CUSTOMER') {
    totalAmount = Number((subtotalAmount + platformFeeAmount).toFixed(2));
    merchantPayoutAmount = subtotalAmount;
  } else {
    totalAmount = subtotalAmount;
    merchantPayoutAmount = Math.max(0, Number((subtotalAmount - platformFeeAmount).toFixed(2)));
  }

  const paymentIntentId =
    input.paymentIntentId ??
    input.paymentReference ??
    `pi_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // 3. Execute order creation RPC with full monetization parameters
  let orderId: string | null = null;
  const rpcFullArgs = {
    p_table_session_id: input.tableSessionId || '',
    p_subtotal: subtotalAmount,
    p_service_fee: platformFeeAmount,
    p_total: totalAmount,
    p_payment_reference: paymentIntentId,
    p_items: input.items,
    p_subtotal_amount: subtotalAmount,
    p_platform_fee_amount: platformFeeAmount,
    p_total_amount: totalAmount,
    p_merchant_payout_amount: merchantPayoutAmount,
    p_payment_status: 'PAID',
    p_payment_intent_id: paymentIntentId,
  };

  const { data: fullData, error: fullError } = await auth.client.rpc('create_order_with_items', rpcFullArgs);

  if (!fullError && fullData) {
    orderId = fullData as string;
  } else {
    // If database function has the legacy 6-argument signature, invoke legacy and update row
    const legacyArgs = {
      p_table_session_id: input.tableSessionId || '',
      p_subtotal: subtotalAmount,
      p_service_fee: platformFeeAmount,
      p_total: totalAmount,
      p_payment_reference: paymentIntentId,
      p_items: input.items,
    };
    const { data: legData, error: legError } = await auth.client.rpc('create_order_with_items', legacyArgs);
    if (legError) {
      return NextResponse.json({ error: legError.message }, { status: 400 });
    }
    orderId = legData as string;
  }

  // Ensure orders record has distinct monetization columns populated
  if (orderId) {
    try {
      await auth.client
        .from('orders')
        .update({
          subtotal_amount: subtotalAmount,
          platform_fee_amount: platformFeeAmount,
          total_amount: totalAmount,
          merchant_payout_amount: merchantPayoutAmount,
          payment_status: 'PAID',
          refund_amount: 0.00,
          payment_intent_id: paymentIntentId,
        })
        .eq('id', orderId);

      await auth.client
        .from('merchant_orders')
        .update({
          merchant_payout_amount: merchantPayoutAmount,
          payment_status: 'PAID',
          refund_amount: 0.00,
        })
        .eq('order_id', orderId);
    } catch {
      // Ignore if columns are pending migration
    }
  }

  return NextResponse.json({
    orderId,
    subtotalAmount,
    platformFeeAmount,
    totalAmount,
    merchantPayoutAmount,
    feePayer,
    paymentIntentId,
  }, { status: 201 });
}

export async function GET(request: NextRequest) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });

  const { data, error } = await auth.client
    .from('orders')
    .select(`
      id,
      status,
      subtotal,
      service_fee,
      total,
      subtotal_amount,
      platform_fee_amount,
      total_amount,
      merchant_payout_amount,
      payment_status,
      refund_amount,
      payment_intent_id,
      payment_reference,
      created_at,
      merchant_orders(
        id,
        food_outlet_id,
        status,
        subtotal,
        merchant_payout_amount,
        payment_status,
        refund_amount,
        order_items(
          id,
          dish_id,
          dish_name,
          unit_price,
          quantity,
          customizations,
          notes,
          is_refunded,
          refund_amount,
          refund_reason
        )
      )
    `)
    .eq('customer_id', auth.user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ orders: data ?? [] });
}

