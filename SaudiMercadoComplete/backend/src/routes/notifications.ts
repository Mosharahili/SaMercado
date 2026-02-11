import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, requirePermission } from '../middleware/auth';
import { PERMISSIONS } from '../constants/permissions';

const router = Router();

router.get('/me', authenticate, async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
  });

  return res.json({ notifications });
});

router.patch('/:id/read', authenticate, async (req, res) => {
  const notification = await prisma.notification.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
  if (!notification) return res.status(404).json({ error: 'Notification not found' });

  const updated = await prisma.notification.update({ where: { id: notification.id }, data: { isRead: true } });
  return res.json({ notification: updated });
});

router.post('/', authenticate, requirePermission(PERMISSIONS.MANAGE_USERS), async (req, res) => {
  const body = z
    .object({
      userId: z.string().optional(),
      title: z.string().min(2),
      body: z.string().min(2),
      type: z.string().default('announcement'),
      metadata: z.any().optional(),
      allUsers: z.boolean().optional(),
    })
    .parse(req.body);

  if (body.allUsers) {
    const users = await prisma.user.findMany({ select: { id: true } });
    await prisma.notification.createMany({
      data: users.map((user) => ({
        userId: user.id,
        title: body.title,
        body: body.body,
        type: body.type,
        metadata: body.metadata as any,
      })),
    });

    return res.status(201).json({ message: 'Broadcast notification created' });
  }

  if (!body.userId) {
    return res.status(400).json({ error: 'userId is required unless allUsers=true' });
  }

  const notification = await prisma.notification.create({
    data: {
      userId: body.userId,
      title: body.title,
      body: body.body,
      type: body.type,
      metadata: body.metadata as any,
    },
  });

  return res.status(201).json({ notification });
});

export default router;
