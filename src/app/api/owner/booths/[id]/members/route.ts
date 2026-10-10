import { NextRequest, NextResponse } from 'next/server';
import { requireRequestUser, createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
 const auth = await requireRequestUser(request);
 if (!auth.client || !auth.user) {
 return NextResponse.json({ error: auth.error ?? 'Authentication required.' }, { status: 401 });
 }

 const { id: boothId } = await params;
 if (!boothId) {
 return NextResponse.json({ error: 'Booth id is required.' }, { status: 400 });
 }

 // 1. Verify booth exists and caller has restaurant owner/manager role
 const { data: outlet, error: outletError } = await auth.client
 .from('food_outlets')
 .select('id, restaurant_id, name')
 .eq('id', boothId)
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
 return NextResponse.json({ error: 'You are not allowed to view stall members for this shop.' }, { status: 403 });
 }

 const adminClient = createAdminClient() ?? auth.client;

 // 2. Fetch active members
 const { data: members, error: membersError } = await adminClient
 .from('merchant_memberships')
 .select('user_id, role, email, created_at')
 .eq('food_outlet_id', outlet.id);

 if (membersError) {
 return NextResponse.json({ error: membersError.message }, { status: 500 });
 }

 // 3. Fetch pending invitations
 const { data: invitations, error: invitesError } = await adminClient
 .from('booth_invitations')
 .select('id, invited_email, expires_at, created_at')
 .eq('food_outlet_id', outlet.id)
 .is('used_at', null)
 .gt('expires_at', new Date().toISOString());

 if (invitesError) {
 return NextResponse.json({ error: invitesError.message }, { status: 500 });
 }

 return NextResponse.json({
 boothId: outlet.id,
 boothName: outlet.name,
 members: (members ?? []).map((m) => ({
 userId: m.user_id,
 email: m.email ?? '',
 role: m.role,
 status: 'active' as const,
 createdAt: m.created_at,
 })),
 invitations: (invitations ?? []).map((i) => ({
 id: i.id,
 email: i.invited_email ?? '',
 status: 'pending' as const,
 expiresAt: i.expires_at,
 createdAt: i.created_at,
 })),
 });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
 const auth = await requireRequestUser(request);
 if (!auth.client || !auth.user) {
 return NextResponse.json({ error: auth.error ?? 'Authentication required.' }, { status: 401 });
 }

 const { id: boothId } = await params;
 if (!boothId) {
 return NextResponse.json({ error: 'Booth id is required.' }, { status: 400 });
 }

 // 1. Verify booth exists and caller is restaurant owner/manager
 const { data: outlet, error: outletError } = await auth.client
 .from('food_outlets')
 .select('id, restaurant_id')
 .eq('id', boothId)
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
 return NextResponse.json({ error: 'You are not allowed to manage stall access.' }, { status: 403 });
 }

 const body = await request.json().catch(() => null);
 const emailParam = request.nextUrl.searchParams.get('email');
 const targetEmail = (typeof body?.email === 'string' ? body.email : emailParam ?? '').trim().toLowerCase();
 const targetUserId = typeof body?.userId === 'string' ? body.userId.trim() : '';
 const targetInviteId = typeof body?.invitationId === 'string' ? body.invitationId.trim() : '';

 if (!targetEmail && !targetUserId && !targetInviteId) {
 return NextResponse.json({ error: 'An email, user ID, or invitation ID is required to remove access.' }, { status: 400 });
 }

 const adminClient = createAdminClient() ?? auth.client;

 // 2. Remove from active merchant_memberships
 if (targetEmail) {
 await adminClient
 .from('merchant_memberships')
 .delete()
 .eq('food_outlet_id', outlet.id)
 .eq('email', targetEmail);
 }
 if (targetUserId) {
 await adminClient
 .from('merchant_memberships')
 .delete()
 .eq('food_outlet_id', outlet.id)
 .eq('user_id', targetUserId);
 }

 // 3. Remove pending invitations
 if (targetEmail) {
 await adminClient
 .from('booth_invitations')
 .delete()
 .eq('food_outlet_id', outlet.id)
 .eq('invited_email', targetEmail);
 }
 if (targetInviteId) {
 await adminClient
 .from('booth_invitations')
 .delete()
 .eq('food_outlet_id', outlet.id)
 .eq('id', targetInviteId);
 }

 return NextResponse.json({
 status: 'removed',
 boothId: outlet.id,
 removedEmail: targetEmail || undefined,
 removedUserId: targetUserId || undefined,
 message: `Access revoked successfully. ${targetEmail ? `${targetEmail} has lost control of the store.` : ''}`,
 });
}
