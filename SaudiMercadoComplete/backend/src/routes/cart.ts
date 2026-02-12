import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

const addItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().default(1),
});

const updateItemSchema = z.object({
  quantity: z.number().int().positive(),
});

const ensureCart = async (userId: string) => {
  const existing = await prisma.cart.findUnique({ where: { userId } });
  if (existing) return existing;
  return prisma.cart.create({ data: { userId } });
};

router.get('/', authenticate, async (req, res) => {
  const cart = await ensureCart(req.user!.id);

  const fullCart = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: true,
              market: true,
              vendor: { include: { user: true } },
            },
          },
        },
      },
    },
  });

  return res.json({ cart: fullCart });
});

router.post('/items', authenticate, async (req, res) => {
  const body = addItemSchema.parse(req.body);
  const cart = await ensureCart(req.user!.id);

  const product = await prisma.product.findUnique({ where: { id: body.productId } });
  if (!product || !product.isAvailable) {
    return res.status(400).json({ error: 'Product unavailable' });
  }

  const existing = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId: body.productId },
  });

  if (existing) {
    const updated = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + body.quantity },
    });
    return res.json({ item: updated });
  }

  const item = await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId: body.productId,
      quantity: body.quantity,
    },
  });

  return res.status(201).json({ item });
});

router.patch('/items/:itemId', authenticate, async (req, res) => {
  const body = updateItemSchema.parse(req.body);

  const item = await prisma.cartItem.findUnique({ where: { id: req.params.itemId }, include: { cart: true } });
  if (!item || item.cart.userId !== req.user!.id) {
    return res.status(404).json({ error: 'Cart item not found' });
  }

  const updated = await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity: body.quantity },
  });

  return res.json({ item: updated });
});

router.delete('/items/:itemId', authenticate, async (req, res) => {
  const item = await prisma.cartItem.findUnique({ where: { id: req.params.itemId }, include: { cart: true } });
  if (!item || item.cart.userId !== req.user!.id) {
    return res.status(404).json({ error: 'Cart item not found' });
  }

  await prisma.cartItem.delete({ where: { id: item.id } });
  return res.json({ message: 'Item removed' });
});

const clearCurrentUserCart = async (userId: string) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return { message: 'Cart cleared' };

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  return { message: 'Cart cleared' };
};

router.delete('/clear', authenticate, async (req, res) => {
  const payload = await clearCurrentUserCart(req.user!.id);
  return res.json(payload);
});

// Keep POST compatibility for older mobile builds that may call this as POST.
router.post('/clear', authenticate, async (req, res) => {
  const payload = await clearCurrentUserCart(req.user!.id);
  return res.json(payload);
});

// Tolerate accidental whitespace in legacy clients.
router.post('/ clear', authenticate, async (req, res) => {
  const payload = await clearCurrentUserCart(req.user!.id);
  return res.json(payload);
});

router.delete('/ clear', authenticate, async (req, res) => {
  const payload = await clearCurrentUserCart(req.user!.id);
  return res.json(payload);
});

export default router;
