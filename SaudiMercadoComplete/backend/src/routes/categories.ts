import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, requirePermission } from '../middleware/auth';
import { PERMISSIONS } from '../constants/permissions';

const router = Router();

const categorySchema = z.object({
  nameAr: z.string().min(2),
  slug: z.string().min(2),
  isActive: z.boolean().optional(),
});

router.get('/', async (_req, res) => {
  let categories = await prisma.category.findMany({ orderBy: { nameAr: 'asc' } });
  if (!categories.length) {
    await prisma.category.createMany({
      data: [
        { nameAr: 'خضار', slug: 'vegetables', isActive: true },
        { nameAr: 'فواكه', slug: 'fruits', isActive: true },
        { nameAr: 'تمور', slug: 'dates', isActive: true },
      ],
      skipDuplicates: true,
    });
    categories = await prisma.category.findMany({ orderBy: { nameAr: 'asc' } });
  }

  return res.json({ categories });
});

router.post('/', authenticate, requirePermission(PERMISSIONS.MANAGE_PRODUCTS), async (req, res) => {
  const data = categorySchema.parse(req.body);
  const category = await prisma.category.create({ data });
  return res.status(201).json({ category });
});

router.put('/:id', authenticate, requirePermission(PERMISSIONS.MANAGE_PRODUCTS), async (req, res) => {
  const data = categorySchema.partial().parse(req.body);
  const category = await prisma.category.update({ where: { id: req.params.id }, data });
  return res.json({ category });
});

router.delete('/:id', authenticate, requirePermission(PERMISSIONS.MANAGE_PRODUCTS), async (req, res) => {
  await prisma.category.delete({ where: { id: req.params.id } });
  return res.json({ message: 'Category deleted' });
});

export default router;
