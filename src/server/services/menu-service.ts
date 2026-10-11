import type { SupabaseClient } from '@supabase/supabase-js';

export async function getAuthorizedOutletIds(client: SupabaseClient<any>, userId: string, requestedOutletId?: string | null): Promise<string[]> {
  // Run independent queries in parallel to avoid waterfall
  const [merchantRes, restaurantRes] = await Promise.all([
    client.from('merchant_memberships').select('food_outlet_id').eq('user_id', userId),
    client.from('restaurant_memberships').select('restaurant_id').eq('user_id', userId)
  ]);

  if (merchantRes.error) {
    throw new Error(merchantRes.error.message);
  }

  const directOutletIds = merchantRes.data?.map((row) => row.food_outlet_id).filter(Boolean) ?? [];
  let shopOutletIds: string[] = [];

  const restaurantIds = restaurantRes.data?.map((row) => row.restaurant_id).filter(Boolean) ?? [];
  if (restaurantIds.length > 0) {
    try {
      const { data: shopOutlets } = await client
        .from('food_outlets')
        .select('id')
        .in('restaurant_id', restaurantIds);

      shopOutletIds = shopOutlets?.map((row) => row.id).filter(Boolean) ?? [];
    } catch {
      // ignore
    }
  }

  let allOutletIds = Array.from(new Set([...directOutletIds, ...shopOutletIds]));

  if (requestedOutletId) {
    allOutletIds = allOutletIds.filter(id => id === requestedOutletId);
  } else if (allOutletIds.length > 0) {
    allOutletIds = [allOutletIds[0]];
  }

  return allOutletIds;
}

export async function isUserAuthorizedForOutlet(client: SupabaseClient<any>, userId: string, outletId: string): Promise<boolean> {
  // 1. Check direct merchant membership
  try {
    const { data: membership } = await client
      .from('merchant_memberships')
      .select('food_outlet_id')
      .eq('user_id', userId)
      .eq('food_outlet_id', outletId)
      .maybeSingle();

    if (membership) {
      return true;
    }
  } catch {
    // ignore
  }

  // 2. Check if authorized via restaurant membership
  try {
    const { data: outlet } = await client
      .from('food_outlets')
      .select('restaurant_id')
      .eq('id', outletId)
      .maybeSingle();

    if (outlet?.restaurant_id) {
      const { data: restMembership } = await client
        .from('restaurant_memberships')
        .select('id, role')
        .eq('user_id', userId)
        .eq('restaurant_id', outlet.restaurant_id)
        .maybeSingle();

      if (restMembership && ['owner', 'manager'].includes(restMembership.role)) {
        return true;
      }
    }
  } catch {
    // ignore
  }

  return false;
}

export async function fetchOwnerDishes(client: SupabaseClient<any>, allOutletIds: string[]) {
  // Determine if AI is enabled for the parent restaurant
  let aiEnabled = true;
  if (allOutletIds.length > 0) {
    try {
      const { data: outletData } = await client
        .from('food_outlets')
        .select('restaurants(ai_enabled)')
        .in('id', allOutletIds)
        .limit(1)
        .maybeSingle();

      const rest = Array.isArray(outletData?.restaurants) ? outletData.restaurants[0] : outletData?.restaurants;
      if (rest && rest.ai_enabled === false) {
        aiEnabled = false;
      }
    } catch (e) {
      // Fallback to true
    }
  }

  // Query dishes for all authorized outlets
  const { data, error } = await client
    .from('dishes')
    .select('id, food_outlet_id, name, description, price, is_vegetarian, is_halal, spice_level, protein_grams, image_url, is_available, tags, customizations, created_at')
    .in('food_outlet_id', allOutletIds)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return { dishes: data ?? [], aiEnabled };
}

export async function createDish(client: SupabaseClient<any>, input: any) {
  const { data, error } = await client
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
    throw new Error(error.message);
  }

  return data;
}

export async function getDishOutletId(client: SupabaseClient<any>, dishId: string): Promise<string | null> {
  const { data: dish, error: dishError } = await client
    .from('dishes')
    .select('food_outlet_id')
    .eq('id', dishId)
    .maybeSingle();

  if (dishError) {
    throw new Error(dishError.message);
  }

  return dish?.food_outlet_id ?? null;
}

export async function updateDish(client: SupabaseClient<any>, dishId: string, input: any) {
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

  const { data, error } = await client
    .from('dishes')
    .update(update)
    .eq('id', dishId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteDish(client: SupabaseClient<any>, dishId: string) {
  const { error } = await client.from('dishes').delete().eq('id', dishId);
  if (error) {
    throw new Error(error.message);
  }
  return true;
}
