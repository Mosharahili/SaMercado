import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, authorize, checkPermission } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

const createBannerSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  imageUrl: z.string(),
  ctaText: z.string().optional(),
  placement: z.enum(['HOME_HERO', 'HOME_MID', 'PRODUCT_TOP', 'PRODUCT_INLINE']),
  actionType: z.enum(['PRODUCT', 'MARKET', 'CATEGORY', 'EXTERNAL_LINK', 'NONE']),
  actionTargetId: z.string().optional(),
  externalUrl: z.string().optional(),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
});

const updateBannerSchema = createBannerSchema.partial();

// Get active banners for placement
router.get('/active/:placement', async (req, res) => {
  try {
    const { placement } = req.params;
    const now = new Date();

    const banners = await prisma.banner.findMany({
      where: {
        placement: placement as any,
        enabled: true,
        OR: [
          { startAt: null, endAt: null },
          { startAt: { lte: now }, endAt: null },
          { startAt: null, endAt: { gte: now } },
          { startAt: { lte: now }, endAt: { gte: now } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
});

// Get all banners (admin)
router.get('/', authenticate, authorize('ADMIN', 'OWNER'), checkPermission('MANAGE_BANNERS'), async (req: any, res) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
});

// Create banner
router.post('/', authenticate, authorize('ADMIN', 'OWNER'), checkPermission('MANAGE_BANNERS'), async (req: any, res) => {
  try {
    const data = createBannerSchema.parse(req.body);
    const banner = await prisma.banner.create({ data });
    res.status(201).json(banner);
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' });
  }
});

// Update banner
router.put('/:id', authenticate, authorize('ADMIN', 'OWNER'), checkPermission('MANAGE_BANNERS'), async (req: any, res) => {
  try {
    const data = updateBannerSchema.parse(req.body);
    const banner = await prisma.banner.update({
      where: { id: req.params.id },
      data,
    });
    res.json(banner);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update banner' });
  }
});

// Delete banner
router.delete('/:id', authenticate, authorize('ADMIN', 'OWNER'), checkPermission('MANAGE_BANNERS'), async (req: any, res) => {
  try {
    await prisma.banner.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete banner' });
  }
});

// Upload banner image
router.post('/upload', authenticate, authorize('ADMIN', 'OWNER'), checkPermission('MANAGE_BANNERS'), upload.single('image'), (req: any, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

export default router;