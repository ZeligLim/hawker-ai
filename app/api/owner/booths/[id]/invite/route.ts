import { createHash, randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { requireRequestUser } from '@/lib/supabase/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Booth id is required.' }, { status: 400 });
  }

  const { data: outlet, error: outletError } = await auth.client
    .from('food_outlets')
    .select('id, restaurant_id')
    .eq('id', id)
    .maybeSingle();

  if (outletError || !outlet) {
    return NextResponse.json({ error: 'Booth not found.' }, { status: 404 });
  }

  const { data: membership, error: membershipError } = await auth.client
    .from('restaurant_memberships')
    .select('restaurant_id, role')
    .eq('user_id', auth.user.id)
    .eq('restaurant_id', outlet.restaurant_id)
    .maybeSingle();

  if (membershipError || !membership || !['owner', 'manager'].includes(membership.role)) {
    return NextResponse.json({ error: 'You are not allowed to create booth invitations for this shop.' }, { status: 403 });
  }

  const token = randomBytes(18).toString('base64url');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();

  const { error: insertError } = await auth.client.from('booth_invitations').insert({
    food_outlet_id: outlet.id,
    created_by: auth.user.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({
    boothId: outlet.id,
    token,
    expiresAt,
    status: 'created',
  }, { status: 201 });
}
