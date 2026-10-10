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
  subtotalAmount: z.number().min(0).optional(),
  platformFeeAmount: z.number().min(0).optional(),
  totalAmount: z.number().min(0).optional(),
  merchantPayoutAmount: z.number().min(0).optional(),
  paymentStatus: z.enum(['PAID', 'PARTIALLY_REFUNDED', 'FULLY_REFUNDED', 'FAILED']).optional(),
  paymentIntentId: z.string().trim().max(255).optional(),
  items: z.array(CreateOrderItemSchema).min(1).max(100),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

export const RefundOrderSchema = z.object({
  item_ids: z.array(z.string().uuid()).optional(),
  reason: z.string().trim().max(255).optional().default('Item Sold Out'),
  cancel_entire_order: z.boolean().optional().default(false),
});

export type RefundOrderInput = z.infer<typeof RefundOrderSchema>;

