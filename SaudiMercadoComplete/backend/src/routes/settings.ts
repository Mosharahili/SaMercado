import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, requirePermission } from '../middleware/auth';
import { PERMISSIONS } from '../constants/permissions';

const router = Router();

router.get('/', async (_req, res) => {
  const settings = await prisma.systemSetting.findMany({ orderBy: { key: 'asc' } });

  const byKey = settings.reduce<Record<string, unknown>>((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});

  return res.json({ settings: byKey });
});

router.put('/', authenticate, requirePermission(PERMISSIONS.MANAGE_SETTINGS), async (req, res) => {
  const schema = z.record(z.any());
  const values = schema.parse(req.body);

  await prisma.$transaction(
    Object.entries(values).map(([key, value]) =>
      prisma.systemSetting.upsert({
        where: { key },
        update: { value: value as any },
        create: { key, value: value as any },
      })
    )
  );

  const settings = await prisma.systemSetting.findMany({ orderBy: { key: 'asc' } });
  return res.json({ settings });
});

export default router;
