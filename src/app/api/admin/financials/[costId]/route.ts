import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requirePlatformAdmin } from '@/server/auth/rbac';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ costId: string }> }) {
  const auth = await requirePlatformAdmin(request);
  if (!auth.authorized) return auth.response;

  const { costId } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(costId)) {
    return NextResponse.json({ error: 'Invalid cost entry.' }, { status: 400 });
  }

  const client = createAdminClient() ?? auth.client;
  const { data, error } = await client
    .from('platform_costs')
    .delete()
    .eq('id', costId)
    .select('id')
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Cost entry not found.' }, { status: 404 });
  return NextResponse.json({ deleted: true });
}
