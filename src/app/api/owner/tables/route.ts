import { NextRequest, NextResponse } from 'next/server';
import { requireRequestUser, createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireRequestUser(request);
    if (!auth.client || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });

    const url = new URL(request.url);
    const restaurantId = url.searchParams.get('restaurantId');

    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant ID is required' }, { status: 400 });
    }

    const { data: membership } = await auth.client
      .from('restaurant_memberships')
      .select('role')
      .eq('user_id', auth.user.id)
      .eq('restaurant_id', restaurantId)
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: tables, error } = await auth.client
      .from('hawker_tables')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('table_number');

    if (error) throw error;

    return NextResponse.json({ tables: tables || [] });
  } catch (error: any) {
    console.error('Fetch tables error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireRequestUser(request);
    if (!auth.client || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });

    const { restaurantId, tableNumber } = await request.json();

    if (!restaurantId || !tableNumber) {
      return NextResponse.json({ error: 'Restaurant ID and Table Number are required' }, { status: 400 });
    }

    const { data: membership } = await auth.client
      .from('restaurant_memberships')
      .select('role')
      .eq('user_id', auth.user.id)
      .eq('restaurant_id', restaurantId)
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Check if table already exists
    const { data: existing } = await auth.client
      .from('hawker_tables')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .eq('table_number', tableNumber.trim())
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Table already exists in this venue' }, { status: 409 });
    }

    const { data: table, error } = await auth.client
      .from('hawker_tables')
      .insert({
        restaurant_id: restaurantId,
        table_number: tableNumber.trim(),
      })
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({ table });
  } catch (error: any) {
    console.error('Create table error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireRequestUser(request);
    if (!auth.client || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });

    const url = new URL(request.url);
    const tableId = url.searchParams.get('id');

    if (!tableId) {
      return NextResponse.json({ error: 'Table ID is required' }, { status: 400 });
    }
    
    // Check table ownership
    const { data: table } = await auth.client
      .from('hawker_tables')
      .select('restaurant_id')
      .eq('id', tableId)
      .maybeSingle();

    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    const { data: membership } = await auth.client
      .from('restaurant_memberships')
      .select('role')
      .eq('user_id', auth.user.id)
      .eq('restaurant_id', table.restaurant_id)
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await auth.client
      .from('hawker_tables')
      .delete()
      .eq('id', tableId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete table error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
