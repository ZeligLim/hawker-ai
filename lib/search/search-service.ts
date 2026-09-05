import { supabase } from '@/lib/supabase/client';
import { getFallbackMatches } from '@/lib/search/fallback-data';
import { SearchFilters, SearchFiltersSchema, SearchResult, SearchResultSchema } from '@/lib/search/schema';

type DishRow = {
  id: string;
  name: string;
  price: number;
  is_vegetarian: boolean;
  is_halal: boolean;
  spice_level: number;
  protein_grams: number;
  food_outlet_id: string;
};

type FoodOutletRow = {
  id: string;
  name: string;
  restaurant_id: string;
};

type RestaurantRow = {
  id: string;
  name: string;
  slug: string;
  address: string;
};

const normalizeText = (value: string | null | undefined): string => (value ?? '').trim().toLowerCase();

export class SearchService {
  static async search(rawFilters: SearchFilters): Promise<SearchResult[]> {
    const filters = SearchFiltersSchema.parse(rawFilters);

    if (!supabase) {
      return getFallbackMatches(filters);
    }

    const dishQuery = supabase.from('dishes').select('*');

    if (filters.minPrice !== undefined) {
      dishQuery.gte('price', filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
      dishQuery.lte('price', filters.maxPrice);
    }

    if (filters.vegetarian !== undefined) {
      dishQuery.eq('is_vegetarian', filters.vegetarian);
    }

    if (filters.halal !== undefined) {
      dishQuery.eq('is_halal', filters.halal);
    }

    if (filters.spiceLevel !== undefined) {
      dishQuery.eq('spice_level', filters.spiceLevel);
    }

    const { data: dishes, error: dishesError } = await dishQuery;

    if (dishesError) {
      throw new Error(`Failed to load dishes: ${dishesError.message}`);
    }

    const uniqueOutletIds = [...new Set((dishes ?? []).map((dish) => dish.food_outlet_id))];

    let outletRows: FoodOutletRow[] = [];
    if (uniqueOutletIds.length > 0) {
      const { data: outlets, error: outletsError } = await supabase
        .from('food_outlets')
        .select('id, name, restaurant_id')
        .in('id', uniqueOutletIds);

      if (outletsError) {
        throw new Error(`Failed to load stalls: ${outletsError.message}`);
      }

      outletRows = (outlets ?? []) as FoodOutletRow[];
    }

    const uniqueRestaurantIds = [...new Set(outletRows.map((outlet) => outlet.restaurant_id))];

    let restaurantRows: RestaurantRow[] = [];
    if (uniqueRestaurantIds.length > 0) {
      const { data: restaurants, error: restaurantsError } = await supabase
        .from('restaurants')
        .select('id, name, slug, address')
        .in('id', uniqueRestaurantIds);

      if (restaurantsError) {
        throw new Error(`Failed to load restaurants: ${restaurantsError.message}`);
      }

      restaurantRows = (restaurants ?? []) as RestaurantRow[];
    }

    const restaurantsById = new Map(restaurantRows.map((restaurant) => [restaurant.id, restaurant]));
    const outletsById = new Map(outletRows.map((outlet) => [outlet.id, outlet]));

    const scored = (dishes ?? [])
      .map((dish) => {
        const outlet = outletsById.get(dish.food_outlet_id);
        const restaurant = outlet ? restaurantsById.get(outlet.restaurant_id) : undefined;
        const normalizedQuery = normalizeText(filters.query);
        const dishName = normalizeText(dish.name);
        const restaurantName = normalizeText(restaurant?.name);
        const stallName = normalizeText(outlet?.name);

        let queryScore = 0;
        const reasons: string[] = [];

        if (normalizedQuery) {
          const queryMatchesDish = dishName.includes(normalizedQuery);
          const queryMatchesRestaurant = restaurantName.includes(normalizedQuery);
          const queryMatchesStall = stallName.includes(normalizedQuery);
          if (queryMatchesDish || queryMatchesRestaurant || queryMatchesStall) {
            queryScore += 15;
            reasons.push('Keyword match');
          }
        }

        if (filters.maxPrice !== undefined && dish.price <= filters.maxPrice) {
          queryScore += 10;
          reasons.push('Within budget');
        }

        if (filters.minPrice !== undefined && dish.price >= filters.minPrice) {
          queryScore += 3;
        }

        if (filters.vegetarian !== undefined) {
          const matches = dish.is_vegetarian === filters.vegetarian;
          if (matches) {
            queryScore += 18;
            reasons.push(filters.vegetarian ? 'Vegetarian-friendly' : 'Non-vegetarian match');
          }
        }

        if (filters.halal !== undefined) {
          const matches = dish.is_halal === filters.halal;
          if (matches) {
            queryScore += 18;
            reasons.push(filters.halal ? 'Halal-friendly' : 'Non-halal match');
          }
        }

        if (filters.spiceLevel !== undefined) {
          const spiceDistance = Math.abs(dish.spice_level - filters.spiceLevel);
          queryScore += Math.max(0, 12 - spiceDistance * 4);
          if (spiceDistance === 0) {
            reasons.push('Matches spice preference');
          }
        }

        const proteinScore = Math.min(10, dish.protein_grams / 10);
        const baseRating = proteinScore + (dish.is_vegetarian ? 1 : 0) + (dish.is_halal ? 1 : 0);
        const matchScore = Number((baseRating * 10 + queryScore).toFixed(2));

        const result: SearchResult = {
          id: dish.id,
          name: dish.name,
          restaurantName: restaurant?.name ?? 'Unknown restaurant',
          stallName: outlet?.name ?? 'Unknown stall',
          price: Number(dish.price),
          isVegetarian: dish.is_vegetarian,
          isHalal: dish.is_halal,
          spiceLevel: dish.spice_level,
          proteinGrams: Number(dish.protein_grams),
          matchScore,
          reasons: [...new Set(reasons)].slice(0, 3),
        };

        return SearchResultSchema.parse(result);
      })
      .sort((left, right) => right.matchScore - left.matchScore || left.price - right.price)
      .slice(0, filters.limit);

    return scored;
  }
}
