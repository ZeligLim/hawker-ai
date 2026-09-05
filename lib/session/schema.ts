import { z } from 'zod';

export const CreateTableSessionSchema = z.object({
  tableId: z.string().uuid(),
});

export const UpdateMerchantOrderSchema = z.object({
  status: z.enum(['waiting', 'accepted', 'preparing', 'ready', 'served', 'cancelled']),
});
