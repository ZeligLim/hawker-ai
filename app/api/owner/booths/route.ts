import { NextRequest, NextResponse } from 'next/server';
import { requireRequestUser } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
 const auth = await requireRequestUser(request);
 if (!auth.client || !auth.user) {
 return NextResponse.json({ error: auth.error }, { status: 401 });
 }

 const body = await request.json().catch(() => null);
 const restaurantId = typeof body?.restaurantId === 'string' ? body.restaurantId : '';
 const name = typeof body?.name === 'string' ? body.name.trim() : '';

 if (!restaurantId) {
 return NextResponse.json({ error: 'Shop selection is required.' }, { status: 400 });
 }

 if (!name) {
 return NextResponse.json({ error: 'Booth name is required.' }, { status: 400 });
 }

 const { data: membership, error: membershipError } = await auth.client
 .from('restaurant_memberships')
 .select('restaurant_id, role')
 .eq('user_id', auth.user.id)
 .eq('restaurant_id', restaurantId)
 .maybeSingle();

 if (membershipError) {
 return NextResponse.json({ error: membershipError.message }, { status: 500 });
 }

 if (!membership || !['owner', 'manager'].includes(membership.role)) {
 return NextResponse.json({ error: 'You do not have permission to create booths for this shop.' }, { status: 403 });
 }

 const { data: booth, error: insertError } = await auth.client
 .from('food_outlets')
 .insert({
 restaurant_id: restaurantId,
 name,
 status: 'approved',
 is_open: true,
 })
 .select('id, restaurant_id, name, created_at')
 .single();

 if (insertError || !booth) {
 return NextResponse.json({ error: insertError?.message ?? 'Unable to create booth.' }, { status: 500 });
 }

 return NextResponse.json({ booth, status: 'created' }, { status: 201 });
}
