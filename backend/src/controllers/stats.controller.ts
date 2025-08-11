import { prisma } from '../utils/prisma';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';

// Map DB category type to lowercase key names
const categoryMap: Record<'INCOME' | 'EXPENSE' | 'SAVINGS', 'income' | 'expense' | 'savings'> = {
  INCOME: 'income',
  EXPENSE: 'expense',
  SAVINGS: 'savings'
};

export const monthlyStats = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const year = Number(req.query.year) || new Date().getFullYear();

  const start = new Date(`${year}-01-01T00:00:00Z`);
  const end = new Date(`${year}-12-31T23:59:59Z`);

  const transactions = await prisma.transaction.findMany({
    where: { userId, date: { gte: start, lte: end } },
    include: { category: true },
  });

  const months = Array.from({ length: 12 }, () => ({ income: 0, expense: 0, savings: 0 }));

  for (const t of transactions) {
    // Skip if category is missing
    if (!t.category) continue;

    // Ensure month index is in range
    const m = new Date(t.date).getUTCMonth();
    const month = months[m];
    if (!month) continue;

    const key = categoryMap[t.category.type as keyof typeof categoryMap];
    month[key] += Number(t.amount ?? 0);
  }

  res.json({ year, months });
};

export const incomeVsExpense = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const from = req.query.from
    ? new Date(String(req.query.from))
    : new Date(new Date().getFullYear(), 0, 1);
  const to = req.query.to ? new Date(String(req.query.to)) : new Date();

  const data = await prisma.transaction.findMany({
    where: { userId, date: { gte: from, lte: to } },
    include: { category: true },
  });

  let income = 0, expense = 0;
  for (const t of data) {
    if (!t.category) continue;

    if (t.category.type === 'INCOME') income += Number(t.amount ?? 0);
    if (t.category.type === 'EXPENSE') expense += Number(t.amount ?? 0);
  }

  res.json({ from, to, income, expense });
};
