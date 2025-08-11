import { z } from 'zod';

export const createTxSchema = z.object({
  amount: z.number().finite(),
  currency: z.string().min(3).max(3).optional(),
  date: z.string().or(z.date()), // ISO date string or Date
  description: z.string().optional(),
  categoryId: z.string().min(1),
});

export const listTxSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  categoryId: z.string().optional(),
  q: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
});