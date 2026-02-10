import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, authorize, checkPermission } from '../middleware/auth';

const router = Router();

const createVendorSchema = z.object({
  displayName: z.string(),
  description: z.string().optional(),
});

const updateVendorSchema = createVendorSchema.partial();

// Get all vendors
router.get('/', authenticate, authorize('ADMIN', 'OWNER'), checkPermission('MANAGE_VENDORS'), async (req: any, res) => {
  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        user: { select: { email: true, name: true } },
        marketVendors: {
          include: {
            market: { select: { name: true } },
          },
        },
        products: { select: { id: true } },
      },
    });

    res.json(vendors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

// Get vendor profile
router.get('/profile', authenticate, authorize('VENDOR'), async (req: any, res) => {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id },
      include: {
        marketVendors: {
          include: {
            market: true,
          },
        },
        products: true,
      },
    });

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }

    res.json(vendor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vendor profile' });
  }
});

// Create vendor (admin creates for user)
router.post('/', authenticate, authorize('ADMIN', 'OWNER'), checkPermission('MANAGE_VENDORS'), async (req: any, res) => {
  try {
    const { userId, ...data } = z.object({
      userId: z.string(),
      ...createVendorSchema.shape,
    }).parse(req.body);

    const existingVendor = await prisma.vendor.findUnique({ where: { userId } });
    if (existingVendor) {
      return res.status(400).json({ error: 'User is already a vendor' });
    }

    const vendor = await prisma.vendor.create({
      data: { userId, ...data },
    });

    res.status(201).json(vendor);
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' });
  }
});

// Update vendor
router.put('/:id', authenticate, async (req: any, res) => {
  try {
    const data = updateVendorSchema.parse(req.body);

    const vendor = await prisma.vendor.findUnique({ where: { id: req.params.id } });
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Check permissions
    if (req.user.role === 'VENDOR' && vendor.userId !== req.user.id) {
      return res.status(403).json({ error: 'Can only update your own profile' });
    }

    const updatedVendor = await prisma.vendor.update({
      where: { id: req.params.id },
      data,
    });

    res.json(updatedVendor);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update vendor' });
  }
});

// Assign vendor to market
router.post('/:id/markets', authenticate, authorize('ADMIN', 'OWNER'), checkPermission('MANAGE_VENDORS'), async (req: any, res) => {
  try {
    const { marketId } = z.object({ marketId: z.string() }).parse(req.body);

    const existing = await prisma.marketVendor.findUnique({
      where: { marketId_vendorId: { marketId, vendorId: req.params.id } },
    });

    if (existing) {
      return res.status(400).json({ error: 'Vendor already assigned to this market' });
    }

    const marketVendor = await prisma.marketVendor.create({
      data: { marketId, vendorId: req.params.id },
    });

    res.status(201).json(marketVendor);
  } catch (error) {
    res.status(400).json({ error: 'Failed to assign vendor to market' });
  }
});

// Remove vendor from market
router.delete('/:id/markets/:marketId', authenticate, authorize('ADMIN', 'OWNER'), checkPermission('MANAGE_VENDORS'), async (req: any, res) => {
  try {
    await prisma.marketVendor.delete({
      where: {
        marketId_vendorId: {
          marketId: req.params.marketId,
          vendorId: req.params.id,
        },
      },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove vendor from market' });
  }
});

export default router;