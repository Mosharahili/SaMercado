import { Router } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

export const cartRouter = Router();

// Get current cart
cartRouter.get("/", requireAuth, async (req, res) => {
  const items = await prisma.cartItem.findMany({
    where: { userId: req.user!.id },
    include: {
      product: {
        include: {
          market: true,
          vendor: true,
          category: true,
        },
      },
    },
  });

  res.json(items);
});

// Add or update quantity
cartRouter.post("/add", requireAuth, async (req, res) => {
  const bodySchema = z.object({
    productId: z.string(),
    quantity: z.number().int().positive().default(1),
  });
  const { productId, quantity } = bodySchema.parse(req.body);

  const existing = await prisma.cartItem.findFirst({
    where: { userId: req.user!.id, productId },
  });

  let item;
  if (existing) {
    item = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  } else {
    item = await prisma.cartItem.create({
      data: {
        userId: req.user!.id,
        productId,
        quantity,
      },
    });
  }

  res.json(item);
});

cartRouter.post("/update", requireAuth, async (req, res) => {
  const bodySchema = z.object({
    cartItemId: z.string(),
    quantity: z.number().int().positive(),
  });
  const { cartItemId, quantity } = bodySchema.parse(req.body);

  const item = await prisma.cartItem.update({
    where: { id: cartItemId, userId: req.user!.id },
    data: { quantity },
  });

  res.json(item);
});

cartRouter.post("/remove", requireAuth, async (req, res) => {
  const bodySchema = z.object({
    cartItemId: z.string(),
  });
  const { cartItemId } = bodySchema.parse(req.body);

  await prisma.cartItem.delete({
    where: { id: cartItemId, userId: req.user!.id },
  });

  res.json({ success: true });
});

cartRouter.post("/clear", requireAuth, async (req, res) => {
  await prisma.cartItem.deleteMany({
    where: { userId: req.user!.id },
  });
  res.json({ success: true });
});

