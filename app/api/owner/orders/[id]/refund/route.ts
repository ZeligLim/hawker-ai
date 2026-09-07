import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRequestUser } from '@/lib/supabase/server';
import { processGatewayRefund } from '@/lib/payment/refund';

const RefundSchema = z.object({
  item_ids: z.array(z.string().uuid()).optional(),
  reason: z.string().trim().max(255).optional().default('Item Sold Out'),
  cancel_entire_order: z.boolean().optional().default(false),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { id: routeId } = await context.params;
  const parsed = RefundSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { item_ids, reason, cancel_entire_order } = parsed.data;

  // 1. Determine if routeId is a merchant_orders ID or an orders ID
  let merchantOrder: any = null;
  let order: any = null;

  const { data: moData } = await auth.client
    .from('merchant_orders')
    .select('id, order_id, food_outlet_id, subtotal, merchant_payout_amount, refund_amount, payment_status, status')
    .eq('id', routeId)
    .maybeSingle();

  if (moData) {
    merchantOrder = moData;
    const { data: oData } = await auth.client
      .from('orders')
      .select('id, subtotal, service_fee, total, subtotal_amount, platform_fee_amount, total_amount, merchant_payout_amount, payment_status, refund_amount, payment_intent_id, payment_reference, status')
      .eq('id', moData.order_id)
      .maybeSingle();
    order = oData;
  } else {
    const { data: oData } = await auth.client
      .from('orders')
      .select('id, subtotal, service_fee, total, subtotal_amount, platform_fee_amount, total_amount, merchant_payout_amount, payment_status, refund_amount, payment_intent_id, payment_reference, status')
      .eq('id', routeId)
      .maybeSingle();
    order = oData;
  }

  if (!order) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  // 2. Validate user's merchant authorization
  const outletId = merchantOrder?.food_outlet_id;
  let hasAccess = false;

  if (outletId) {
    const { data: directMem } = await auth.client
      .from('merchant_memberships')
      .select('food_outlet_id')
      .eq('user_id', auth.user.id)
      .eq('food_outlet_id', outletId)
      .maybeSingle();

    if (directMem) {
      hasAccess = true;
    } else {
      // Check restaurant-level owner
      const { data: outletRec } = await auth.client
        .from('food_outlets')
        .select('restaurant_id')
        .eq('id', outletId)
        .maybeSingle();

      if (outletRec?.restaurant_id) {
        const { data: restMem } = await auth.client
          .from('restaurant_memberships')
          .select('restaurant_id')
          .eq('user_id', auth.user.id)
          .eq('restaurant_id', outletRec.restaurant_id)
          .maybeSingle();
        if (restMem) hasAccess = true;
      }
    }
  } else {
    // Check if user owns any stall associated with this multi-stall order
    const { data: merchantOrders } = await auth.client
      .from('merchant_orders')
      .select('id, food_outlet_id')
      .eq('order_id', order.id);

    const stallIds = merchantOrders?.map((m) => m.food_outlet_id) ?? [];
    if (stallIds.length > 0) {
      const { data: userStalls } = await auth.client
        .from('merchant_memberships')
        .select('food_outlet_id')
        .eq('user_id', auth.user.id)
        .in('food_outlet_id', stallIds);
      if (userStalls && userStalls.length > 0) {
        hasAccess = true;
        merchantOrder = merchantOrders?.find((m) => m.food_outlet_id === userStalls[0].food_outlet_id);
      }
    }
  }

  if (!hasAccess) {
    return NextResponse.json({ error: 'Unauthorized to issue refunds for this order.' }, { status: 403 });
  }

  // 3. Fetch line items to refund
  let itemsQuery = auth.client
    .from('order_items')
    .select('id, order_id, merchant_order_id, dish_id, dish_name, unit_price, quantity, is_refunded, refund_amount')
    .eq('order_id', order.id);

  if (merchantOrder?.id) {
    itemsQuery = itemsQuery.eq('merchant_order_id', merchantOrder.id);
  }

  const { data: existingItems, error: itemsError } = await itemsQuery;
  if (itemsError || !existingItems || existingItems.length === 0) {
    return NextResponse.json({ error: 'No order items found.' }, { status: 404 });
  }

  const unrefundedItems = existingItems.filter((i) => !i.is_refunded);

  let itemsToRefund: typeof existingItems = [];
  if (cancel_entire_order) {
    itemsToRefund = unrefundedItems;
  } else if (item_ids && item_ids.length > 0) {
    itemsToRefund = unrefundedItems.filter((i) => item_ids.includes(i.id));
  }

  if (itemsToRefund.length === 0) {
    return NextResponse.json({ error: 'No eligible unrefunded items selected for refund.' }, { status: 400 });
  }

  // 4. Calculate total refund amount for these items
  const refundValue = Number(
    itemsToRefund.reduce((sum, item) => sum + Number(item.unit_price) * item.quantity, 0).toFixed(2)
  );

  // 5. Trigger payment gateway refund (HitPay / Stripe / Curlec)
  const paymentIntentId =
    order.payment_intent_id ?? order.payment_reference ?? `pi_${order.id}`;

  const gatewayResult = await processGatewayRefund({
    paymentIntentId,
    amount: refundValue,
    reason,
  });

  // 6. Update order_items to mark as refunded
  const itemIdsToRefund = itemsToRefund.map((i) => i.id);
  await auth.client
    .from('order_items')
    .update({
      is_refunded: true,
      refund_amount: refundValue,
      refund_reason: reason,
    })
    .in('id', itemIdsToRefund);

  // 7. Automatically toggle `is_available = false` on sold-out dishes
  const soldOutDishIds = Array.from(new Set(itemsToRefund.map((i) => i.dish_id).filter(Boolean)));
  if (soldOutDishIds.length > 0) {
    await auth.client
      .from('dishes')
      .update({ is_available: false })
      .in('id', soldOutDishIds);
  }

  // 8. Update orders & merchant_orders refund totals and statuses
  const currentOrderRefund = Number(order.refund_amount ?? 0);
  const newOrderRefund = Number((currentOrderRefund + refundValue).toFixed(2));
  const totalOrderAmount = Number(order.total_amount ?? order.total ?? 0);

  const isOrderFullyRefunded = newOrderRefund >= totalOrderAmount && totalOrderAmount > 0;
  const newPaymentStatus = isOrderFullyRefunded ? 'FULLY_REFUNDED' : 'PARTIALLY_REFUNDED';
  const newOrderStatus = isOrderFullyRefunded ? 'cancelled' : order.status;

  await auth.client
    .from('orders')
    .update({
      refund_amount: newOrderRefund,
      payment_status: newPaymentStatus,
      status: newOrderStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id);

  if (merchantOrder?.id) {
    const currentMoRefund = Number(merchantOrder.refund_amount ?? 0);
    const newMoRefund = Number((currentMoRefund + refundValue).toFixed(2));
    const moSubtotal = Number(merchantOrder.subtotal ?? 0);
    const newMoPayout = Math.max(0, Number((moSubtotal - newMoRefund).toFixed(2)));
    const newMoPaymentStatus = newMoRefund >= moSubtotal && moSubtotal > 0 ? 'FULLY_REFUNDED' : 'PARTIALLY_REFUNDED';

    await auth.client
      .from('merchant_orders')
      .update({
        refund_amount: newMoRefund,
        merchant_payout_amount: newMoPayout,
        payment_status: newMoPaymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', merchantOrder.id);
  }

  // 9. Real-time broadcast to customer channel
  try {
    const channel = auth.client.channel(`order-${order.id}`);
    await channel.send({
      type: 'broadcast',
      event: 'order_refunded',
      payload: {
        orderId: order.id,
        refundAmount: refundValue,
        totalRefundAmount: newOrderRefund,
        paymentStatus: newPaymentStatus,
        reason,
        refundedItems: itemsToRefund.map((i) => ({
          id: i.id,
          dishName: i.dish_name,
          quantity: i.quantity,
          amount: Number(i.unit_price) * i.quantity,
        })),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (realtimeErr) {
    // Broadcast is best effort
    console.warn('[Realtime] Failed to broadcast order_refunded:', realtimeErr);
  }

  return NextResponse.json({
    success: true,
    refundAmount: refundValue,
    totalRefundAmount: newOrderRefund,
    paymentStatus: newPaymentStatus,
    gateway: gatewayResult,
    refundedItems: itemsToRefund.map((i) => ({
      id: i.id,
      dishName: i.dish_name,
      quantity: i.quantity,
    })),
    soldOutDishesDisabled: soldOutDishIds,
  });
}
