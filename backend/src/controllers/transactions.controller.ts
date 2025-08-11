import { prisma } from '../utils/prisma';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { createTxSchema, listTxSchema } from '../validators/transactions.schema';
import { Decimal } from '@prisma/client/runtime/library';

export const createTransaction = async (req: AuthRequest, res: Response) => {
  const parsed = createTxSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });

  const { amount, currency = 'USD', date, description, categoryId } = parsed.data;

  const tx = await prisma.transaction.create({
    data: {
      amount: new Decimal(amount),
      currency,
      date: new Date(date),
      description,
      categoryId,
      userId: req.user!.id,
    },
  });
  res.status(201).json({ transaction: tx });
};

export const listTransactions = async (req: AuthRequest, res: Response) => {
  const parsed = listTxSchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid query', details: parsed.error.flatten() });
  const { from, to, categoryId, q, page, pageSize } = parsed.data;

  const where: any = { userId: req.user!.id };
  if (from || to) where.date = { gte: from ? new Date(from) : undefined, lte: to ? new Date(to) : undefined };
  if (categoryId) where.categoryId = categoryId;
  if (q) where.description = { contains: q, mode: 'insensitive' };

  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { category: true },
    }),
    prisma.transaction.count({ where }),
  ]);

  res.json({ items, total, page, pageSize });
};

export const updateTransaction = async (req: AuthRequest, res: Response) => {
  const id = req.params.id;
  const data = req.body;
  if (data.amount) data.amount = new Decimal(data.amount);
  if (data.date) data.date = new Date(data.date);
  const tx = await prisma.transaction.update({
    where: { id },
    data,
  });
  res.json({ transaction: tx });
};

export const deleteTransaction = async (req: AuthRequest, res: Response) => {
  const id = req.params.id;
  await prisma.transaction.delete({ where: { id } });
  res.status(204).send();
};