import { prisma } from '../utils/prisma';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { categorySchema } from '../validators/categories.schema';

export const listCategories = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const categories = await prisma.category.findMany({
    where: { OR: [{ userId }, { userId: null }] },
    orderBy: { name: 'asc' },
  });
  res.json({ categories });
};

export const createCategory = async (req: AuthRequest, res: Response) => {
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });

  const category = await prisma.category.create({
    data: { ...parsed.data, userId: req.user!.id },
  });
  res.status(201).json({ category });
};

export const updateCategory = async (req: AuthRequest, res: Response) => {
  const parsed = categorySchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });

  const id = req.params.id;
  const updated = await prisma.category.update({
    where: { id },
    data: parsed.data,
  });
  res.json({ category: updated });
};

export const deleteCategory = async (req: AuthRequest, res: Response) => {
  const id = req.params.id;
  await prisma.category.delete({ where: { id } });
  res.status(204).send();
};