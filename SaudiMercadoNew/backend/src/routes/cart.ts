import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

const addToCartSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
});

// Get user's cart
router.get('/', authenticate, async (req: any, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: {
            market: { select: { name: true } },
            vendor: { select: { displayName: true } },
          },
        },
      },
    });

    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add to cart
router.post('/', authenticate, async (req: any, res) => {
  try {
    const { productId, quantity } = addToCartSchema.parse(req.body);

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { userId: req.user.id, productId },
    });

    if (existingItem) {
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
      res.json(updatedItem);
    } else {
      const newItem = await prisma.cartItem.create({
        data: {
          userId: req.user.id,
          productId,
          quantity,
        },
      });
      res.status(201).json(newItem);
    }
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' });
  }
});

// Update cart item
router.put('/:id', authenticate, async (req: any, res) => {
  try {
    const { quantity } = z.object({ quantity: z.number().int().min(1) }).parse(req.body);

    const cartItem = await prisma.cartItem.findUnique({ where: { id: req.params.id } });
    if (!cartItem || cartItem.userId !== req.user.id) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: req.params.id },
      data: { quantity },
    });

    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' });
  }
});

// Remove from cart
router.delete('/:id', authenticate, async (req: any, res) => {
  try {
    const cartItem = await prisma.cartItem.findUnique({ where: { id: req.params.id } });
    if (!cartItem || cartItem.userId !== req.user.id) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    await prisma.cartItem.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove item' });
  }
});

// Clear cart
router.delete('/', authenticate, async (req: any, res) => {
  try {
    await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

export default router;