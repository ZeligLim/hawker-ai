import { NextRequest, NextResponse } from 'next/server';
import { requireRequestUser } from '@/lib/supabase/server';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRequestUser(request);
  const { id } = await params;

  if (!auth.client || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.trim() : '';

  if (!name) {
    return NextResponse.json({ error: 'Booth name is required.' }, { status: 400 });
  }

  const { data: booth, error: boothError } = await auth.client
    .from('food_outlets')
    .select('id, restaurant_id, name')
    .eq('id', id)
    .maybeSingle();

  if (boothError) {
    return NextResponse.json({ error: boothError.message }, { status: 500 });
  }

  if (!booth) {
    return NextResponse.json({ error: 'Booth not found.' }, { status: 404 });
  }

  const { data: membership, error: membershipError } = await auth.client
    .from('restaurant_memberships')
    .select('restaurant_id, role')
    .eq('user_id', auth.user.id)
    .eq('restaurant_id', booth.restaurant_id)
    .maybeSingle();

  if (membershipError) {
    return NextResponse.json({ error: membershipError.message }, { status: 500 });
  }

  if (!membership || !['owner', 'manager'].includes(membership.role)) {
    return NextResponse.json({ error: 'You do not have permission to manage this booth.' }, { status: 403 });
  }

  const { data: updatedBooth, error: updateError } = await auth.client
    .from('food_outlets')
    .update({ name })
    .eq('id', id)
    .select('id, restaurant_id, name, created_at')
    .single();

  if (updateError || !updatedBooth) {
    return NextResponse.json({ error: updateError?.message ?? 'Unable to update booth.' }, { status: 500 });
  }

  return NextResponse.json({ booth: updatedBooth, status: 'updated' });
}
