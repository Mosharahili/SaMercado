import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, requirePermission } from '../middleware/auth';
import { PERMISSIONS } from '../constants/permissions';

const router = Router();

const marketSchema = z.object({
  name: z.string().min(2),
  region: z.string().min(2),
  location: z.string().optional(),
  description: z.string().optional(),
  operatingHours: z.string().optional(),
  priceRange: z.string().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().optional(),
});

router.get('/', async (_req, res) => {
  const markets = await prisma.market.findMany({
    include: {
      _count: {
        select: {
          vendorLinks: true,
          products: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return res.json({ markets });
});

router.get('/:id', async (req, res) => {
  const market = await prisma.market.findUnique({
    where: { id: req.params.id },
    include: {
      vendorLinks: {
        include: {
          vendor: {
            include: { user: true },
          },
        },
      },
      products: {
        where: { isAvailable: true },
        include: { category: true, vendor: { include: { user: true } }, images: true },
      },
    },
  });

  if (!market) {
    return res.status(404).json({ error: 'Market not found' });
  }

  return res.json({ market });
});

router.post('/', authenticate, requirePermission(PERMISSIONS.MANAGE_MARKETS), async (req, res) => {
  const data = marketSchema.parse(req.body);
  const market = await prisma.market.create({ data });
  return res.status(201).json({ market });
});

router.put('/:id', authenticate, requirePermission(PERMISSIONS.MANAGE_MARKETS), async (req, res) => {
  const data = marketSchema.partial().parse(req.body);
  const market = await prisma.market.update({ where: { id: req.params.id }, data });
  return res.json({ market });
});

router.delete('/:id', authenticate, requirePermission(PERMISSIONS.MANAGE_MARKETS), async (req, res) => {
  await prisma.market.delete({ where: { id: req.params.id } });
  return res.json({ message: 'Market deleted' });
});

export default router;
