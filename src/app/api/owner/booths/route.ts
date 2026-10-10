import { NextRequest, NextResponse } from 'next/server';
import { requireRequestUser } from '@/lib/supabase/server';
import { createBooth } from '@/server/services/booth-service';

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

  try {
    const booth = await createBooth(auth.client, auth.user.id, restaurantId, name);
    return NextResponse.json({ booth, status: 'created' }, { status: 201 });
  } catch (error: any) {
    if (error.message.startsWith('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
