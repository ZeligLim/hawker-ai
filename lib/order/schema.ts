import { z } from 'zod';

export const CreateOrderItemSchema = z.object({
  dishId: z.string().uuid(),
  stallId: z.string().uuid(),
  name: z.string().trim().min(1).max(160),
  price: z.number().min(0),
  quantity: z.number().int().min(1).max(99),
  customizations: z.array(z.string().trim().max(100)).max(10).default([]),
  notes: z.string().trim().max(500).default(''),
});

export const CreateOrderSchema = z.object({
  tableSessionId: z.string().uuid().nullable().default(null),
  subtotal: z.number().min(0),
  serviceFee: z.number().min(0),
  total: z.number().min(0),
  paymentReference: z.string().trim().max(200).nullable().default(null),
  items: z.array(CreateOrderItemSchema).min(1).max(100),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
