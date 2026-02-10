import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, authorize, checkPermission } from '../middleware/auth';

const router = Router();

const createCategorySchema = z.object({
  name: z.string(),
  type: z.enum(['VEGETABLE', 'FRUIT', 'DATES']),
});

const updateCategorySchema = createCategorySchema.partial();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        products: { select: { id: true } },
      },
    });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create category (admin)
router.post('/', authenticate, authorize('ADMIN', 'OWNER'), checkPermission('MANAGE_PRODUCTS'), async (req: any, res) => {
  try {
    const data = createCategorySchema.parse(req.body);
    const category = await prisma.category.create({ data });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' });
  }
});

// Update category
router.put('/:id', authenticate, authorize('ADMIN', 'OWNER'), checkPermission('MANAGE_PRODUCTS'), async (req: any, res) => {
  try {
    const data = updateCategorySchema.parse(req.body);
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data,
    });
    res.json(category);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update category' });
  }
});

// Delete category
router.delete('/:id', authenticate, authorize('ADMIN', 'OWNER'), checkPermission('MANAGE_PRODUCTS'), async (req: any, res) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;