import { NextRequest, NextResponse } from 'next/server';
import { requireRequestUser } from '@/lib/supabase/server';
import { OwnerDishPatchSchema } from '@/shared/schemas/owner';
import { getDishOutletId, isUserAuthorizedForOutlet, updateDish } from '@/server/services/menu-service';

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const { id } = await context.params;

  const parsed = OwnerDishPatchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message || 'Invalid request payload.' }, { status: 400 });

  try {
    const foodOutletId = await getDishOutletId(auth.client, id);
    if (!foodOutletId) return NextResponse.json({ error: 'Dish not found.' }, { status: 404 });

    const isAuthorized = await isUserAuthorizedForOutlet(auth.client, auth.user.id, foodOutletId);
    if (!isAuthorized) return NextResponse.json({ error: 'You are not authorized for this stall.' }, { status: 403 });

    const dish = await updateDish(auth.client, id, parsed.data);
    return NextResponse.json({ dish });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
