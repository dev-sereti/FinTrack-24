import { Prisma } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { categorySchema } from '../validators/categories.schema';

export const listCategories = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const categories = await prisma.category.findMany({
      where: { OR: [{ userId }, { userId: null }] },
      orderBy: { name: 'asc' },
    });
    return res.json({ categories });
  } catch (error) {
    console.error('Error listing categories:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCategory = async (req: AuthRequest, res: Response) => {
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ 
      error: 'Invalid input', 
      details: parsed.error.flatten() 
    });
  }

  try {
    const category = await prisma.category.create({
      data: { 
        ...parsed.data, 
        userId: req.user!.id,
        color: parsed.data.color ?? null,
      },
    });
    return res.status(201).json({ category });
  } catch (error) {
    console.error('Error creating category:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCategory = async (req: AuthRequest, res: Response) => {
  const parsed = categorySchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ 
      error: 'Invalid input', 
      details: parsed.error.flatten() 
    });
  }

  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Category ID is required' });
    }

    // Create a properly typed update data object
    const updateData: Prisma.CategoryUpdateInput = {
      ...(parsed.data.name !== undefined && { name: parsed.data.name }),
      ...(parsed.data.type !== undefined && { type: parsed.data.type }),
      ...(parsed.data.color !== undefined && { color: parsed.data.color ?? null }),
    };

    const updated = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    return res.json({ category: updated });
  } catch (error) {
    console.error('Error updating category:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Category not found' });
      }
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Category ID is required' });
    }

    await prisma.category.delete({ 
      where: { id }
    });
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting category:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Category not found' });
      }
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};