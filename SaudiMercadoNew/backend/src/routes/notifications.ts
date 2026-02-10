import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// Register push token
router.post('/token', authenticate, async (req: any, res) => {
  try {
    const { token } = z.object({ token: z.string() }).parse(req.body);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { pushToken: token },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: 'Failed to register token' });
  }
});

// Send notification (admin)
router.post('/', authenticate, async (req: any, res) => {
  try {
    const { title, body, userId, data } = z.object({
      title: z.string(),
      body: z.string(),
      userId: z.string().optional(),
      data: z.record(z.any()).optional(),
    }).parse(req.body);

    // Check permissions
    if (req.user.role !== 'OWNER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        body,
        data,
      },
    });

    // Here you would send push notification using Expo SDK
    // const pushToken = user?.pushToken;
    // if (pushToken) {
    //   await sendPushNotification(pushToken, title, body, data);
    // }

    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ error: 'Failed to send notification' });
  }
});

// Get user's notifications
router.get('/', authenticate, async (req: any, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

export default router;