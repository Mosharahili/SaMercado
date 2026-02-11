import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate, requirePermission } from '../middleware/auth';
import { PERMISSIONS } from '../constants/permissions';

const router = Router();

router.get('/overview', authenticate, requirePermission(PERMISSIONS.VIEW_ANALYTICS), async (_req, res) => {
  const [
    totalOrders,
    deliveredOrders,
    totalRevenueAgg,
    totalProducts,
    totalVendors,
    totalMarkets,
    cartItemsCount,
    topProducts,
    topVendors,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'DELIVERED' } }),
    prisma.order.aggregate({ _sum: { totalAmount: true } }),
    prisma.product.count(),
    prisma.vendor.count(),
    prisma.market.count(),
    prisma.cartItem.count(),
    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10,
    }),
    prisma.orderItem.groupBy({
      by: ['vendorId'],
      _sum: { totalPrice: true, quantity: true },
      orderBy: { _sum: { totalPrice: 'desc' } },
      take: 10,
    }),
  ]);

  const conversionRate = totalOrders > 0 ? Number(((deliveredOrders / totalOrders) * 100).toFixed(2)) : 0;
  const cartAbandonmentRate = cartItemsCount > 0 ? Number((((cartItemsCount - totalOrders) / cartItemsCount) * 100).toFixed(2)) : 0;

  const productMap = await prisma.product.findMany({
    where: { id: { in: topProducts.map((row) => row.productId) } },
    select: { id: true, name: true },
  });

  const vendorMap = await prisma.vendor.findMany({
    where: { id: { in: topVendors.map((row) => row.vendorId) } },
    include: { user: true },
  });

  return res.json({
    metrics: {
      totalOrders,
      totalRevenue: Number(totalRevenueAgg._sum.totalAmount || 0),
      totalProducts,
      totalVendors,
      totalMarkets,
      conversionRate,
      cartAbandonmentRate,
    },
    topProducts: topProducts.map((row) => ({
      ...row,
      name: productMap.find((p) => p.id === row.productId)?.name || 'Unknown',
    })),
    topVendors: topVendors.map((row) => ({
      ...row,
      name: vendorMap.find((v) => v.id === row.vendorId)?.businessName || 'Unknown',
    })),
  });
});

router.post('/events', authenticate, async (req, res) => {
  const { eventType, eventName, payload } = req.body as {
    eventType: any;
    eventName: string;
    payload?: unknown;
  };

  const event = await prisma.analyticsEvent.create({
    data: {
      userId: req.user?.id,
      eventType,
      eventName,
      payload: payload as any,
    },
  });

  return res.status(201).json({ event });
});

export default router;
