import { NextRequest, NextResponse } from 'next/server';
import { requireRequestUser } from '@/lib/supabase/server';
import { getOrderReceipt } from '@/server/services/order-service';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) {
    return NextResponse.json({ error: auth.error ?? 'Authentication required' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const receipt = await getOrderReceipt(auth.client, id, auth.user.id);
    return NextResponse.json({ receipt });
  } catch (error: any) {
    if (error.message === 'Order not found') {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
