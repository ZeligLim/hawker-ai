import { NextRequest, NextResponse } from 'next/server';
import { requireRequestUser } from '@/lib/supabase/server';
import { OwnerDishPatchSchema } from '@/lib/owner/schema';

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const { id } = await context.params;

  const parsed = OwnerDishPatchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { data: dish, error: dishError } = await auth.client.from('dishes').select('id, food_outlet_id').eq('id', id).maybeSingle();
  if (dishError) return NextResponse.json({ error: dishError.message }, { status: 500 });
  if (!dish) return NextResponse.json({ error: 'Dish not found.' }, { status: 404 });

  let isAuthorized = false;
  const { data: membership } = await auth.client
    .from('merchant_memberships')
    .select('food_outlet_id')
    .eq('user_id', auth.user.id)
    .eq('food_outlet_id', dish.food_outlet_id)
    .maybeSingle();

  if (membership) {
    isAuthorized = true;
  } else {
    const { data: outlet } = await auth.client
      .from('food_outlets')
      .select('restaurant_id')
      .eq('id', dish.food_outlet_id)
      .maybeSingle();

    if (outlet?.restaurant_id) {
      const { data: restMembership } = await auth.client
        .from('restaurant_memberships')
        .select('id, role')
        .eq('user_id', auth.user.id)
        .eq('restaurant_id', outlet.restaurant_id)
        .maybeSingle();

      if (restMembership && ['owner', 'manager'].includes(restMembership.role)) {
        isAuthorized = true;
      }
    }
  }

  if (!isAuthorized) return NextResponse.json({ error: 'You are not authorized for this stall.' }, { status: 403 });

  const input = parsed.data;
  const update = {
    ...(input.name === undefined ? {} : { name: input.name }),
    ...(input.description === undefined ? {} : { description: input.description }),
    ...(input.price === undefined ? {} : { price: input.price }),
    ...(input.isVegetarian === undefined ? {} : { is_vegetarian: input.isVegetarian }),
    ...(input.isHalal === undefined ? {} : { is_halal: input.isHalal }),
    ...(input.spiceLevel === undefined ? {} : { spice_level: input.spiceLevel }),
    ...(input.proteinGrams === undefined ? {} : { protein_grams: input.proteinGrams }),
    ...(input.imageUrl === undefined ? {} : { image_url: input.imageUrl }),
    ...(input.isAvailable === undefined ? {} : { is_available: input.isAvailable }),
    ...(input.tags === undefined ? {} : { tags: input.tags }),
    ...(input.customizations === undefined ? {} : { customizations: input.customizations }),
  };

  const { data, error } = await auth.client.from('dishes').update(update).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ dish: data });
}
