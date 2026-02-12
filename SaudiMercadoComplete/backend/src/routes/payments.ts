import { PaymentStatus, Prisma } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, requirePermission } from '../middleware/auth';
import { PERMISSIONS } from '../constants/permissions';
import { emitOrderUpdate } from '../realtime/socket';
import { initiatePayment } from '../services/paymentProviders';

const router = Router();

const processSchema = z.object({
  orderId: z.string(),
  method: z.enum(['MADA', 'APPLE_PAY']),
});

router.post('/process', authenticate, async (req, res) => {
  const body = processSchema.parse(req.body);

  const order = await prisma.order.findUnique({
    where: { id: body.orderId },
    include: {
      customer: {
        select: { id: true, email: true, phone: true },
      },
      payment: true,
    },
  });

  if (!order) return res.status(404).json({ error: 'Order not found' });

  if (req.user!.role === 'CUSTOMER' && order.customerId !== req.user!.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const result = await initiatePayment({
    method: body.method,
    orderId: order.id,
    orderNumber: order.orderNumber,
    amount: Number(order.totalAmount),
    customer: {
      id: order.customer.id,
      email: order.customer.email,
      phone: order.customer.phone,
    },
  });

  const payment = await prisma.payment.update({
    where: { orderId: order.id },
    data: {
      method: body.method,
      status: result.status === 'SUCCEEDED' ? PaymentStatus.SUCCEEDED : result.status === 'FAILED' ? PaymentStatus.FAILED : PaymentStatus.PENDING,
      transactionId: result.transactionId,
      failureReason: result.failureReason,
      providerPayload:
        result.providerPayload === undefined
          ? undefined
          : result.providerPayload === null
            ? Prisma.JsonNull
            : (result.providerPayload as Prisma.InputJsonValue),
    },
  });

  if (result.status === 'SUCCEEDED') {
    await prisma.order.update({ where: { id: order.id }, data: { status: 'PROCESSING' } });
  }

  emitOrderUpdate(order.id, {
    type: 'payment_updated',
    orderId: order.id,
    paymentStatus: payment.status,
  });

  return res.json({
    payment,
    redirectUrl: result.redirectUrl,
    message: result.message,
  });
});

router.get('/', authenticate, requirePermission(PERMISSIONS.MANAGE_PAYMENTS), async (_req, res) => {
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
