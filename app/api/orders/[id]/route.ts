import { NextRequest, NextResponse } from 'next/server';
import { requireRequestUser } from '@/lib/supabase/server';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) {
    return NextResponse.json({ error: auth.error ?? 'Authentication required' }, { status: 401 });
  }

  try {
    const { id } = await context.params;

    const { data: order, error } = await auth.client
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
      .eq('id', id)
      .eq('customer_id', auth.user.id)
      .single() as any;

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
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

    const receipt = {
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

    return NextResponse.json({ receipt });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
