import { NextRequest, NextResponse } from 'next/server';
import { requireRequestUser } from '@/lib/supabase/server';
import { getPaymentProvider } from '@/server/integrations/payment';

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

    // Server-side total calculation
    // Collect all dish IDs
    const dishIds = items.map(item => item.dishId);
    
    // Fetch dishes
    const { data: dishes, error: dishesError } = await auth.client
      .from('dishes')
      .select('id, price, food_outlet_id')
      .in('id', dishIds);

    if (dishesError || !dishes || dishes.length === 0) {
      return NextResponse.json({ error: 'Failed to fetch dish prices' }, { status: 500 });
    }
    
    const dishMap = new Map(dishes.map(d => [d.id, d]));
    
    let subtotal = 0;
    const validatedItems = [];
    
    for (const item of items) {
      const dish = dishMap.get(item.dishId);
      if (!dish) {
        return NextResponse.json({ error: `Dish not found: ${item.dishId}` }, { status: 400 });
      }
      
      let itemPrice = Number(dish.price);
      if (item.customizations) {
         Object.values(item.customizations).forEach((c: any) => {
             if (c && c.price) {
                 itemPrice += Number(c.price);
             }
         });
      }
      const itemSubtotal = itemPrice * Number(item.quantity);
      subtotal += itemSubtotal;
      
      validatedItems.push({
        ...item,
        unitPrice: itemPrice,
        subtotal: itemSubtotal,
        foodOutletId: dish.food_outlet_id
      });
    }

    const serviceFee = Number((subtotal * 0.05).toFixed(2));
    const total = subtotal + serviceFee;

    // Create Order in Database
    const { data: order, error: orderError } = await auth.client
      .from('orders')
      .insert({
        customer_id: auth.user.id,
        table_session_id: tableSessionId,
        subtotal,
        service_fee: serviceFee,
        total,
        status: 'pending_payment',
        payment_status: 'PENDING'
      })
      .select()
      .single() as any;

    if (orderError || !order) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // Create Merchant Orders and Order Items
    const outletGroups = validatedItems.reduce((acc, item) => {
        if (!acc[item.foodOutletId]) acc[item.foodOutletId] = { items: [], subtotal: 0 };
        acc[item.foodOutletId].items.push(item);
        acc[item.foodOutletId].subtotal += item.subtotal;
        return acc;
    }, {} as Record<string, { items: any[], subtotal: number }>);
    
    for (const [outletId, group] of Object.entries(outletGroups) as [string, any][]) {
       const { data: mOrder, error: mError } = await auth.client
         .from('merchant_orders')
         .insert({
           order_id: order.id,
           food_outlet_id: outletId,
           subtotal: group.subtotal,
           status: 'waiting',
           merchant_payout_amount: Number((group.subtotal * 0.95).toFixed(2)) // Example payout calculation
         })
         .select()
         .single() as any;
         
       if (mError || !mOrder) continue;
       
       const orderItemsInsert = group.items.map((i: any) => ({
          merchant_order_id: mOrder.id,
          dish_id: i.dishId,
          dish_name: i.name,
          quantity: i.quantity,
          unit_price: i.unitPrice,
          
          customizations: i.customizations,
          notes: i.specialInstructions || null
       }));
       
       await auth.client.from('order_items').insert(orderItemsInsert);
    }
    
    // Call Payment Provider
    const paymentProvider = getPaymentProvider();
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders?orderId=${order.id}`;
    
    const payment = await paymentProvider.createPayment({
      orderId: order.id,
      amount: total,
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
      .eq('id', order.id);

    return NextResponse.json(payment);
  } catch (error: any) {
    console.error('Payment Error:', error);
    return NextResponse.json({ error: error.message || 'Payment failed' }, { status: 500 });
  }
}
