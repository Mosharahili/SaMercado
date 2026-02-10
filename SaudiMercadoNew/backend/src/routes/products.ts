import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, authorize, checkPermission } from '../middleware/auth';

const router = Router();

const createProductSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  price: z.number().positive(),
  unit: z.enum(['KILO', 'BUNDLE', 'BOX']),
  marketId: z.string(),
  vendorId: z.string(),
  categoryId: z.string().optional(),
});

const updateProductSchema = createProductSchema.partial();

// Get all products with filters
router.get('/', async (req, res) => {
  try {
    const { marketId, vendorId, categoryId, search } = req.query;

    const where: any = {};
    if (marketId) where.marketId = marketId;
    if (vendorId) where.vendorId = vendorId;
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.name = { contains: search as string, mode: 'insensitive' };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        market: { select: { name: true } },
        vendor: { select: { displayName: true } },
        category: { select: { name: true } },
      },
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        market: true,
        vendor: true,
        category: true,
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create product (vendor or admin)
router.post('/', authenticate, async (req: any, res) => {
  try {
    const data = createProductSchema.parse(req.body);

    // Check permissions
    if (req.user.role === 'VENDOR' && req.user.id !== data.vendorId) {
      return res.status(403).json({ error: 'Can only create products for your own vendor account' });
    }

    if (req.user.role === 'ADMIN' || req.user.role === 'OWNER') {
      // Admins can create for any vendor
    } else if (req.user.role !== 'VENDOR') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const product = await prisma.product.create({ data });
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' });
  }
});

// Update product
router.put('/:id', authenticate, async (req: any, res) => {
  try {
    const data = updateProductSchema.parse(req.body);

    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check permissions
    if (req.user.role === 'VENDOR' && product.vendorId !== req.user.id) {
      return res.status(403).json({ error: 'Can only update your own products' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: req.params.id },
      data,
    });

    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update product' });
  }
});

// Delete product
router.delete('/:id', authenticate, async (req: any, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check permissions
    if (req.user.role === 'VENDOR' && product.vendorId !== req.user.id) {
      return res.status(403).json({ error: 'Can only delete your own products' });
    }

    await prisma.product.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;