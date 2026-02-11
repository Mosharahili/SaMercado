import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, requirePermission } from '../middleware/auth';
import { PERMISSIONS } from '../constants/permissions';
import { upload } from '../middleware/upload';

const router = Router();

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  unit: z.enum(['كيلو', 'ربطة', 'صندوق']).or(z.string().min(1)),
  price: z.number().positive(),
  isAvailable: z.boolean().optional(),
  stockQuantity: z.number().int().optional(),
  marketId: z.string().min(1),
  vendorId: z.string().min(1),
  categoryId: z.string().min(1),
});

router.get('/', async (req, res) => {
  const query = req.query;
  const search = String(query.search || '').trim();

  const where: any = {
    isAvailable: query.isAvailable === 'false' ? false : true,
    ...(query.categoryId ? { categoryId: String(query.categoryId) } : {}),
    ...(query.marketId ? { marketId: String(query.marketId) } : {}),
    ...(query.vendorId ? { vendorId: String(query.vendorId) } : {}),
    ...(query.minPrice || query.maxPrice
      ? {
          price: {
            ...(query.minPrice ? { gte: Number(query.minPrice) } : {}),
            ...(query.maxPrice ? { lte: Number(query.maxPrice) } : {}),
          },
        }
      : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const products = await prisma.product.findMany({
    where,
    include: {
      images: true,
      category: true,
      market: true,
      vendor: { include: { user: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return res.json({ products });
});

router.get('/:id', async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: {
      images: true,
      category: true,
      market: true,
      vendor: { include: { user: true } },
    },
  });

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  return res.json({ product });
});

router.post('/', authenticate, requirePermission(PERMISSIONS.MANAGE_PRODUCTS), async (req, res) => {
  const data = productSchema.parse(req.body);

  if (req.user!.role === 'VENDOR') {
    const vendor = await prisma.vendor.findFirst({ where: { userId: req.user!.id } });
    if (!vendor || vendor.id !== data.vendorId) {
      return res.status(403).json({ error: 'Cannot create products for another vendor' });
    }
  }

  const product = await prisma.product.create({ data });
  return res.status(201).json({ product });
});

router.put('/:id', authenticate, requirePermission(PERMISSIONS.MANAGE_PRODUCTS), async (req, res) => {
  const data = productSchema.partial().parse(req.body);

  const current = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: { vendor: true },
  });

  if (!current) {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (req.user!.role === 'VENDOR') {
    const vendor = await prisma.vendor.findFirst({ where: { userId: req.user!.id } });
    if (!vendor || vendor.id !== current.vendorId) {
      return res.status(403).json({ error: 'Cannot edit this product' });
    }
  }

  const product = await prisma.product.update({ where: { id: req.params.id }, data });
  return res.json({ product });
});

router.delete('/:id', authenticate, requirePermission(PERMISSIONS.MANAGE_PRODUCTS), async (req, res) => {
  const current = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!current) return res.status(404).json({ error: 'Product not found' });

  if (req.user!.role === 'VENDOR') {
    const vendor = await prisma.vendor.findFirst({ where: { userId: req.user!.id } });
    if (!vendor || vendor.id !== current.vendorId) {
      return res.status(403).json({ error: 'Cannot delete this product' });
    }
  }

  await prisma.product.delete({ where: { id: req.params.id } });
  return res.json({ message: 'Product deleted' });
});

router.post(
  '/:id/images',
  authenticate,
  requirePermission(PERMISSIONS.MANAGE_PRODUCTS),
  upload.single('image'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const image = await prisma.productImage.create({
      data: {
        productId: product.id,
        imageUrl: `/uploads/${req.file.filename}`,
      },
    });

    return res.status(201).json({ image });
  }
);

export default router;
