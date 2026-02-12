import { PaymentMethod, PaymentStatus, Prisma } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, requirePermission } from '../middleware/auth';
import { PERMISSIONS } from '../constants/permissions';
import { generateOrderNumber } from '../utils/order';
import { emitOrderUpdate } from '../realtime/socket';
import { initiatePayment } from '../services/paymentProviders';

const router = Router();

const checkoutSchema = z.object({
  paymentMethod: z.enum(['MADA', 'APPLE_PAY', 'CASH_ON_DELIVERY']),
  contactPhone: z.string().regex(/^05\d{8}$/),
  deliveryFee: z.number().nonnegative().default(0),
  taxRate: z.number().nonnegative().default(0),
  notes: z.string().optional(),
});

const statusSchema = z.object({
  status: z.enum(['NEW', 'PROCESSING', 'PREPARING', 'READY_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED']),
});

router.post('/checkout', authenticate, async (req, res) => {
  const body = checkoutSchema.parse(req.body);
  const customer = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, email: true, phone: true },
  });

  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: req.user!.id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  const unavailable = cart.items.find((item) => !item.product.isAvailable);
  if (unavailable) {
    return res.status(400).json({ error: `Product unavailable: ${unavailable.product.name}` });
  }

  const groupedByMarket = new Map<string, typeof cart.items>();
  for (const item of cart.items) {
    const bucket = groupedByMarket.get(item.product.marketId) || [];
    bucket.push(item);
    groupedByMarket.set(item.product.marketId, bucket);
  }

  const orders = await prisma.$transaction(async (tx) => {
    const createdOrders: Array<{
      id: string;
      orderNumber: string;
      status: string;
      marketId: string;
      subtotal: Prisma.Decimal;
      deliveryFee: Prisma.Decimal;
      taxAmount: Prisma.Decimal;
      totalAmount: Prisma.Decimal;
    }> = [];

    await tx.user.update({
      where: { id: req.user!.id },
      data: { phone: body.contactPhone },
    });

    for (const [marketId, marketItems] of groupedByMarket.entries()) {
      const subtotal = marketItems.reduce((acc, item) => acc + Number(item.product.price) * item.quantity, 0);
      const deliveryFee = Number(body.deliveryFee || 0);
      const taxRate = Number(body.taxRate || 0);
      const taxAmount = subtotal * taxRate;
      const totalAmount = subtotal + deliveryFee + taxAmount;
      const orderNotes = body.notes?.trim()
        ? `${body.notes.trim()} | هاتف التواصل: ${body.contactPhone}`
        : `هاتف التواصل: ${body.contactPhone}`;

      const created = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          customerId: req.user!.id,
          marketId,
          subtotal,
          deliveryFee,
          taxAmount,
          totalAmount,
          notes: orderNotes,
          items: {
            create: marketItems.map((item) => ({
              productId: item.productId,
              vendorId: item.product.vendorId,
              quantity: item.quantity,
              unitPrice: item.product.price,
              totalPrice: new Prisma.Decimal(Number(item.product.price) * item.quantity),
            })),
          },
        },
      });

      await tx.payment.create({
        data: {
          orderId: created.id,
          method: body.paymentMethod as PaymentMethod,
          status: PaymentStatus.PENDING,
          amount: created.totalAmount,
        },
      });

      createdOrders.push(created);
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    return createdOrders;
  });

  const paymentResults: Array<{
    orderId: string;
    orderNumber: string;
    status: 'PENDING' | 'SUCCEEDED' | 'FAILED';
    redirectUrl?: string;
    transactionId?: string;
    failureReason?: string;
    message?: string;
  }> = [];

  if (body.paymentMethod !== 'CASH_ON_DELIVERY') {
    for (const order of orders) {
      const payment = await initiatePayment({
        method: body.paymentMethod,
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: Number(order.totalAmount),
        customer: {
          id: customer.id,
          email: customer.email,
          phone: body.contactPhone || customer.phone,
        },
      });

      await prisma.payment.update({
        where: { orderId: order.id },
        data: {
          status: payment.status === 'SUCCEEDED' ? PaymentStatus.SUCCEEDED : payment.status === 'FAILED' ? PaymentStatus.FAILED : PaymentStatus.PENDING,
          transactionId: payment.transactionId,
          failureReason: payment.failureReason,
          providerPayload:
            payment.providerPayload === undefined
              ? undefined
              : payment.providerPayload === null
                ? Prisma.JsonNull
                : (payment.providerPayload as Prisma.InputJsonValue),
        },
      });

      if (payment.status === 'SUCCEEDED') {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'PROCESSING' },
        });
      }

      paymentResults.push({
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: payment.status,
        redirectUrl: payment.redirectUrl,
        transactionId: payment.transactionId,
        failureReason: payment.failureReason,
        message: payment.message,
      });
    }
  }

  for (const order of orders) {
    emitOrderUpdate(order.id, {
      type: 'order_created',
      orderId: order.id,
      status: order.status,
    });
  }

  return res.status(201).json({
    order: orders[0],
    orders,
    paymentResults,
  });
});

router.get('/', authenticate, async (req, res) => {
  const { status, vendorId, marketId, dateFrom, dateTo, orderNumber } = req.query;

  let where: any = {};

  if (req.user!.role === 'CUSTOMER') {
    where.customerId = req.user!.id;
  }

  if (req.user!.role === 'VENDOR') {
    const vendor = await prisma.vendor.findFirst({ where: { userId: req.user!.id } });
    if (!vendor) return res.json({ orders: [] });
    where.items = {
      some: {
        vendorId: vendor.id,
      },
    };
  }

  if (status) where.status = String(status);
  if (marketId) where.marketId = String(marketId);
  if (orderNumber) {
    where.orderNumber = { contains: String(orderNumber), mode: 'insensitive' };
  }
  if (vendorId) {
    where.items = {
      some: {
        ...(where.items?.some || {}),
        vendorId: String(vendorId),
      },
    };
  }

  if (dateFrom || dateTo) {
    where.createdAt = {
      ...(dateFrom ? { gte: new Date(String(dateFrom)) } : {}),
      ...(dateTo ? { lte: new Date(String(dateTo)) } : {}),
    };
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      customer: true,
      market: true,
      payment: true,
      items: {
        include: {
          product: true,
          vendor: { include: { user: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return res.json({ orders });
});

router.patch('/:id/status', authenticate, requirePermission(PERMISSIONS.MANAGE_ORDERS), async (req, res) => {
  const body = statusSchema.parse(req.body);

  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status: body.status },
    include: { payment: true },
  });

  emitOrderUpdate(order.id, {
    type: 'status_changed',
    orderId: order.id,
    status: order.status,
  });

  return res.json({ order });
});

router.get('/:id', authenticate, async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      customer: true,
      payment: true,
      market: true,
      items: {
        include: {
          product: { include: { images: true } },
          vendor: { include: { user: true } },
        },
      },
    },
  });

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (req.user!.role === 'CUSTOMER' && order.customerId !== req.user!.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (req.user!.role === 'VENDOR') {
    const vendor = await prisma.vendor.findFirst({ where: { userId: req.user!.id } });
    const hasVendorItem = order.items.some((item) => item.vendorId === vendor?.id);
    if (!hasVendorItem) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

  return res.json({ order });
});

export default router;
