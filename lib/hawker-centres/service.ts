import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

export interface HawkerCentreStall {
  id: string;
  name: string;
  dishCount: number;
  isOpen?: boolean;
  isActive?: boolean;
  schedule?: any;
}

export interface HawkerCentreSummary {
  id: string;
  name: string;
  slug: string;
  address: string;
  lat: number | null;
  lng: number | null;
  isActive?: boolean;
  hasAircon?: boolean;
  schedule?: any;
  stallsCount: number;
  activeStallsCount: number;
  dishesCount: number;
  rating: number;
  tag: string;
  stalls: HawkerCentreStall[];
  specialties: string[];
  minPrice: number | null;
  maxPrice: number | null;
  distanceKm?: number | null;
  walkMins?: number | null;
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
    .select('id, name, slug, address, lat, lng, is_active, schedule, has_aircon, rating, created_at')
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
    .select('id, name, restaurant_id, is_open, is_active, schedule, created_at')
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
      const isStallActive = (o as any).is_active ?? true;
      const isStallOpen = (o as any).is_open ?? true;
      stallSummaries.push({
        id: o.id,
        name: o.name,
        dishCount: stallDishes.length,
        isOpen: isStallOpen && isStallActive && (r.is_active ?? true),
        isActive: isStallActive,
        schedule: (o as any).schedule,
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
      isActive: (r as any).is_active ?? true,
      hasAircon: Boolean((r as any).has_aircon),
      stallsCount: venueOutlets.length,
      activeStallsCount: Math.max(activeStallsCount, 1),
      dishesCount: venueDishes.length,
      rating: (r as any).rating != null ? Number((r as any).rating) : 4.5,
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

export const RESERVED_CENTRE_SLUGS = new Set([
  'api',
  'apply',
  'auth',
  'booths',
  'customer',
  'home',
  'menu',
  'orders',
  'owner',
  'plans',
  'pricing',
  'profile',
  'results',
  'scan',
  'shop',
  'shop-owner',
  'stall',
  'subscribe',
  'favicon.ico',
  '_next',
]);

export async function resolveHawkerCentreBySlug(rawSlug: string): Promise<HawkerCentreSummary | null> {
  if (!rawSlug) return null;
  const decoded = decodeURIComponent(rawSlug).trim();
  if (RESERVED_CENTRE_SLUGS.has(decoded.toLowerCase())) {
    return null;
  }

  const allCentres = await fetchHawkerCentres();
  if (allCentres.length === 0) return null;

  const rawLower = decoded.toLowerCase();
  const normalizedInput = rawLower.replace(/[^a-z0-9]/g, '');

  // 1. Exact slug match
  const exactSlug = allCentres.find((c) => c.slug.toLowerCase() === rawLower);
  if (exactSlug) return exactSlug;

  // 2. Exact name match
  const exactName = allCentres.find((c) => c.name.toLowerCase() === rawLower);
  if (exactName) return exactName;

  // 3. Normalized alphanumeric match
  const normMatch = allCentres.find((c) => {
    const slugNorm = c.slug.toLowerCase().replace(/[^a-z0-9]/g, '');
    const nameNorm = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return normalizedInput === slugNorm || normalizedInput === nameNorm;
  });
  if (normMatch) return normMatch;

  // 4. Token & number heuristics (e.g. "restaurent888" matching "888-restoran", "lim'shawker" matching "lim-s-foodcourt")
  const inputDigits = normalizedInput.replace(/[^0-9]/g, '');
  if (inputDigits.length > 0) {
    const digitMatch = allCentres.find((c) => {
      const centreDigits = c.slug.replace(/[^0-9]/g, '') || c.name.replace(/[^0-9]/g, '');
      return centreDigits.length > 0 && (centreDigits.includes(inputDigits) || inputDigits.includes(centreDigits));
    });
    if (digitMatch) return digitMatch;
  }

  const inputTokens = decoded.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length >= 3);
  for (const token of inputTokens) {
    const isGeneric = ['restaurant', 'restaurent', 'restoran', 'foodcourt', 'hawker', 'centre', 'center', 'food'].includes(token);
    if (!isGeneric) {
      const tokenMatch = allCentres.find((c) => `${c.name} ${c.slug}`.toLowerCase().includes(token));
      if (tokenMatch) return tokenMatch;
    }
  }

  // 5. Broad substring match as fallback
  const broadMatch = allCentres.find((c) => {
    const slugNorm = c.slug.toLowerCase().replace(/[^a-z0-9]/g, '');
    const nameNorm = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return (
      (slugNorm.length >= 3 && normalizedInput.includes(slugNorm)) ||
      (normalizedInput.length >= 3 && slugNorm.includes(normalizedInput)) ||
      (nameNorm.length >= 3 && normalizedInput.includes(nameNorm)) ||
      (normalizedInput.length >= 3 && nameNorm.includes(normalizedInput))
    );
  });
  if (broadMatch) return broadMatch;

  return null;
}
