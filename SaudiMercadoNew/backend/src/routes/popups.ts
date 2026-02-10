import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, authorize, checkPermission } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

const createPopupSchema = z.object({
  title: z.string(),
  message: z.string().optional(),
  imageUrl: z.string().optional(),
  primaryCtaText: z.string().optional(),
  secondaryCtaText: z.string().optional(),
  targetType: z.enum(['ALL_USERS', 'LOGGED_IN', 'NEW_USERS', 'SPECIFIC_MARKETS', 'SPECIFIC_CATEGORIES']),
  marketIds: z.array(z.string()).optional(),
  categoryIds: z.array(z.string()).optional(),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
});

const updatePopupSchema = createPopupSchema.partial();

// Get active popups for user
router.get('/active', authenticate, async (req: any, res) => {
  try {
    const user = req.user;
    const now = new Date();

    let where: any = {
      enabled: true,
      OR: [
        { startAt: null, endAt: null },
        { startAt: { lte: now }, endAt: null },
        { startAt: null, endAt: { gte: now } },
        { startAt: { lte: now }, endAt: { gte: now } },
      ],
    };

    // Filter by target
    const targetConditions = [];

    // All users
    targetConditions.push({ targetType: 'ALL_USERS' });

    // Logged in users
    targetConditions.push({ targetType: 'LOGGED_IN' });

    // New users (created in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    if (user.createdAt > sevenDaysAgo) {
      targetConditions.push({ targetType: 'NEW_USERS' });
    }

    // Specific markets/categories - would need to check user's cart/orders, but for simplicity, skip for now

    where.OR = where.OR.map((timeCondition: any) => ({
      ...timeCondition,
      targetType: { in: targetConditions.map((c: any) => c.targetType) },
    }));

    const popups = await prisma.popup.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 1, // Return one popup
    });

    res.json(popups[0] || null);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch popups' });
  }
});

// Get all popups (admin)
router.get('/', authenticate, authorize('ADMIN', 'OWNER'), checkPermission('MANAGE_POPUPS'), async (req: any, res) => {
  try {
    const popups = await prisma.popup.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json(popups);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch popups' });
  }
});

// Create popup
router.post('/', authenticate, authorize('ADMIN', 'OWNER'), checkPermission('MANAGE_POPUPS'), async (req: any, res) => {
  try {
    const data = createPopupSchema.parse(req.body);
    const popup = await prisma.popup.create({ data });
    res.status(201).json(popup);
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' });
  }
});

// Update popup
router.put('/:id', authenticate, authorize('ADMIN', 'OWNER'), checkPermission('MANAGE_POPUPS'), async (req: any, res) => {
  try {
    const data = updatePopupSchema.parse(req.body);
    const popup = await prisma.popup.update({
      where: { id: req.params.id },
      data,
    });
    res.json(popup);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update popup' });
  }
});

// Delete popup
router.delete('/:id', authenticate, authorize('ADMIN', 'OWNER'), checkPermission('MANAGE_POPUPS'), async (req: any, res) => {
  try {
    await prisma.popup.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete popup' });
  }
});

// Upload popup image
router.post('/upload', authenticate, authorize('ADMIN', 'OWNER'), checkPermission('MANAGE_POPUPS'), upload.single('image'), (req: any, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

export default router;