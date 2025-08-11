import { z } from 'zod';
export const categorySchema = z.object({
  name: z.string().min(1),
  type: z.enum(['INCOME', 'EXPENSE', 'SAVINGS']),
  color: z.string().optional(), // e.g. "#10b981"
});