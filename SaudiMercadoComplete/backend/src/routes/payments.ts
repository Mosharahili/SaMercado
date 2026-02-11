import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, requirePermission } from '../middleware/auth';
import { PERMISSIONS } from '../constants/permissions';
import { emitOrderUpdate } from '../realtime/socket';

const router = Router();

const processSchema = z.object({
  orderId: z.string(),
  method: z.enum(['STC_PAY', 'MADA', 'APPLE_PAY', 'CASH_ON_DELIVERY']),
  success: z.boolean(),
  transactionId: z.string().optional(),
  failureReason: z.string().optional(),
  providerPayload: z.any().optional(),
});

router.post('/process', authenticate, async (req, res) => {
  const body = processSchema.parse(req.body);

  const order = await prisma.order.findUnique({ where: { id: body.orderId } });
  if (!order) return res.status(404).json({ error: 'Order not found' });

  if (req.user!.role === 'CUSTOMER' && order.customerId !== req.user!.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const payment = await prisma.payment.update({
    where: { orderId: order.id },
    data: {
      method: body.method,
      status: body.success ? 'SUCCEEDED' : 'FAILED',
      transactionId: body.transactionId,
      failureReason: body.failureReason,
      providerPayload: body.providerPayload,
    },
  });

  if (body.success) {
    await prisma.order.update({ where: { id: order.id }, data: { status: 'PROCESSING' } });
  }

  emitOrderUpdate(order.id, {
    type: 'payment_updated',
    orderId: order.id,
    paymentStatus: payment.status,
  });

  return res.json({ payment });
});

router.get('/', authenticate, requirePermission(PERMISSIONS.MANAGE_PAYMENTS), async (req, res) => {
  const payments = await prisma.payment.findMany({
    include: {
      order: {
        include: {
          customer: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return res.json({ payments });
});

export default router;
