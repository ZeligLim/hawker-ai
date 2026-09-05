import { NextRequest, NextResponse } from 'next/server';
import { requireRequestUser } from '@/lib/supabase/server';
import { OwnerDishSchema } from '@/lib/owner/schema';

export async function GET(request: NextRequest) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });

  const { data, error } = await auth.client
    .from('dishes')
    .select('id, food_outlet_id, name, description, price, is_vegetarian, is_halal, spice_level, protein_grams, image_url, is_available, tags, customizations, created_at')
    .in(
      'food_outlet_id',
      (await auth.client.from('merchant_memberships').select('food_outlet_id').eq('user_id', auth.user.id)).data?.map((row) => row.food_outlet_id) ?? [],
    )
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ dishes: data ?? [] });
}

export async function POST(request: NextRequest) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });

  const parsed = OwnerDishSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { data: membership } = await auth.client
    .from('merchant_memberships')
    .select('food_outlet_id')
    .eq('user_id', auth.user.id)
    .eq('food_outlet_id', parsed.data.foodOutletId)
    .maybeSingle();

  if (!membership) return NextResponse.json({ error: 'You are not authorized for this stall.' }, { status: 403 });

  const input = parsed.data;
  const { data, error } = await auth.client.from('dishes').insert({
    food_outlet_id: input.foodOutletId,
    name: input.name,
    description: input.description,
    price: input.price,
    is_vegetarian: input.isVegetarian,
    is_halal: input.isHalal,
    spice_level: input.spiceLevel,
    protein_grams: input.proteinGrams,
    image_url: input.imageUrl,
    is_available: input.isAvailable,
    tags: input.tags,
    customizations: input.customizations,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ dish: data }, { status: 201 });
}
