import { z } from 'zod';

export const CreateTableSessionSchema = z.object({
  tableId: z.string().uuid().optional(),
  tableNumber: z.string().trim().min(1).max(20).optional(),
}).refine((data) => Boolean(data.tableId || data.tableNumber), {
  message: 'Either tableId or tableNumber must be provided.',
});

export const UpdateMerchantOrderSchema = z.object({
  status: z.enum(['waiting', 'accepted', 'preparing', 'ready', 'served', 'cancelled']),
});
