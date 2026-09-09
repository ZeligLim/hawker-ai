import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

export interface HawkerCentreStall {
  id: string;
  name: string;
  dishCount: number;
}

export interface HawkerCentreSummary {
  id: string;
  name: string;
  slug: string;
  address: string;
  lat: number | null;
  lng: number | null;
  stallsCount: number;
  activeStallsCount: number;
  dishesCount: number;
  rating: number;
  tag: string;
  stalls: HawkerCentreStall[];
  specialties: string[];
  minPrice: number | null;
  maxPrice: number | null;
  createdAt: string;
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function fetchHawkerCentres(options?: {
  slug?: string;
  search?: string;
}): Promise<HawkerCentreSummary[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  let query = supabase
    .from('restaurants')
    .select('id, name, slug, address, lat, lng, created_at')
    .order('name');

  if (options?.slug) {
    query = query.eq('slug', options.slug);
  }

  const { data: restaurants, error: rError } = await query;
  if (rError || !restaurants || restaurants.length === 0) {
    return [];
  }

  const restaurantIds = restaurants.map((r) => r.id);

  // Fetch stalls / food outlets
  const { data: outlets } = await supabase
    .from('food_outlets')
    .select('id, name, restaurant_id, created_at')
    .in('restaurant_id', restaurantIds);

  const outletIds = (outlets ?? []).map((o) => o.id);

  // Fetch dishes
  const { data: dishes } = outletIds.length > 0
    ? await supabase
        .from('dishes')
        .select('id, name, price, is_available, food_outlet_id, tags')
        .in('food_outlet_id', outletIds)
        .eq('is_available', true)
    : { data: [] };

  type OutletRow = NonNullable<typeof outlets>[number];
  type DishRow = NonNullable<typeof dishes>[number];

  const outletsByRestaurant = new Map<string, OutletRow[]>();
  (outlets ?? []).forEach((o) => {
    const list = outletsByRestaurant.get(o.restaurant_id) ?? [];
    list.push(o);
    outletsByRestaurant.set(o.restaurant_id, list);
  });

  const dishesByOutlet = new Map<string, DishRow[]>();
  (dishes ?? []).forEach((d) => {
    const list = dishesByOutlet.get(d.food_outlet_id) ?? [];
    list.push(d);
    dishesByOutlet.set(d.food_outlet_id, list);
  });

  let results: HawkerCentreSummary[] = restaurants.map((r) => {
    const venueOutlets = outletsByRestaurant.get(r.id) ?? [];
    const venueDishes: DishRow[] = [];
    const stallSummaries: HawkerCentreStall[] = [];

    venueOutlets.forEach((o) => {
      const stallDishes = dishesByOutlet.get(o.id) ?? [];
      venueDishes.push(...stallDishes);
      stallSummaries.push({
        id: o.id,
        name: o.name,
        dishCount: stallDishes.length,
      });
    });

    const prices = venueDishes.map((d) => Number(d.price)).filter((p) => !isNaN(p) && p > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : null;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : null;

    // Collect unique specialties from dish names and stall names
    const specialtySet = new Set<string>();
    venueDishes.forEach((d) => {
      if (d.name) specialtySet.add(d.name);
      if (Array.isArray(d.tags)) {
        d.tags.forEach((t) => typeof t === 'string' && specialtySet.add(t));
      }
    });

    // If few dishes, add stall names as specialties
    if (specialtySet.size < 3) {
      venueOutlets.forEach((o) => {
        if (!o.name.startsWith('Booth Slot')) {
          specialtySet.add(o.name);
        }
      });
    }

    const activeStallsCount = venueOutlets.filter(
      (o) => (dishesByOutlet.get(o.id)?.length ?? 0) > 0 || !o.name.startsWith('Booth Slot'),
    ).length;

    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      address: r.address || 'Kuala Lumpur, Malaysia',
      lat: r.lat ? Number(r.lat) : null,
      lng: r.lng ? Number(r.lng) : null,
      stallsCount: venueOutlets.length,
      activeStallsCount: Math.max(activeStallsCount, 1),
      dishesCount: venueDishes.length,
      rating: 4.9,
      tag: 'Verified Hawker Centre',
      stalls: stallSummaries,
      specialties: Array.from(specialtySet).slice(0, 4),
      minPrice,
      maxPrice,
      createdAt: r.created_at || '',
    };
  });

  if (options?.search) {
    const term = options.search.toLowerCase().trim();
    results = results.filter(
      (h) =>
        h.name.toLowerCase().includes(term) ||
        h.address.toLowerCase().includes(term) ||
        h.specialties.some((s) => s.toLowerCase().includes(term)),
    );
  }

  return results;
}
