import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, requirePermission, requireRole } from '../middleware/auth';
import { PERMISSIONS } from '../constants/permissions';

const router = Router();

const createVendorSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  businessName: z.string().min(2),
  businessPhone: z.string().optional(),
  isApproved: z.boolean().optional().default(true),
});

router.get('/', authenticate, async (req, res) => {
  const allowed =
    req.user?.role === 'OWNER' ||
    req.user?.permissions.includes(PERMISSIONS.MANAGE_VENDORS) ||
    req.user?.permissions.includes(PERMISSIONS.MANAGE_PRODUCTS);

  if (!allowed) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  const vendors = await prisma.vendor.findMany({
    include: {
      user: true,
      marketLinks: { include: { market: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return res.json({ vendors });
});

router.post('/', authenticate, requirePermission(PERMISSIONS.MANAGE_VENDORS), async (req, res) => {
  const body = createVendorSchema.parse(req.body);
  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const passwordHash = await bcrypt.hash(body.password, 10);
  const vendor = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: body.name,
        email: body.email,
        passwordHash,
        phone: body.phone,
        role: 'VENDOR',
      },
    });

    return tx.vendor.create({
      data: {
        userId: user.id,
        businessName: body.businessName,
        businessPhone: body.businessPhone || body.phone,
        isApproved: body.isApproved,
      },
      include: {
        user: true,
      },
    });
  });

  return res.status(201).json({ vendor });
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
