import { Router } from "express";
import { z } from "zod";
import { OrderStatus, PaymentMethod, PaymentStatus, UserRole, Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";

export const ordersRouter = Router();

// Create order from current cart
ordersRouter.post("/", requireAuth, async (req, res) => {
  const bodySchema = z.object({
    paymentMethod: z.nativeEnum(PaymentMethod),
    address: z.string().min(3),
  });
  const { paymentMethod } = bodySchema.parse(req.body);

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: req.user!.id },
    include: { product: true },
  });

  if (cartItems.length === 0) {
    throw new ApiError(400, "السلة فارغة");
  }

  const settings = await prisma.appSettings.findFirst();
  const deliveryFee = settings?.deliveryFee ?? new Prisma.Decimal(0);
  const taxRate = settings?.taxRate ?? new Prisma.Decimal(0);

  const subtotal = cartItems.reduce(
    (sum, item) => sum.plus(item.product.price.mul(item.quantity)),
    new Prisma.Decimal(0)
  );

  const taxAmount = subtotal.mul(taxRate).div(100);
  const total = subtotal.plus(deliveryFee).plus(taxAmount);

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        userId: req.user!.id,
        status: OrderStatus.NEW,
        deliveryFee,
        subtotal,
        taxAmount,
        total,
      },
    });

    for (const item of cartItems) {
      await tx.orderItem.create({
        data: {
          orderId: createdOrder.id,
          productId: item.productId,
          vendorId: item.product.vendorId,
          quantity: item.quantity,
          unitPrice: item.product.price,
          lineTotal: item.product.price.mul(item.quantity),
        },
      });
    }

    await tx.payment.create({
      data: {
        orderId: createdOrder.id,
        method: paymentMethod,
        status: paymentMethod === PaymentMethod.CASH_ON_DELIVERY ? PaymentStatus.PENDING : PaymentStatus.PENDING,
      },
    });

    await tx.cartItem.deleteMany({ where: { userId: req.user!.id } });

    return createdOrder;
  });

  res.json(order);
});

// Customer orders
ordersRouter.get("/my", requireAuth, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user!.id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(orders);
});

// Admin/Owner list and filter
ordersRouter.get(
  "/",
  requireAuth,
  requireRole(UserRole.ADMIN, UserRole.OWNER),
  async (req, res) => {
    const querySchema = z.object({
      status: z.nativeEnum(OrderStatus).optional(),
      vendorId: z.string().optional(),
      marketId: z.string().optional(),
    });
    const { status, vendorId, marketId } = querySchema.parse(req.query);

    const orders = await prisma.order.findMany({
      where: {
        status,
        items: vendorId
          ? {
              some: {
                vendorId,
              },
            }
          : undefined,
      },
      include: {
        items: {
          include: {
            product: {
              include: { market: true },
            },
          },
        },
        payment: true,
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const filtered = marketId
      ? orders.filter((o) => o.items.some((i) => i.product.marketId === marketId))
      : orders;

    res.json(filtered);
  }
);

// Update status (admin/owner)
ordersRouter.post(
  "/:orderId/status",
  requireAuth,
  requireRole(UserRole.ADMIN, UserRole.OWNER),
  async (req, res) => {
    const paramsSchema = z.object({ orderId: z.string() });
    const bodySchema = z.object({
      status: z.nativeEnum(OrderStatus),
    });

    const { orderId } = paramsSchema.parse(req.params);
    const { status } = bodySchema.parse(req.body);

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    res.json(updated);
  }
);

