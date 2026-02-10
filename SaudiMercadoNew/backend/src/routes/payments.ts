import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, authorize, checkPermission } from '../middleware/auth';

const router = Router();

// Update payment status
router.put('/:id/status', authenticate, authorize('ADMIN', 'OWNER'), checkPermission('MANAGE_PAYMENTS'), async (req: any, res) => {
  try {
    const { status } = z.object({
      status: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']),
    }).parse(req.body);

    const payment = await prisma.payment.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json(payment);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update payment' });
  }
});

// Get payments (admin)
router.get('/', authenticate, authorize('ADMIN', 'OWNER'), checkPermission('MANAGE_PAYMENTS'), async (req: any, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        order: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Webhook for payment providers (placeholder)
router.post('/webhook/:provider', (req, res) => {
  // Handle webhooks from STC Pay, Mada, etc.
  // For now, just acknowledge
  console.log(`Webhook received from ${req.params.provider}:`, req.body);
  res.json({ received: true });
});

export default router;