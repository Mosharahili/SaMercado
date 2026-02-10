import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Get all admins (owner only)
router.get('/', authenticate, authorize('OWNER'), async (req: any, res) => {
  try {
    const admins = await prisma.admin.findMany({
      include: {
        user: {
          select: { id: true, email: true, name: true, role: true },
          include: {
            permissions: true,
          },
        },
      },
    });

    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
});

// Create admin
router.post('/', authenticate, authorize('OWNER'), async (req: any, res) => {
  try {
    const { userId, permissions } = z.object({
      userId: z.string(),
      permissions: z.array(z.string()).optional(),
    }).parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'ADMIN') {
      await prisma.user.update({
        where: { id: userId },
        data: { role: 'ADMIN' },
      });
    }

    const admin = await prisma.admin.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    if (permissions) {
      // Clear existing permissions
      await prisma.permission.deleteMany({ where: { userId } });

      // Add new permissions
      await Promise.all(
        permissions.map(permission =>
          prisma.permission.create({
            data: {
              userId,
              key: permission as any,
            },
          })
        )
      );
    }

    res.status(201).json(admin);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create admin' });
  }
});

// Update admin permissions
router.put('/:id/permissions', authenticate, authorize('OWNER'), async (req: any, res) => {
  try {
    const { permissions } = z.object({
      permissions: z.array(z.string()),
    }).parse(req.body);

    const admin = await prisma.admin.findUnique({ where: { id: req.params.id } });
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Clear existing permissions
    await prisma.permission.deleteMany({ where: { userId: admin.userId } });

    // Add new permissions
    await Promise.all(
      permissions.map(permission =>
        prisma.permission.create({
          data: {
            userId: admin.userId,
            key: permission as any,
          },
        })
      )
    );

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: 'Failed to update permissions' });
  }
});

// Remove admin
router.delete('/:id', authenticate, authorize('OWNER'), async (req: any, res) => {
  try {
    const admin = await prisma.admin.findUnique({ where: { id: req.params.id } });
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    await prisma.admin.delete({ where: { id: req.params.id } });

    // Remove permissions
    await prisma.permission.deleteMany({ where: { userId: admin.userId } });

    // Change role back to customer
    await prisma.user.update({
      where: { id: admin.userId },
      data: { role: 'CUSTOMER' },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove admin' });
  }
});

export default router;