import { z } from 'zod';

export const OwnerCustomizationSchema = z.object({
  label: z.string().trim().min(1).max(80),
  price: z.number().min(0).max(9999),
});

export const OwnerDishSchema = z.object({
  foodOutletId: z.string().uuid(),
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000).default(''),
  price: z.number().min(0).max(999999),
  isVegetarian: z.boolean().default(false),
  isHalal: z.boolean().default(false),
  spiceLevel: z.number().int().min(0).max(5).default(0),
  proteinGrams: z.number().min(0).max(999999).default(0),
  imageUrl: z.string().url().nullable().default(null),
  isAvailable: z.boolean().default(true),
  tags: z.array(z.string().trim().min(1).max(50)).max(30).default([]),
  customizations: z.array(OwnerCustomizationSchema).max(10).default([]),
});

export const OwnerDishPatchSchema = OwnerDishSchema.omit({ foodOutletId: true }).partial();
export type OwnerDishInput = z.infer<typeof OwnerDishSchema>;
