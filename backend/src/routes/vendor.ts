import { Router } from "express";
import { z } from "zod";
import { OrderStatus, UnitType, UserRole, Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { upload } from "../middleware/upload";
import { ApiError } from "../middleware/errorHandler";

export const vendorRouter = Router();

// Ensure the current user is a vendor and return vendor record
async function getCurrentVendor(userId: string) {
  const vendor = await prisma.vendor.findUnique({
    where: { userId },
  });
  if (!vendor) {
    throw new ApiError(403, "حسابك ليس بائعًا");
  }
  return vendor;
}

// Dashboard stats
vendorRouter.get(
  "/dashboard",
  requireAuth,
  requireRole(UserRole.VENDOR),
  async (req, res) => {
    const vendor = await getCurrentVendor(req.user!.id);

    const totalOrders = await prisma.orderItem.count({
      where: { vendorId: vendor.id },
    });
    const totalRevenueAgg = await prisma.orderItem.aggregate({
      where: { vendorId: vendor.id },
      _sum: { lineTotal: true },
    });

    const recentOrders = await prisma.orderItem.findMany({
      where: { vendorId: vendor.id },
      include: {
        order: true,
        product: true,
      },
      orderBy: { order: { createdAt: "desc" } },
      take: 10,
    });

    res.json({
      totalOrders,
      totalRevenue: totalRevenueAgg._sum.lineTotal ?? 0,
      recentOrders,
    });
  }
);

// Vendor products CRUD
vendorRouter.get(
  "/products",
  requireAuth,
  requireRole(UserRole.VENDOR),
  async (req, res) => {
    const vendor = await getCurrentVendor(req.user!.id);
    const products = await prisma.product.findMany({
      where: { vendorId: vendor.id },
      include: { market: true, category: true },
    });
    res.json(products);
  }
);

vendorRouter.post(
  "/products",
  requireAuth,
  requireRole(UserRole.VENDOR),
  upload.single("image"),
  async (req, res) => {
    const vendor = await getCurrentVendor(req.user!.id);

    const bodySchema = z.object({
      name: z.string(),
      description: z.string().optional(),
      price: z.number(),
      unit: z.nativeEnum(UnitType),
      marketId: z.string(),
      categoryId: z.string().optional(),
      available: z.boolean().optional(),
    });
    const data = bodySchema.parse(req.body);

    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: new Prisma.Decimal(data.price),
        unit: data.unit,
        marketId: data.marketId,
        vendorId: vendor.id,
        categoryId: data.categoryId,
        available: data.available ?? true,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
      },
    });

    res.json(product);
  }
);

vendorRouter.patch(
  "/products/:id",
  requireAuth,
  requireRole(UserRole.VENDOR),
  upload.single("image"),
  async (req, res) => {
    const vendor = await getCurrentVendor(req.user!.id);
    const paramsSchema = z.object({ id: z.string() });
    const bodySchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      price: z.number().optional(),
      unit: z.nativeEnum(UnitType).optional(),
      marketId: z.string().optional(),
      categoryId: z.string().optional(),
      available: z.boolean().optional(),
    });

    const { id } = paramsSchema.parse(req.params);
    const data = bodySchema.parse(req.body);

    const product = await prisma.product.update({
      where: { id, vendorId: vendor.id },
      data: {
        ...data,
        price: data.price !== undefined ? new Prisma.Decimal(data.price) : undefined,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
      },
    });

    res.json(product);
  }
);

// Vendor orders
vendorRouter.get(
  "/orders",
  requireAuth,
  requireRole(UserRole.VENDOR),
  async (req, res) => {
    const vendor = await getCurrentVendor(req.user!.id);

    const items = await prisma.orderItem.findMany({
      where: { vendorId: vendor.id },
      include: {
        order: {
          include: { user: true, payment: true },
        },
        product: true,
      },
      orderBy: { order: { createdAt: "desc" } },
    });

    res.json(items);
  }
);

vendorRouter.post(
  "/orders/:orderId/status",
  requireAuth,
  requireRole(UserRole.VENDOR),
  async (req, res) => {
    const vendor = await getCurrentVendor(req.user!.id);
    const paramsSchema = z.object({ orderId: z.string() });
    const bodySchema = z.object({
      status: z.nativeEnum(OrderStatus),
    });
    const { orderId } = paramsSchema.parse(req.params);
    const { status } = bodySchema.parse(req.body);

    // Ensure this vendor is part of the order
    const hasItems = await prisma.orderItem.findFirst({
      where: { orderId, vendorId: vendor.id },
    });
    if (!hasItems) {
      throw new ApiError(403, "لا يمكنك تحديث هذا الطلب");
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    res.json(order);
  }
);

