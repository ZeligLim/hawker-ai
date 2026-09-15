import { createHash, randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { requireRequestUser, createAdminClient } from '@/lib/supabase/server';
import { sendStallInvitationEmail } from '@/lib/email/mailer';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) {
    return NextResponse.json({ error: auth.error ?? 'Authentication required.' }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Booth id is required.' }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  const { data: outlet, error: outletError } = await auth.client
    .from('food_outlets')
    .select('id, restaurant_id, name')
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

  const { data: restaurant } = await auth.client
    .from('restaurants')
    .select('name')
    .eq('id', outlet.restaurant_id)
    .maybeSingle();

  const venueName = restaurant?.name || 'Hawker Centre';
  const stallName = outlet.name || 'Booth Slot';

  const adminClient = createAdminClient() ?? auth.client;

  if (email) {
    // Check if this email is already an active member of this booth
    const { data: existingMember } = await adminClient
      .from('merchant_memberships')
      .select('user_id')
      .eq('food_outlet_id', outlet.id)
      .eq('email', email)
      .maybeSingle();

    if (existingMember) {
      return NextResponse.json({ error: `${email} is already an active manager/staff of this stall.` }, { status: 400 });
    }
  }

  const token = randomBytes(18).toString('base64url');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();

  if (email) {
    // Invalidate any older pending invitations for this email on this booth
    await adminClient
      .from('booth_invitations')
      .delete()
      .eq('food_outlet_id', outlet.id)
      .eq('invited_email', email);
  }

  const { error: insertError } = await adminClient.from('booth_invitations').insert({
    food_outlet_id: outlet.id,
    created_by: auth.user.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
    invited_email: email || null,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  const origin = host ? `${proto}://${host}` : (request.nextUrl.origin || 'http://localhost:3000');
  const setupLink = `${origin}/booths/join?token=${token}`;

  if (!email) {
    return NextResponse.json({
      boothId: outlet.id,
      token,
      setupLink,
      expiresAt,
      status: 'generated',
      delivered: false,
      simulated: false,
      provider: 'direct',
      message: 'Setup link generated successfully.',
    }, { status: 201 });
  }

  // Dispatch real email via Resend, SMTP, or local preview simulation
  const emailResult = await sendStallInvitationEmail({
    to: email,
    stallName,
    venueName,
    setupLink,
    expiresAt,
  });

  return NextResponse.json({
    boothId: outlet.id,
    email,
    token,
    setupLink,
    expiresAt,
    status: 'sent',
    delivered: emailResult.delivered,
    simulated: emailResult.simulated,
    provider: emailResult.provider,
    previewUrl: emailResult.previewUrl,
    message: emailResult.delivered
      ? `Setup invitation email sent successfully to ${email} via ${emailResult.provider.toUpperCase()}!`
      : `Setup link generated for ${email}. (Email provider not configured in .env.local — copy the link below to test or configure RESEND_API_KEY / SMTP)`,
  }, { status: 201 });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) {
    return NextResponse.json({ error: auth.error ?? 'Authentication required.' }, { status: 401 });
  }

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
    return NextResponse.json({ error: 'You are not allowed to revoke invitations for this shop.' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const email = (typeof body?.email === 'string' ? body.email : request.nextUrl.searchParams.get('email') ?? '').trim().toLowerCase();
  const invitationId = (typeof body?.invitationId === 'string' ? body.invitationId : request.nextUrl.searchParams.get('invitationId') ?? '').trim();

  const adminClient = createAdminClient() ?? auth.client;

  if (email) {
    await adminClient
      .from('booth_invitations')
      .delete()
      .eq('food_outlet_id', outlet.id)
      .eq('invited_email', email);
  } else if (invitationId) {
    await adminClient
      .from('booth_invitations')
      .delete()
      .eq('food_outlet_id', outlet.id)
      .eq('id', invitationId);
  } else {
    return NextResponse.json({ error: 'Email or invitation ID is required to revoke an invitation.' }, { status: 400 });
  }

  return NextResponse.json({ status: 'revoked', message: 'Invitation revoked successfully.' });
}
