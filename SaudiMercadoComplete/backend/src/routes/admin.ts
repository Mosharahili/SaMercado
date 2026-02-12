import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth';
import { ALL_PERMISSION_CODES } from '../constants/permissions';

const router = Router();

const createAdminSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  permissions: z.array(z.string()).default([]),
});

const createVendorSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  businessName: z.string().min(2),
  businessPhone: z.string().optional(),
  isApproved: z.boolean().optional().default(true),
});

router.use(authenticate, requireRole('OWNER'));

router.get('/permissions', async (_req, res) => {
  const permissions = await prisma.permission.findMany({ orderBy: { code: 'asc' } });
  return res.json({ permissions });
});

router.get('/users', async (_req, res) => {
  const users = await prisma.user.findMany({
    include: {
      permissions: { include: { permission: true } },
      vendorProfile: true,
      adminProfile: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  return res.json({ users });
});

router.post('/admins', async (req, res) => {
  const body = createAdminSchema.parse(req.body);

  const invalid = body.permissions.filter((perm) => !ALL_PERMISSION_CODES.includes(perm as any));
  if (invalid.length) {
    return res.status(400).json({ error: `Invalid permissions: ${invalid.join(', ')}` });
  }

  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const passwordHash = await bcrypt.hash(body.password, 10);

  const admin = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: body.name,
        email: body.email,
        passwordHash,
        role: 'ADMIN',
      },
    });

    await tx.admin.create({
      data: {
        userId: user.id,
        createdById: req.user!.id,
      },
    });

    if (body.permissions.length) {
      const permissionRows = await tx.permission.findMany({ where: { code: { in: body.permissions } } });

      await tx.userPermission.createMany({
        data: permissionRows.map((permission) => ({
          userId: user.id,
          permissionId: permission.id,
        })),
      });
    }

    return tx.user.findUnique({
      where: { id: user.id },
      include: { permissions: { include: { permission: true } }, adminProfile: true },
    });
  });

  return res.status(201).json({ admin });
});

router.post('/vendors', async (req, res) => {
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

router.patch('/users/:id/permissions', async (req, res) => {
  const schema = z.object({ permissions: z.array(z.string()) });
  const body = schema.parse(req.body);

  const invalid = body.permissions.filter((perm) => !ALL_PERMISSION_CODES.includes(perm as any));
  if (invalid.length) {
    return res.status(400).json({ error: `Invalid permissions: ${invalid.join(', ')}` });
  }

  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  await prisma.$transaction(async (tx) => {
    await tx.userPermission.deleteMany({ where: { userId: user.id } });

    const permissionRows = await tx.permission.findMany({ where: { code: { in: body.permissions } } });

    if (permissionRows.length) {
      await tx.userPermission.createMany({
        data: permissionRows.map((permission) => ({ userId: user.id, permissionId: permission.id })),
      });
    }
  });

  const updated = await prisma.user.findUnique({
    where: { id: user.id },
    include: { permissions: { include: { permission: true } } },
  });

  return res.json({ user: updated });
});

router.patch('/users/:id/status', async (req, res) => {
  const schema = z.object({ isActive: z.boolean() });
  const body = schema.parse(req.body);

  const updated = await prisma.user.update({ where: { id: req.params.id }, data: { isActive: body.isActive } });
  return res.json({ user: updated });
});

export default router;
