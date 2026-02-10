import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Get settings
router.get('/', async (req, res) => {
  try {
    let settings = await prisma.appSettings.findUnique({
      where: { id: 'app_settings_singleton' },
    });

    if (!settings) {
      settings = await prisma.appSettings.create({
        data: { id: 'app_settings_singleton' },
      });
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update settings (owner)
router.put('/', authenticate, authorize('OWNER'), async (req: any, res) => {
  try {
    const updateSchema = z.object({
      appName: z.string().optional(),
      primaryColor: z.string().optional(),
      secondaryColor: z.string().optional(),
      logoUrl: z.string().optional(),
      deliveryFee: z.number().optional(),
      taxRate: z.number().optional(),
      stcPayConfig: z.record(z.any()).optional(),
      madaConfig: z.record(z.any()).optional(),
      applePayConfig: z.record(z.any()).optional(),
      notificationConfig: z.record(z.any()).optional(),
    });

    const data = updateSchema.parse(req.body);

    const settings = await prisma.appSettings.upsert({
      where: { id: 'app_settings_singleton' },
      update: data,
      create: { id: 'app_settings_singleton', ...data },
    });

    res.json(settings);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update settings' });
  }
});

export default router;