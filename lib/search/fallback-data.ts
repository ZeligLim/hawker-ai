import { SearchFilters, SearchResult } from '@/lib/search/schema';

export type FallbackDish = {
  id: string;
  name: string;
  restaurantName: string;
  stallName: string;
  price: number;
  isVegetarian: boolean;
  isHalal: boolean;
  spiceLevel: number;
  proteinGrams: number;
  ingredients: string[];
};

export const fallbackDishes: FallbackDish[] = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    name: 'Nasi Lemak',
    restaurantName: 'Nasi Lemak Pak Mat',
    stallName: 'Kedai Nasi Lemak Pak Mat',
    price: 8.5,
    isVegetarian: false,
    isHalal: true,
    spiceLevel: 2,
    proteinGrams: 28,
    ingredients: ['Rice', 'Coconut milk', 'Egg', 'Chili'],
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    name: 'Curry Mee',
    restaurantName: 'Curry Mee Corner',
    stallName: 'Curry Mee Corner Stall',
    price: 12,
    isVegetarian: false,
    isHalal: true,
    spiceLevel: 4,
    proteinGrams: 32,
    ingredients: ['Noodles', 'Coconut milk', 'Prawns', 'Chili'],
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    name: 'Char Kway Teow',
    restaurantName: 'Char Kway Teow Stall',
    stallName: 'Char Kway Teow Stall 1',
    price: 11.5,
    isVegetarian: false,
    isHalal: false,
    spiceLevel: 3,
    proteinGrams: 26,
    ingredients: ['Flat rice noodles', 'Egg', 'Bean sprouts', 'Cockles'],
  },
  {
    id: '00000000-0000-4000-8000-000000000004',
    name: 'Vegetarian Curry Laksa',
    restaurantName: 'Hawker Street Social',
    stallName: 'Vegetarian Corner',
    price: 13,
    isVegetarian: true,
    isHalal: true,
    spiceLevel: 3,
    proteinGrams: 22,
    ingredients: ['Laksa noodles', 'Tofu', 'Coconut milk', 'Chili'],
  },
  {
    id: '00000000-0000-4000-8000-000000000005',
    name: 'Mee Goreng',
    restaurantName: 'Mamak Junction',
    stallName: 'Mamak Junction 2',
    price: 9.5,
    isVegetarian: false,
    isHalal: true,
    spiceLevel: 2,
    proteinGrams: 24,
    ingredients: ['Noodles', 'Egg', 'Onion', 'Chili'],
  },
];

const normalizeText = (value: string) => value.trim().toLowerCase();

export function getFallbackMatches(filters: SearchFilters): SearchResult[] {
  const query = normalizeText(filters.query ?? '');
  const queryTokens = query
    .split(/\s+/)
    .map((token) => token.replace(/[^a-z0-9]/g, ''))
    .filter(
      (token) =>
        token &&
        !/^\d+$/.test(token) &&
        !['rm', 'ringgit', 'myr', 'under', 'below', 'max', 'about', 'around', 'for', 'with', 'the', 'and', 'or'].includes(token),
    );

  const filtered = fallbackDishes.filter((dish) => {
    const matchesPrice =
      (filters.minPrice === undefined || dish.price >= filters.minPrice) &&
      (filters.maxPrice === undefined || dish.price <= filters.maxPrice);
    const matchesVegetarian =
      filters.vegetarian === undefined || dish.isVegetarian === filters.vegetarian;
    const matchesHalal = filters.halal === undefined || dish.isHalal === filters.halal;
    const matchesSpice =
      filters.spiceLevel === undefined || Math.abs(dish.spiceLevel - filters.spiceLevel) <= 1;

    const matchesQuery =
      queryTokens.length === 0 ||
      [dish.name, dish.restaurantName, dish.stallName, ...dish.ingredients].some((value) => {
        const haystack = normalizeText(value);
        return queryTokens.some((token) => haystack.includes(token));
      });

    return matchesPrice && matchesVegetarian && matchesHalal && matchesSpice && matchesQuery;
  });

  return filtered
    .map((dish) => {
      let score = 32;
      const reasons: string[] = [];

      if (filters.query && query) {
        const text = `${dish.name} ${dish.restaurantName} ${dish.stallName}`.toLowerCase();
        if (text.includes(query)) {
          score += 30;
          reasons.push('Keyword match');
        }
      }

      if (filters.maxPrice !== undefined && dish.price <= filters.maxPrice) {
        score += 14;
        reasons.push('Within budget');
      }

      if (filters.vegetarian !== undefined && dish.isVegetarian === filters.vegetarian) {
        score += 18;
        reasons.push(filters.vegetarian ? 'Vegetarian-friendly' : 'Non-vegetarian match');
      }

      if (filters.halal !== undefined && dish.isHalal === filters.halal) {
        score += 18;
        reasons.push(filters.halal ? 'Halal-friendly' : 'Non-halal match');
      }

      if (filters.spiceLevel !== undefined) {
        score += Math.max(0, 14 - Math.abs(dish.spiceLevel - filters.spiceLevel) * 4);
        if (Math.abs(dish.spiceLevel - filters.spiceLevel) === 0) {
          reasons.push('Matches spice preference');
        }
      }

      score += dish.proteinGrams / 3;
      if (dish.proteinGrams >= 30) {
        reasons.push('High protein');
      }

      return {
        id: dish.id,
        stallId: '00000000-0000-4000-8000-000000000000',
        name: dish.name,
        restaurantName: dish.restaurantName,
        stallName: dish.stallName,
        price: dish.price,
        isVegetarian: dish.isVegetarian,
        isHalal: dish.isHalal,
        spiceLevel: dish.spiceLevel,
        proteinGrams: dish.proteinGrams,
        matchScore: Number(score.toFixed(2)),
        reasons: [...new Set(reasons)].slice(0, 3),
      } satisfies SearchResult;
    })
    .sort((left, right) => right.matchScore - left.matchScore || left.price - right.price)
    .slice(0, filters.limit ?? 10);
}
