import { Router } from "express";
import { z } from "zod";
import { PermissionKey, UserRole, Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { requireAuth, requirePermission, requireRole } from "../middleware/auth";

export const adminRouter = Router();

// ----- Admins & permissions -----

// Owner: list admins
adminRouter.get(
  "/admins",
  requireAuth,
  requireRole(UserRole.OWNER),
  async (_req, res) => {
    const admins = await prisma.admin.findMany({
      include: {
        user: {
          include: { permissions: true },
        },
      },
    });
    res.json(admins);
  }
);

// Owner: create admin & assign permissions
adminRouter.post(
  "/admins",
  requireAuth,
  requireRole(UserRole.OWNER),
  async (req, res) => {
    const bodySchema = z.object({
      userId: z.string(),
      permissions: z.array(z.nativeEnum(PermissionKey)),
    });
    const { userId, permissions } = bodySchema.parse(req.body);

    const admin = await prisma.$transaction(async (tx) => {
      await tx.admin.upsert({
        where: { userId },
        create: { userId },
        update: {},
      });

      await tx.permission.deleteMany({ where: { userId } });
      await tx.permission.createMany({
        data: permissions.map((key) => ({ userId, key })),
      });

      const user = await tx.user.update({
        where: { id: userId },
        data: { role: UserRole.ADMIN },
      });

      return user;
    });

    res.json(admin);
  }
);

// Owner: update permissions
adminRouter.put(
  "/admins/:userId/permissions",
  requireAuth,
  requireRole(UserRole.OWNER),
  async (req, res) => {
    const paramsSchema = z.object({ userId: z.string() });
    const bodySchema = z.object({
      permissions: z.array(z.nativeEnum(PermissionKey)),
    });

    const { userId } = paramsSchema.parse(req.params);
    const { permissions } = bodySchema.parse(req.body);

    await prisma.$transaction(async (tx) => {
      await tx.permission.deleteMany({ where: { userId } });
      await tx.permission.createMany({
        data: permissions.map((key) => ({ userId, key })),
      });
    });

    res.json({ success: true });
  }
);

// ----- Markets -----

adminRouter.get(
  "/markets",
  requireAuth,
  requirePermission(PermissionKey.MANAGE_MARKETS),
  async (_req, res) => {
    const markets = await prisma.market.findMany();
    res.json(markets);
  }
);

adminRouter.post(
  "/markets",
  requireAuth,
  requirePermission(PermissionKey.MANAGE_MARKETS),
  async (req, res) => {
    const bodySchema = z.object({
      name: z.string(),
      region: z.string(),
      description: z.string().optional(),
      imageUrl: z.string().optional(),
      operatingFrom: z.string().optional(),
      operatingTo: z.string().optional(),
      priceRange: z.string().optional(),
    });
    const data = bodySchema.parse(req.body);

    const market = await prisma.market.create({ data });
    res.json(market);
  }
);

adminRouter.patch(
  "/markets/:id",
  requireAuth,
  requirePermission(PermissionKey.MANAGE_MARKETS),
  async (req, res) => {
    const paramsSchema = z.object({ id: z.string() });
    const bodySchema = z.object({
      name: z.string().optional(),
      region: z.string().optional(),
      description: z.string().optional(),
      imageUrl: z.string().optional(),
      operatingFrom: z.string().optional(),
      operatingTo: z.string().optional(),
      priceRange: z.string().optional(),
    });
    const { id } = paramsSchema.parse(req.params);
    const data = bodySchema.parse(req.body);

    const market = await prisma.market.update({
      where: { id },
      data,
    });
    res.json(market);
  }
);

adminRouter.delete(
  "/markets/:id",
  requireAuth,
  requirePermission(PermissionKey.MANAGE_MARKETS),
  async (req, res) => {
    const paramsSchema = z.object({ id: z.string() });
    const { id } = paramsSchema.parse(req.params);

    await prisma.market.delete({ where: { id } });
    res.json({ success: true });
  }
);

// Assign vendor to market
adminRouter.post(
  "/markets/:marketId/vendors",
  requireAuth,
  requirePermission(PermissionKey.MANAGE_MARKETS),
  async (req, res) => {
    const paramsSchema = z.object({ marketId: z.string() });
    const bodySchema = z.object({ vendorId: z.string() });

    const { marketId } = paramsSchema.parse(req.params);
    const { vendorId } = bodySchema.parse(req.body);

    const mv = await prisma.marketVendor.create({
      data: {
        marketId,
        vendorId,
      },
    });

    // update vendorCount
    const count = await prisma.marketVendor.count({ where: { marketId } });
    await prisma.market.update({
      where: { id: marketId },
      data: { vendorCount: count },
    });

    res.json(mv);
  }
);

// ----- Vendors -----

adminRouter.get(
  "/vendors",
  requireAuth,
  requirePermission(PermissionKey.MANAGE_VENDORS),
  async (_req, res) => {
    const vendors = await prisma.vendor.findMany({
      include: {
        user: true,
        markets: {
          include: { market: true },
        },
      },
    });
    res.json(vendors);
  }
);

adminRouter.post(
  "/vendors",
  requireAuth,
  requirePermission(PermissionKey.MANAGE_VENDORS),
  async (req, res) => {
    const bodySchema = z.object({
      userId: z.string(),
      displayName: z.string(),
      description: z.string().optional(),
    });
    const data = bodySchema.parse(req.body);

    const vendor = await prisma.$transaction(async (tx) => {
      const created = await tx.vendor.create({
        data: {
          userId: data.userId,
          displayName: data.displayName,
          description: data.description,
        },
      });

      await tx.user.update({
        where: { id: data.userId },
        data: { role: UserRole.VENDOR },
      });

      return created;
    });

    res.json(vendor);
  }
);

// ----- Products (global management) -----

adminRouter.get(
  "/products",
  requireAuth,
  requirePermission(PermissionKey.MANAGE_PRODUCTS),
  async (_req, res) => {
    const products = await prisma.product.findMany({
      include: { market: true, vendor: true, category: true },
    });
    res.json(products);
  }
);

adminRouter.patch(
  "/products/:id",
  requireAuth,
  requirePermission(PermissionKey.MANAGE_PRODUCTS),
  async (req, res) => {
    const paramsSchema = z.object({ id: z.string() });
    const bodySchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      price: z.number().optional(),
      unit: z.string().optional(),
      available: z.boolean().optional(),
    });

    const { id } = paramsSchema.parse(req.params);
    const data = bodySchema.parse(req.body);

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        price: data.price !== undefined ? new Prisma.Decimal(data.price) : undefined,
      },
    });
    res.json(product);
  }
);

// ----- Users -----

adminRouter.get(
  "/users",
  requireAuth,
  requirePermission(PermissionKey.MANAGE_USERS),
  async (_req, res) => {
    const users = await prisma.user.findMany({
      include: { permissions: true, vendor: true, adminProfile: true },
    });
    res.json(users);
  }
);

