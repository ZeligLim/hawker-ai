import { NextRequest, NextResponse } from 'next/server';
import { requireRequestUser } from '@/lib/supabase/server';
import { OwnerDishSchema } from '@/shared/schemas/owner';
import { getAuthorizedOutletIds, isUserAuthorizedForOutlet, fetchOwnerDishes, createDish } from '@/server/services/menu-service';

export async function GET(request: NextRequest) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) {
    return NextResponse.json({ error: auth.error ?? 'Authentication required.' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const requestedOutletId = url.searchParams.get('foodOutletId');
    
    const allOutletIds = await getAuthorizedOutletIds(auth.client, auth.user.id, requestedOutletId);

    if (allOutletIds.length === 0) {
      return NextResponse.json({ error: 'Forbidden: Stall worker authorization required or stall not found.' }, { status: 403 });
    }

    const { dishes } = await fetchOwnerDishes(auth.client, allOutletIds);

    return NextResponse.json({
      dishes,
      foodOutletIds: allOutletIds,
    });
  } catch (err: any) {
    console.error('Owner dishes error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to fetch stall dishes.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) {
    return NextResponse.json({ error: auth.error ?? 'Authentication required.' }, { status: 401 });
  }

  const parsed = OwnerDishSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message || 'Invalid request payload.' }, { status: 400 });
  }

  const input = parsed.data;

  const isAuthorized = await isUserAuthorizedForOutlet(auth.client, auth.user.id, input.foodOutletId);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'You are not authorized for this stall.' }, { status: 403 });
  }

  try {
    const dish = await createDish(auth.client, input);
    return NextResponse.json({ dish }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
