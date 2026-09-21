import { NextRequest, NextResponse } from 'next/server';
import { requireRequestUser, createAdminClient } from '@/lib/supabase/server';

async function checkBoothAccess(auth: Awaited<ReturnType<typeof requireRequestUser>>, boothId: string) {
 if (!auth.client || !auth.user) {
 return { booth: null, role: null, error: auth.error ?? 'Authentication required.' };
 }

 const dbClient = createAdminClient() ?? auth.client;

 const { data: booth, error: boothError } = await dbClient
 .from('food_outlets')
 .select('id, restaurant_id, name, is_open, is_active, schedule, status, airwallex_account_id, created_at')
 .eq('id', boothId)
 .maybeSingle();

 if (boothError) {
 return { booth: null, role: null, error: boothError.message };
 }

 if (!booth) {
 return { booth: null, role: null, error: 'Booth not found.' };
 }

 // 1. Check if user is shop owner/manager
 const { data: shopMembership } = await dbClient
 .from('restaurant_memberships')
 .select('role')
 .eq('user_id', auth.user.id)
 .eq('restaurant_id', booth.restaurant_id)
 .maybeSingle();

 if (shopMembership && ['owner', 'manager'].includes(shopMembership.role)) {
 return { booth, role: `shop_${shopMembership.role}`, error: null };
 }

 // 2. Check if user is booth merchant/staff
 const { data: boothMembership } = await dbClient
 .from('merchant_memberships')
 .select('role')
 .eq('user_id', auth.user.id)
 .eq('food_outlet_id', boothId)
 .maybeSingle();

 if (boothMembership) {
 return { booth, role: `booth_${boothMembership.role}`, error: null };
 }

 return { booth: null, role: null, error: 'You do not have permission to manage this booth.' };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
 const auth = await requireRequestUser(request);
 const { id } = await params;

 const access = await checkBoothAccess(auth, id);
 if (access.error || !access.booth) {
 return NextResponse.json({ error: access.error }, { status: access.error === 'Booth not found.' ? 404 : 403 });
 }

 return NextResponse.json({
 booth: {
 ...access.booth,
 isOpen: access.booth.is_open ?? true,
 isActive: access.booth.is_active ?? true,
 schedule: access.booth.schedule,
 status: access.booth.status ?? (access.booth.is_open === false ? 'closed' : 'approved'),
 },
 role: access.role,
 });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
 const auth = await requireRequestUser(request);
 const { id } = await params;

 if (!auth.client || !auth.user) {
 return NextResponse.json({ error: auth.error }, { status: 401 });
 }

 const access = await checkBoothAccess(auth, id);
 if (access.error || !access.booth) {
 return NextResponse.json({ error: access.error }, { status: access.error === 'Booth not found.' ? 404 : 403 });
 }

 const body = await request.json().catch(() => null);
 if (!body || typeof body !== 'object') {
 return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
 }

 const isVenueOwner = access.role?.startsWith('shop_') || false;

 const update: {
 is_open?: boolean;
 is_active?: boolean;
 schedule?: any;
 status?: string;
 name?: string;
 airwallex_account_id?: string | null;
 } = {};

 // Master Override Layer: Venue Owner can toggle booth Active / Inactive
 const isActiveInput = body.is_active !== undefined ? body.is_active : body.isActive;
 if (isActiveInput !== undefined) {
 if (!isVenueOwner) {
 return NextResponse.json(
 { error: 'Forbidden: Only the hawker centre venue operator can set a booth Active or Inactive.' },
 { status: 403 }
 );
 }
 update.is_active = Boolean(isActiveInput);
 }

 // Operating Hours Schedule
 if (body.schedule !== undefined) {
 update.schedule = body.schedule;
 }

 // Airwallex account update
 if (body.airwallex_account_id !== undefined) {
 update.airwallex_account_id = body.airwallex_account_id;
 }

 // Operational Open/Closed toggle
 const isOpenInput = body.is_open !== undefined ? body.is_open : body.isOpen;
 if (typeof isOpenInput === 'boolean') {
 update.is_open = isOpenInput;
 update.status = isOpenInput ? 'approved' : 'closed';
 } else if (typeof body.status === 'string') {
 update.status = body.status;
 if (body.status === 'closed') {
 update.is_open = false;
 } else if (body.status === 'approved') {
 update.is_open = true;
 }
 }

 if (typeof body.name === 'string' && body.name.trim()) {
 update.name = body.name.trim();
 }

 if (Object.keys(update).length === 0) {
 return NextResponse.json({ error: 'No fields provided for update.' }, { status: 400 });
 }

 const dbClient = createAdminClient() ?? auth.client;

 const { data: updatedBooth, error: updateError } = await dbClient
 .from('food_outlets')
 .update(update)
 .eq('id', id)
 .select('id, restaurant_id, name, is_open, is_active, schedule, status, airwallex_account_id, created_at')
 .single();

 if (updateError || !updatedBooth) {
 return NextResponse.json({ error: updateError?.message ?? 'Unable to update booth.' }, { status: 500 });
 }

 return NextResponse.json({
 booth: {
 ...updatedBooth,
 isOpen: updatedBooth.is_open ?? true,
 isActive: updatedBooth.is_active ?? true,
 schedule: updatedBooth.schedule,
 status: updatedBooth.status ?? (updatedBooth.is_open === false ? 'closed' : 'approved'),
 },
 status: 'updated',
 });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
 const auth = await requireRequestUser(request);
 const { id } = await params;

 if (!auth.client || !auth.user) {
 return NextResponse.json({ error: auth.error }, { status: 401 });
 }

 // 1. Try atomic database RPC function first
 try {
 const { data: rpcData, error: rpcError } = await (auth.client.rpc as any)('delete_booth_slot', {
 p_booth_id: id,
 });

 if (!rpcError && rpcData) {
 const parsed = typeof rpcData === 'string' ? JSON.parse(rpcData) : rpcData;
 if (parsed.error) {
 return NextResponse.json({ error: parsed.error }, { status: 400 });
 }
 return NextResponse.json({ status: 'deleted', boothId: id, details: parsed });
 }
 } catch {
 // If RPC is not yet applied, fallback to direct queries below
 }

 // 2. Direct database fallback
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
 return NextResponse.json({ error: 'You do not have permission to delete this booth.' }, { status: 403 });
 }

 // Clean up order items and merchant orders if any exist
 const { data: merchantOrders } = await auth.client
 .from('merchant_orders')
 .select('id')
 .eq('food_outlet_id', id);

 if (merchantOrders && merchantOrders.length > 0) {
 const moIds = merchantOrders.map((mo) => mo.id);
 await auth.client.from('order_items').delete().in('merchant_order_id', moIds);
 await auth.client.from('merchant_orders').delete().eq('food_outlet_id', id);
 }

 await auth.client.from('booth_invitations').delete().eq('food_outlet_id', id);
 await auth.client.from('merchant_memberships').delete().eq('food_outlet_id', id);
 await auth.client.from('dishes').delete().eq('food_outlet_id', id);

 const { error: deleteError } = await auth.client
 .from('food_outlets')
 .delete()
 .eq('id', id);

 if (deleteError) {
 return NextResponse.json({ error: deleteError.message }, { status: 500 });
 }

 return NextResponse.json({ status: 'deleted', boothId: id });
}
