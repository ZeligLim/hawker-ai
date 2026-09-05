import { NextRequest, NextResponse } from 'next/server';
import { UpdateMerchantOrderSchema } from '@/lib/session/schema';
import { requireRequestUser } from '@/lib/supabase/server';

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const { id } = await context.params;

  const parsed = UpdateMerchantOrderSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { data: membership } = await auth.client
    .from('merchant_memberships')
    .select('food_outlet_id')
    .eq('user_id', auth.user.id)
    .maybeSingle();
  if (!membership) return NextResponse.json({ error: 'No merchant access.' }, { status: 403 });

  const { data, error } = await auth.client
    .from('merchant_orders')
    .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('food_outlet_id', membership.food_outlet_id)
    .select('id, order_id, food_outlet_id, status, subtotal, updated_at')
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Merchant order not found.' }, { status: 404 });
  return NextResponse.json({ order: data });
}
