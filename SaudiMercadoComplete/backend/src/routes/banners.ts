import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, requirePermission } from '../middleware/auth';
import { PERMISSIONS } from '../constants/permissions';
import { upload } from '../middleware/upload';

const router = Router();

const bannerSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  placement: z.enum(['HOME_HERO', 'HOME_MID', 'HOME_BOTTOM', 'PRODUCT_TOP', 'PRODUCT_INLINE']),
  ctaText: z.string().optional(),
  actionType: z.enum(['PRODUCT', 'MARKET', 'CATEGORY', 'EXTERNAL_LINK', 'NONE']).default('NONE'),
  actionValue: z.string().optional(),
  isEnabled: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  imageUrl: z.string().optional(),
});

router.get('/active', async (req, res) => {
  const placement = req.query.placement ? String(req.query.placement) : undefined;

  const banners = await prisma.banner.findMany({
    where: {
      isEnabled: true,
      ...(placement ? { placement: placement as any } : {}),
    },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return res.json({ banners });
});

router.get('/', authenticate, requirePermission(PERMISSIONS.MANAGE_BANNERS), async (_req, res) => {
  const banners = await prisma.banner.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] });
  return res.json({ banners });
});

router.post('/', authenticate, requirePermission(PERMISSIONS.MANAGE_BANNERS), async (req, res) => {
  const data = bannerSchema.parse(req.body);
  const banner = await prisma.banner.create({
    data: {
      ...data,
      createdById: req.user!.id,
      imageUrl: data.imageUrl || '',
    },
  });

  return res.status(201).json({ banner });
});

router.post(
  '/:id/image',
  authenticate,
  requirePermission(PERMISSIONS.MANAGE_BANNERS),
  upload.single('image'),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Image required' });

    const banner = await prisma.banner.update({
      where: { id: req.params.id },
      data: { imageUrl: `/uploads/${req.file.filename}` },
    });

    return res.json({ banner });
  }
);

router.put('/:id', authenticate, requirePermission(PERMISSIONS.MANAGE_BANNERS), async (req, res) => {
  const data = bannerSchema.partial().parse(req.body);
  const banner = await prisma.banner.update({
    where: { id: req.params.id },
    data,
  });

  return res.json({ banner });
});

router.delete('/:id', authenticate, requirePermission(PERMISSIONS.MANAGE_BANNERS), async (req, res) => {
  await prisma.banner.delete({ where: { id: req.params.id } });
  return res.json({ message: 'Banner deleted' });
});

export default router;
