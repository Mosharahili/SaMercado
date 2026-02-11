import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, requirePermission } from '../middleware/auth';
import { PERMISSIONS } from '../constants/permissions';
import { upload } from '../middleware/upload';
import { isInSchedule } from '../utils/popup';

const router = Router();

const popupSchema = z.object({
  title: z.string().min(2),
  message: z.string().optional(),
  trigger: z.enum(['APP_OPEN', 'PAGE_OPEN']).default('APP_OPEN'),
  targetType: z.enum(['ALL_USERS', 'LOGGED_IN', 'NEW_USERS', 'SPECIFIC_MARKETS', 'SPECIFIC_CATEGORIES']).default('ALL_USERS'),
  pageKey: z.string().optional(),
  primaryCtaText: z.string().optional(),
  primaryActionType: z.enum(['PRODUCT', 'MARKET', 'CATEGORY', 'EXTERNAL_LINK', 'NONE']).default('NONE'),
  primaryActionValue: z.string().optional(),
  secondaryCtaText: z.string().optional(),
  secondaryActionType: z.enum(['PRODUCT', 'MARKET', 'CATEGORY', 'EXTERNAL_LINK', 'NONE']).default('NONE'),
  secondaryActionValue: z.string().optional(),
  isDismissible: z.boolean().optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  isEnabled: z.boolean().optional(),
  imageUrl: z.string().optional(),
  marketIds: z.array(z.string()).optional(),
  categoryIds: z.array(z.string()).optional(),
});

const parseOptionalDate = (value?: string) => {
  if (!value?.trim()) return { ok: true as const, value: undefined };
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return { ok: false as const };
  }
  return { ok: true as const, value: parsed };
};

router.get('/active', async (req, res) => {
  const pageKey = req.query.pageKey ? String(req.query.pageKey) : undefined;
  const isLoggedIn = req.query.isLoggedIn === 'true';
  const isNewUser = req.query.isNewUser === 'true';
  const marketId = req.query.marketId ? String(req.query.marketId) : undefined;
  const categoryId = req.query.categoryId ? String(req.query.categoryId) : undefined;

  const popups = await prisma.popup.findMany({
    where: {
      isEnabled: true,
      ...(pageKey ? { OR: [{ pageKey }, { pageKey: null }] } : {}),
    },
    include: {
      marketTargets: true,
      categoryTargets: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const filtered = popups.filter((popup) => {
    if (!isInSchedule(popup.startsAt, popup.endsAt)) return false;

    switch (popup.targetType) {
      case 'ALL_USERS':
        return true;
      case 'LOGGED_IN':
        return isLoggedIn;
      case 'NEW_USERS':
        return isNewUser;
      case 'SPECIFIC_MARKETS':
        return Boolean(marketId && popup.marketTargets.some((m) => m.marketId === marketId));
      case 'SPECIFIC_CATEGORIES':
        return Boolean(categoryId && popup.categoryTargets.some((c) => c.categoryId === categoryId));
      default:
        return false;
    }
  });

  return res.json({ popups: filtered });
});

router.get('/', authenticate, requirePermission(PERMISSIONS.MANAGE_POPUPS), async (_req, res) => {
  const popups = await prisma.popup.findMany({
    include: {
      marketTargets: true,
      categoryTargets: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return res.json({ popups });
});

router.post('/', authenticate, requirePermission(PERMISSIONS.MANAGE_POPUPS), async (req, res) => {
  const data = popupSchema.parse(req.body);
  const startsAt = parseOptionalDate(data.startsAt);
  const endsAt = parseOptionalDate(data.endsAt);
  if (!startsAt.ok || !endsAt.ok) {
    return res.status(400).json({ error: 'Invalid date format. Use a valid date value.' });
  }

  const popup = await prisma.popup.create({
    data: {
      title: data.title,
      message: data.message,
      trigger: data.trigger,
      targetType: data.targetType,
      pageKey: data.pageKey,
      primaryCtaText: data.primaryCtaText,
      primaryActionType: data.primaryActionType,
      primaryActionValue: data.primaryActionValue,
      secondaryCtaText: data.secondaryCtaText,
      secondaryActionType: data.secondaryActionType,
      secondaryActionValue: data.secondaryActionValue,
      isDismissible: data.isDismissible,
      startsAt: startsAt.value,
      endsAt: endsAt.value,
      isEnabled: data.isEnabled,
      imageUrl: data.imageUrl,
      createdById: req.user!.id,
      marketTargets: data.marketIds?.length
        ? {
            createMany: {
              data: data.marketIds.map((marketId) => ({ marketId })),
            },
          }
        : undefined,
      categoryTargets: data.categoryIds?.length
        ? {
            createMany: {
              data: data.categoryIds.map((categoryId) => ({ categoryId })),
            },
          }
        : undefined,
    },
    include: {
      marketTargets: true,
      categoryTargets: true,
    },
  });

  return res.status(201).json({ popup });
});

router.post('/:id/image', authenticate, requirePermission(PERMISSIONS.MANAGE_POPUPS), upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Image required' });

  const popup = await prisma.popup.update({
    where: { id: req.params.id },
    data: { imageUrl: `/uploads/${req.file.filename}` },
  });

  return res.json({ popup });
});

router.put('/:id', authenticate, requirePermission(PERMISSIONS.MANAGE_POPUPS), async (req, res) => {
  const data = popupSchema.partial().parse(req.body);
  const startsAt = parseOptionalDate(data.startsAt);
  const endsAt = parseOptionalDate(data.endsAt);
  if (!startsAt.ok || !endsAt.ok) {
    return res.status(400).json({ error: 'Invalid date format. Use a valid date value.' });
  }

  const popup = await prisma.$transaction(async (tx) => {
    await tx.popupMarketTarget.deleteMany({ where: { popupId: req.params.id } });
    await tx.popupCategoryTarget.deleteMany({ where: { popupId: req.params.id } });

    return tx.popup.update({
      where: { id: req.params.id },
      data: {
        ...data,
        startsAt: startsAt.value,
        endsAt: endsAt.value,
        marketTargets: data.marketIds?.length
          ? {
              createMany: {
                data: data.marketIds.map((marketId) => ({ marketId })),
              },
            }
          : undefined,
        categoryTargets: data.categoryIds?.length
          ? {
              createMany: {
                data: data.categoryIds.map((categoryId) => ({ categoryId })),
              },
            }
          : undefined,
      },
      include: {
        marketTargets: true,
        categoryTargets: true,
      },
    });
  });

  return res.json({ popup });
});

router.delete('/:id', authenticate, requirePermission(PERMISSIONS.MANAGE_POPUPS), async (req, res) => {
  await prisma.popup.delete({ where: { id: req.params.id } });
  return res.json({ message: 'Popup deleted' });
});

export default router;
