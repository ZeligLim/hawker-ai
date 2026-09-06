import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { requireRequestUser } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });

  const body = await request.json().catch(() => null);
  const token = typeof body?.token === 'string' ? body.token.trim() : '';

  if (!token) {
    return NextResponse.json({ error: 'Invitation token is required.' }, { status: 400 });
  }

  const tokenHash = createHash('sha256').update(token).digest('hex');
  const { data: invitation, error: invitationError } = await auth.client
    .from('booth_invitations')
    .select('id, food_outlet_id, expires_at, used_at')
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (invitationError) {
    return NextResponse.json({ error: invitationError.message }, { status: 500 });
  }

  if (!invitation) {
    return NextResponse.json({ error: 'This invitation is invalid or expired.' }, { status: 404 });
  }

  if (new Date(invitation.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: 'This invitation has expired.' }, { status: 410 });
  }

  if (invitation.used_at) {
    return NextResponse.json({ error: 'This invitation has already been used.' }, { status: 409 });
  }

  const { data: existingMembership, error: membershipCheckError } = await auth.client
    .from('merchant_memberships')
    .select('food_outlet_id')
    .eq('user_id', auth.user.id)
    .eq('food_outlet_id', invitation.food_outlet_id)
    .maybeSingle();

  if (membershipCheckError) {
    return NextResponse.json({ error: membershipCheckError.message }, { status: 500 });
  }

  if (existingMembership) {
    return NextResponse.json({ status: 'already-member', boothId: invitation.food_outlet_id });
  }

  const { error: insertError } = await auth.client.from('merchant_memberships').insert({
    user_id: auth.user.id,
    food_outlet_id: invitation.food_outlet_id,
    role: 'owner',
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const { error: markUsedError } = await auth.client
    .from('booth_invitations')
    .update({ used_at: new Date().toISOString(), used_by: auth.user.id })
    .eq('id', invitation.id);

  if (markUsedError) {
    return NextResponse.json({ error: markUsedError.message }, { status: 500 });
  }

  return NextResponse.json({ status: 'joined', boothId: invitation.food_outlet_id });
}
