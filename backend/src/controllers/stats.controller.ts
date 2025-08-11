import { prisma } from '../utils/prisma';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';

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
    const m = new Date(t.date).getUTCMonth();
    const type = t.category.type;
    months[m][type.toLowerCase() as 'income' | 'expense' | 'savings'] += Number(t.amount);
  }
  res.json({ year, months });
};

export const incomeVsExpense = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const from = req.query.from ? new Date(String(req.query.from)) : new Date(new Date().getFullYear(), 0, 1);
  const to = req.query.to ? new Date(String(req.query.to)) : new Date();

  const data = await prisma.transaction.findMany({
    where: { userId, date: { gte: from, lte: to } },
    include: { category: true },
  });

  let income = 0, expense = 0;
  for (const t of data) {
    if (t.category.type === 'INCOME') income += Number(t.amount);
    if (t.category.type === 'EXPENSE') expense += Number(t.amount);
  }
  res.json({ from, to, income, expense });
};