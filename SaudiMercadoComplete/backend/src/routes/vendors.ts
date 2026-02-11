import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, requirePermission, requireRole } from '../middleware/auth';
import { PERMISSIONS } from '../constants/permissions';

const router = Router();

router.get('/', authenticate, requirePermission(PERMISSIONS.MANAGE_VENDORS), async (_req, res) => {
  const vendors = await prisma.vendor.findMany({
    include: {
      user: true,
      marketLinks: { include: { market: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return res.json({ vendors });
});

router.patch('/:id/approve', authenticate, requirePermission(PERMISSIONS.MANAGE_VENDORS), async (req, res) => {
  const body = z.object({ isApproved: z.boolean() }).parse(req.body);
  const vendor = await prisma.vendor.update({ where: { id: req.params.id }, data: { isApproved: body.isApproved } });
  return res.json({ vendor });
});

router.post('/:id/assign-market', authenticate, requirePermission(PERMISSIONS.MANAGE_VENDORS), async (req, res) => {
  const body = z.object({ marketId: z.string().min(1) }).parse(req.body);

  const assigned = await prisma.vendorMarket.upsert({
    where: { vendorId_marketId: { vendorId: req.params.id, marketId: body.marketId } },
    update: {},
    create: { vendorId: req.params.id, marketId: body.marketId },
  });

  return res.json({ assigned });
});

router.get('/me/dashboard', authenticate, requireRole('VENDOR'), async (req, res) => {
  const vendor = await prisma.vendor.findFirst({ where: { userId: req.user!.id } });
  if (!vendor) return res.status(404).json({ error: 'Vendor profile not found' });

  const [productsCount, ordersCount, totalSalesAgg, recentOrders] = await Promise.all([
    prisma.product.count({ where: { vendorId: vendor.id } }),
    prisma.orderItem.count({ where: { vendorId: vendor.id } }),
    prisma.orderItem.aggregate({ _sum: { totalPrice: true }, where: { vendorId: vendor.id } }),
    prisma.orderItem.findMany({
      where: { vendorId: vendor.id },
      include: { order: true, product: true },
      orderBy: { order: { createdAt: 'desc' } },
      take: 20,
    }),
  ]);

  return res.json({
    vendor,
    stats: {
      productsCount,
      ordersCount,
      totalSales: Number(totalSalesAgg._sum.totalPrice || 0),
    },
    recentOrders,
  });
});

export default router;
