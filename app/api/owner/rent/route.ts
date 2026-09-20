import { NextRequest, NextResponse } from 'next/server';
import { requireRequestUser, createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) {
    return NextResponse.json({ error: auth.error ?? 'Unauthorized' }, { status: 401 });
  }

  const { boothId, amount, description } = await request.json();

  if (!boothId || !amount) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Get the booth's restaurant_id
  const { data: booth, error: boothError } = await auth.client
    .from('food_outlets')
    .select('restaurant_id')
    .eq('id', boothId)
    .single();

  if (boothError || !booth) {
    return NextResponse.json({ error: 'Booth not found' }, { status: 404 });
  }

  // Ensure user is owner of the restaurant
  const { data: membership, error: memError } = await auth.client
    .from('restaurant_memberships')
    .select('role')
    .eq('user_id', auth.user.id)
    .eq('restaurant_id', booth.restaurant_id)
    .single();

  if (memError || !membership || !['owner', 'manager'].includes(membership.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const dbAdmin = createAdminClient() || auth.client;

  const { data, error } = await dbAdmin
    .from('rent_invoices')
    .insert({
      restaurant_id: booth.restaurant_id,
      food_outlet_id: boothId,
      amount: parseFloat(amount),
      description: description || 'Stall Rent',
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    console.error('Rent invoice creation error:', error);
    return NextResponse.json({ error: 'Failed to create rent invoice' }, { status: 500 });
  }

  return NextResponse.json({ invoice: data });
}

export async function GET(request: NextRequest) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) {
    return NextResponse.json({ error: auth.error ?? 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'booth';
  const entityId = searchParams.get('id');

  if (!entityId) {
    return NextResponse.json({ error: 'Missing entity id' }, { status: 400 });
  }

  let query = auth.client.from('rent_invoices').select('*, food_outlets(name), restaurants(name)').order('created_at', { ascending: false });

  if (type === 'restaurant') {
    query = query.eq('restaurant_id', entityId);
  } else {
    query = query.eq('food_outlet_id', entityId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ invoices: data });
}
