import { SearchFilters, SearchResult } from '@/shared/schemas/search';

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

// No mock data in codebase per architecture rules
export const fallbackDishes: FallbackDish[] = [];

export function getFallbackMatches(_filters: SearchFilters): SearchResult[] {
  return [];
}
