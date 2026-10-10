import { NextRequest, NextResponse } from 'next/server';
import { CreateOrderSchema } from '@/shared/schemas/order';
import { requireRequestUser } from '@/lib/supabase/server';
import { createOrder, getCustomerOrders } from '@/server/services/order-service';

export async function POST(request: NextRequest) {
  const auth = await requireRequestUser(request);
  if (!auth.client) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });

  const parsed = CreateOrderSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message || 'Invalid request payload.' }, { status: 400 });

  try {
    const result = await createOrder(auth.client, parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });

  try {
    const orders = await getCustomerOrders(auth.client, auth.user.id);
    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
