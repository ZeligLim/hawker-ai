import type { SupabaseClient } from '@supabase/supabase-js';

export async function createOrder(client: SupabaseClient<any>, input: any) {
  // 1. Fetch fee settings for the outlets involved in this order
  const stallIds = Array.from(new Set(input.items.map((item: any) => item.stallId)));
  let feePayer: 'CUSTOMER' | 'MERCHANT' = 'CUSTOMER';
  let feeFixed = 0.50;
  let feePercent = 0.0000;

  try {
    const { data: outlets } = await client
      .from('food_outlets')
      .select('id, fee_payer, platform_fee_fixed, platform_fee_percent, restaurant_id, restaurants(fee_payer, platform_fee_fixed, platform_fee_percent)')
      .in('id', stallIds);

    if (outlets && outlets.length > 0) {
      const firstOutlet: any = outlets[0];
      const rest = Array.isArray(firstOutlet.restaurants) ? firstOutlet.restaurants[0] : firstOutlet.restaurants;
      feePayer = (rest?.fee_payer ?? firstOutlet.fee_payer ?? 'CUSTOMER') as 'CUSTOMER' | 'MERCHANT';
      feeFixed = Number(rest?.platform_fee_fixed ?? firstOutlet.platform_fee_fixed ?? 0.50);
      feePercent = Number(rest?.platform_fee_percent ?? firstOutlet.platform_fee_percent ?? 0.0000);
    }
  } catch {
    // Graceful fallback
  }

  // 2. Perform authoritative server-side calculation
  const subtotalAmount = Number(
    input.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0).toFixed(2)
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
    p_table_session_id: input.tableSessionId || (null as unknown as string),
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

  const { data: fullData, error: fullError } = await client.rpc('create_order_with_items', rpcFullArgs);

  if (!fullError && fullData) {
    orderId = fullData as string;
  } else {
    const legacyArgs = {
      p_table_session_id: input.tableSessionId || (null as unknown as string),
      p_subtotal: subtotalAmount,
      p_service_fee: platformFeeAmount,
      p_total: totalAmount,
      p_payment_reference: paymentIntentId,
      p_items: input.items,
    };
    const { data: legData, error: legError } = await client.rpc('create_order_with_items', legacyArgs);
    if (legError) {
      throw new Error(legError.message);
    }
    orderId = legData as string;
  }

  if (orderId) {
    try {
      await client
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

      await client
        .from('merchant_orders')
        .update({
          merchant_payout_amount: merchantPayoutAmount,
          payment_status: 'PAID',
          refund_amount: 0.00,
        })
        .eq('order_id', orderId);
    } catch {
      // Ignore
    }
  }

  return {
    orderId,
    subtotalAmount,
    platformFeeAmount,
    totalAmount,
    merchantPayoutAmount,
    feePayer,
    paymentIntentId,
  };
}

export async function getCustomerOrders(client: SupabaseClient<any>, customerId: string) {
  const { data, error } = await client
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
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data ?? [];
}

export async function getOrderReceipt(client: SupabaseClient<any>, orderId: string, customerId: string) {
  const { data: order, error } = await client
    .from('orders')
    .select(`
      id,
      created_at,
      subtotal,
      service_fee,
      total,
      payment_status,
      merchant_orders (
        id,
        food_outlet_id,
        food_outlets (
          name,
          restaurants ( name )
        ),
        order_items (
          id,
          dish_name,
          quantity,
          unit_price,
          customizations
        )
      )
    `)
    .eq('id', orderId)
    .eq('customer_id', customerId)
    .single() as any;

  if (error || !order) {
    throw new Error('Order not found');
  }
  
  // Flatten order items
  const items = [];
  let venueName = 'Hawker Centre';
  
  for (const mOrder of (order.merchant_orders || [])) {
      if (mOrder.food_outlets?.restaurants?.name) {
          venueName = mOrder.food_outlets.restaurants.name;
      }
      for (const i of (mOrder.order_items || [])) {
          items.push({
              id: i.id,
              name: i.dish_name,
              quantity: i.quantity,
              unitPrice: i.unit_price,
              subtotal: i.quantity * i.unit_price,
              customizations: i.customizations,
              stallName: mOrder.food_outlets?.name || 'Stall'
          });
      }
  }

  return {
      id: order.id,
      venueName,
      createdAt: order.created_at,
      subtotal: order.subtotal,
      serviceFee: order.service_fee,
      total: order.total,
      paymentStatus: order.payment_status,
      refundAmount: 0,
      items
  };
}
