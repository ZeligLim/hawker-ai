import { NextRequest, NextResponse } from 'next/server';
import { CreateTableSessionSchema } from '@/lib/session/schema';
import { requireRequestUser } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });

  const parsed = CreateTableSessionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { data: table, error: tableError } = await auth.client
    .from('hawker_tables')
    .select('id, restaurant_id, table_number')
    .eq('id', parsed.data.tableId)
    .maybeSingle();
  if (tableError) return NextResponse.json({ error: tableError.message }, { status: 500 });
  if (!table) return NextResponse.json({ error: 'Table not found.' }, { status: 404 });

  const { data, error } = await auth.client
    .from('table_sessions')
    .insert({ hawker_table_id: table.id, customer_id: auth.user.id, status: 'active' })
    .select('id, hawker_table_id, status, created_at')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ session: data, table }, { status: 201 });
}

export async function GET(request: NextRequest) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });

  const { data, error } = await auth.client
    .from('table_sessions')
    .select('id, hawker_table_id, status, created_at, hawker_tables(id, restaurant_id, table_number)')
    .eq('customer_id', auth.user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ session: data });
}
