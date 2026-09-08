import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { requireRequestUser, createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) return NextResponse.json({ error: auth.error ?? 'Authentication required.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const token = typeof body?.token === 'string' ? body.token.trim() : '';

  if (!token) {
    return NextResponse.json({ error: 'Invitation token is required.' }, { status: 400 });
  }

  const tokenHash = createHash('sha256').update(token).digest('hex');
  const adminClient = createAdminClient() ?? auth.client;

  const { data: invitation, error: invitationError } = await adminClient
    .from('booth_invitations')
    .select('id, food_outlet_id, expires_at, used_at, invited_email')
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

  // Security check: Only the invited email can claim this stall setup link
  if (invitation.invited_email && auth.user.email) {
    const invitedEmail = invitation.invited_email.toLowerCase().trim();
    const userEmail = auth.user.email.toLowerCase().trim();
    if (invitedEmail !== userEmail) {
      return NextResponse.json({
        error: `This setup link was sent specifically to ${invitation.invited_email}. You are currently signed in as ${auth.user.email}. Only the invited email can edit this stall. Please sign in with that email.`,
      }, { status: 403 });
    }
  }

  const { data: existingMembership, error: membershipCheckError } = await adminClient
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

  const stallName = typeof body?.stallName === 'string' ? body.stallName.trim() : typeof body?.boothName === 'string' ? body.boothName.trim() : '';
  if (stallName) {
    await adminClient.from('food_outlets').update({ name: stallName }).eq('id', invitation.food_outlet_id);
  }

  const userEmail = auth.user.email?.toLowerCase().trim() ?? invitation.invited_email?.toLowerCase().trim() ?? null;

  const { error: insertError } = await adminClient.from('merchant_memberships').insert({
    user_id: auth.user.id,
    food_outlet_id: invitation.food_outlet_id,
    role: 'owner',
    email: userEmail,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const { error: markUsedError } = await adminClient
    .from('booth_invitations')
    .update({ used_at: new Date().toISOString(), used_by: auth.user.id })
    .eq('id', invitation.id);

  if (markUsedError) {
    return NextResponse.json({ error: markUsedError.message }, { status: 500 });
  }

  return NextResponse.json({ status: 'joined', boothId: invitation.food_outlet_id });
}
