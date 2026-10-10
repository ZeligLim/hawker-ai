import type { SupabaseClient } from '@supabase/supabase-js';

export async function createOrder(client: SupabaseClient<any>, input: any) {
  if (!input.items || !Array.isArray(input.items) || input.items.length === 0) {
    throw new Error('Cart is empty');
  }

  // 1. Validate quantity and fetch dishes
  const dishIds = input.items.map((i: any) => i.dishId || i.id);
  const { data: dishes, error: dishesError } = await client
    .from('dishes')
    .select('id, price, food_outlet_id, name, customizations')
    .in('id', dishIds);

  if (dishesError || !dishes || dishes.length === 0) {
    throw new Error('Failed to fetch dish prices');
  }
  const dishMap = new Map(dishes.map((d: any) => [d.id, d]));

  // 2. Fetch fee settings for the outlets
  const stallIds = Array.from(new Set(dishes.map((d: any) => d.food_outlet_id)));
  const { data: outlets, error: outletsError } = await client
    .from('food_outlets')
    .select('id, fee_payer, platform_fee_fixed, platform_fee_percent, restaurant_id, restaurants(fee_payer, platform_fee_fixed, platform_fee_percent)')
    .in('id', stallIds);

  if (outletsError || !outlets || outlets.length === 0) {
    throw new Error('Failed to fetch outlet monetization settings');
  }

  const outletSettings = new Map(outlets.map((o: any) => {
    const rest = Array.isArray(o.restaurants) ? o.restaurants[0] : o.restaurants;
    return [o.id, {
      feePayer: (rest?.fee_payer ?? o.fee_payer ?? 'CUSTOMER') as 'CUSTOMER' | 'MERCHANT',
      feeFixedSen: Math.round(Number(rest?.platform_fee_fixed ?? o.platform_fee_fixed ?? 0.50) * 100),
      feePercent: Number(rest?.platform_fee_percent ?? o.platform_fee_percent ?? 0.0000)
    }];
  }));

  let totalOrderSubtotalSen = 0;

  // Track per-stall groups
  const merchantGroups = new Map<string, {
    stallId: string;
    subtotalSen: number;
    items: any[];
  }>();

  for (const item of input.items) {
    // Validate quantity
    const quantity = Number(item.quantity);
    if (!quantity || !Number.isInteger(quantity) || quantity <= 0 || quantity > 100) {
      throw new Error(`Invalid quantity for item ${item.dishId}`);
    }

    const dishId = item.dishId || item.id;
    const dish = dishMap.get(dishId);
    if (!dish) {
      throw new Error(`Dish not found: ${dishId}`);
    }

    // Base price in sen
    let itemPriceSen = Math.round(Number(dish.price) * 100);

    // Add customizations cost (matching string labels to db)
    if (item.customizations && Array.isArray(item.customizations)) {
      const dbCusts = Array.isArray(dish.customizations) ? dish.customizations : [];
      const dbCustMap = new Map<string, any>(dbCusts.map((c: any) => [c.label, c]));

      for (const customLabel of item.customizations) {
        if (typeof customLabel === 'string') {
          const matched = dbCustMap.get(customLabel);
          if (matched && typeof matched.price === 'number') {
            itemPriceSen += Math.round(matched.price * 100);
          }
        }
      }
    }

    const lineSubtotalSen = itemPriceSen * quantity;
    totalOrderSubtotalSen += lineSubtotalSen;

    let group = merchantGroups.get(dish.food_outlet_id);
    if (!group) {
      group = { stallId: dish.food_outlet_id, subtotalSen: 0, items: [] };
      merchantGroups.set(dish.food_outlet_id, group);
    }
    group.subtotalSen += lineSubtotalSen;
    
    // Create safe item payload for RPC
    group.items.push({
      dishId: dishId,
      stallId: dish.food_outlet_id,
      name: dish.name, // Trusted name
      price: itemPriceSen / 100, // Trusted price
      quantity: quantity,
      customizations: item.customizations || [],
      notes: item.notes || item.specialInstructions || null
    });
  }

  let finalTotalSen = 0;
  let finalMerchantPayoutTotalSen = 0;
  let totalServiceFeeSen = 0;

  const merchantPayouts = new Map<string, number>();
  const validatedRpcItems: any[] = [];

  for (const group of merchantGroups.values()) {
    const settings = outletSettings.get(group.stallId);
    if (!settings) throw new Error(`Missing fee settings for stall ${group.stallId}`);

    const platformFeeSen = settings.feeFixedSen + Math.round(group.subtotalSen * settings.feePercent);
    
    let totalSen = 0;
    let payoutSen = 0;

    if (settings.feePayer === 'CUSTOMER') {
      totalSen = group.subtotalSen + platformFeeSen;
      payoutSen = group.subtotalSen;
    } else {
      totalSen = group.subtotalSen;
      payoutSen = Math.max(0, group.subtotalSen - platformFeeSen);
    }

    finalTotalSen += totalSen;
    finalMerchantPayoutTotalSen += payoutSen;
    totalServiceFeeSen += platformFeeSen;

    merchantPayouts.set(group.stallId, payoutSen);
    
    for (const i of group.items) {
      validatedRpcItems.push(i);
    }
  }

  const paymentIntentId = input.paymentIntentId ?? input.paymentReference ?? `pi_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // 3. Execute order creation RPC with verified data
  let orderId: string | null = null;
  const subtotalAmount = totalOrderSubtotalSen / 100;
  const platformFeeAmount = totalServiceFeeSen / 100;
  const totalAmount = finalTotalSen / 100;
  const merchantPayoutAmount = finalMerchantPayoutTotalSen / 100;

  const rpcFullArgs = {
    p_table_session_id: input.tableSessionId || (null as unknown as string),
    p_subtotal: subtotalAmount,
    p_service_fee: platformFeeAmount,
    p_total: totalAmount,
    p_payment_reference: paymentIntentId,
    p_items: validatedRpcItems,
    p_subtotal_amount: subtotalAmount,
    p_platform_fee_amount: platformFeeAmount,
    p_total_amount: totalAmount,
    p_merchant_payout_amount: merchantPayoutAmount,
    p_payment_status: 'PENDING',
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
      p_items: validatedRpcItems,
    };
    const { data: legData, error: legError } = await client.rpc('create_order_with_items', legacyArgs);
    if (legError) {
      throw new Error(legError.message);
    }
    orderId = legData as string;
    
    // Update global order stats if using legacy rpc
    if (orderId) {
      await client.from('orders').update({
        subtotal_amount: subtotalAmount,
        platform_fee_amount: platformFeeAmount,
        total_amount: totalAmount,
        merchant_payout_amount: merchantPayoutAmount,
        payment_status: 'PENDING',
        payment_intent_id: paymentIntentId,
      }).eq('id', orderId);
    }
  }

  // 4. Update PER-STALL payouts
  if (orderId) {
    for (const [stallId, payoutSen] of merchantPayouts.entries()) {
      await client
        .from('merchant_orders')
        .update({
          merchant_payout_amount: payoutSen / 100,
          payment_status: 'PENDING',
          refund_amount: 0.00,
        })
        .eq('order_id', orderId)
        .eq('food_outlet_id', stallId);
    }
  }

  return {
    orderId,
    subtotalAmount,
    platformFeeAmount,
    totalAmount,
    merchantPayoutAmount,
    feePayer: 'CUSTOMER',
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
