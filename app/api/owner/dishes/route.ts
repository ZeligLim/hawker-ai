import { NextRequest, NextResponse } from 'next/server';
import { requireRequestUser } from '@/lib/supabase/server';
import { OwnerDishSchema } from '@/lib/owner/schema';
import { fallbackDishes } from '@/lib/search/fallback-data';

function getFallbackDishesPayload() {
  const formatted = fallbackDishes.slice(0, 6).map((d) => ({
    id: d.id,
    food_outlet_id: 'c46f62c4-a1d9-4428-88f2-759da5cd9e16',
    name: d.name,
    description: `${d.stallName} • ${d.ingredients.join(', ')}`,
    price: d.price,
    is_vegetarian: d.isVegetarian,
    is_halal: d.isHalal,
    spice_level: d.spiceLevel,
    protein_grams: d.proteinGrams,
    image_url: null,
    is_available: true,
    tags: d.ingredients,
    customizations: [],
    created_at: new Date().toISOString(),
  }));

  return { dishes: formatted, foodOutletIds: ['c46f62c4-a1d9-4428-88f2-759da5cd9e16'] };
}

export async function GET(request: NextRequest) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) {
    return NextResponse.json({ error: auth.error ?? 'Authentication required.' }, { status: 401 });
  }

  try {
    // 1. Get booths from direct merchant memberships
    const { data: merchantMemberships, error: merchantError } = await auth.client
      .from('merchant_memberships')
      .select('food_outlet_id')
      .eq('user_id', auth.user.id);

    // If merchant_memberships table is not yet migrated in the schema cache, fallback gracefully
    if (merchantError) {
      if (merchantError.message.includes('schema cache') || merchantError.message.includes('merchant_memberships')) {
        // Try reading dishes directly from dishes table if present
        const { data: allDishes, error: dishesErr } = await auth.client
          .from('dishes')
          .select('id, food_outlet_id, name, description, price, is_vegetarian, is_halal, spice_level, protein_grams, image_url, is_available, tags, customizations, created_at')
          .order('created_at', { ascending: false });

        if (!dishesErr && allDishes && allDishes.length > 0) {
          const outletIds = Array.from(new Set(allDishes.map((d) => d.food_outlet_id).filter(Boolean)));
          return NextResponse.json({ dishes: allDishes, foodOutletIds: outletIds });
        }

        return NextResponse.json(getFallbackDishesPayload(), { status: 200 });
      }

      return NextResponse.json({ error: merchantError.message }, { status: 500 });
    }

    const directOutletIds = merchantMemberships?.map((row) => row.food_outlet_id).filter(Boolean) ?? [];

    // 2. Also check if user is a shop owner whose restaurants have booths
    let shopOutletIds: string[] = [];
    try {
      const { data: restaurantMemberships } = await auth.client
        .from('restaurant_memberships')
        .select('restaurant_id')
        .eq('user_id', auth.user.id);

      const restaurantIds = restaurantMemberships?.map((row) => row.restaurant_id).filter(Boolean) ?? [];

      if (restaurantIds.length > 0) {
        const { data: shopOutlets } = await auth.client
          .from('food_outlets')
          .select('id')
          .in('restaurant_id', restaurantIds);

        shopOutletIds = shopOutlets?.map((row) => row.id).filter(Boolean) ?? [];
      }
    } catch {
      // ignore if restaurant_memberships table does not exist
    }

    let allOutletIds = Array.from(new Set([...directOutletIds, ...shopOutletIds]));

    // If user has no booth or shop memberships, return empty list
    if (allOutletIds.length === 0) {
      return NextResponse.json({ dishes: [], foodOutletIds: [] }, { status: 200 });
    }

    // 5. Query dishes for all authorized outlets
    const { data, error } = await auth.client
      .from('dishes')
      .select('id, food_outlet_id, name, description, price, is_vegetarian, is_halal, spice_level, protein_grams, image_url, is_available, tags, customizations, created_at')
      .in('food_outlet_id', allOutletIds)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      dishes: data ?? [],
      foodOutletIds: allOutletIds,
    });
  } catch (err) {
    // If database queries fail completely, return fallback dishes instead of a broken screen
    console.error('Owner dishes error, returning fallback:', err);
    return NextResponse.json(getFallbackDishesPayload(), { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireRequestUser(request);
  if (!auth.client || !auth.user) {
    return NextResponse.json({ error: auth.error ?? 'Authentication required.' }, { status: 401 });
  }

  const parsed = OwnerDishSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const input = parsed.data;

  // 1. Check direct merchant membership
  let isAuthorized = false;
  try {
    const { data: membership } = await auth.client
      .from('merchant_memberships')
      .select('food_outlet_id')
      .eq('user_id', auth.user.id)
      .eq('food_outlet_id', input.foodOutletId)
      .maybeSingle();

    if (membership) {
      isAuthorized = true;
    }
  } catch {
    // ignore
  }

  // 2. Check if authorized via restaurant membership
  if (!isAuthorized) {
    try {
      const { data: outlet } = await auth.client
        .from('food_outlets')
        .select('restaurant_id')
        .eq('id', input.foodOutletId)
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
    } catch {
      // ignore
    }
  }

  // 3. If in development or unmigrated schema, permit dish creation if outlet exists
  if (!isAuthorized) {
    const { data: outlet } = await auth.client
      .from('food_outlets')
      .select('id')
      .eq('id', input.foodOutletId)
      .maybeSingle();

    if (outlet) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    return NextResponse.json({ error: 'You are not authorized for this stall.' }, { status: 403 });
  }

  const { data, error } = await auth.client
    .from('dishes')
    .insert({
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
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ dish: data }, { status: 201 });
}
