import { z } from 'zod';

const optionalBoolean = z.preprocess((value) => {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }

  return value;
}, z.boolean().optional());

export const SearchIntentSchema = z.object({
  query: z.string().trim().default(''),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  vegetarian: z.boolean().optional(),
  halal: z.boolean().optional(),
  spiceLevel: z.number().int().min(0).max(5).optional(),
  limit: z.number().int().min(1).max(20).default(10),
});

export type SearchIntent = z.infer<typeof SearchIntentSchema>;

export const SearchFiltersSchema = z.object({
  query: z.string().trim().optional().default(''),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  vegetarian: optionalBoolean,
  halal: optionalBoolean,
  spiceLevel: z.coerce.number().int().min(0).max(5).optional(),
  limit: z.coerce.number().int().min(1).max(20).default(10),
});

export type SearchFilters = z.infer<typeof SearchFiltersSchema>;

export const SearchResultSchema = z.object({
  id: z.string(),
  stallId: z.string().optional(),
  name: z.string(),
  restaurantName: z.string(),
  stallName: z.string(),
  price: z.number(),
  isVegetarian: z.boolean(),
  isHalal: z.boolean(),
  spiceLevel: z.number(),
  proteinGrams: z.number(),
  matchScore: z.number(),
  reasons: z.array(z.string()),
});

export type SearchResult = z.infer<typeof SearchResultSchema>;
