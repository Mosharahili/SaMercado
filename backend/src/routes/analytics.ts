import { Router } from "express";
import { z } from "zod";
import { AnalyticsEventType, PermissionKey, UserRole } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { optionalAuth, requireAuth, requirePermission, requireRole } from "../middleware/auth";

export const analyticsRouter = Router();

// Track events from app
analyticsRouter.post("/track", optionalAuth, async (req, res) => {
  const bodySchema = z.object({
    type: z.nativeEnum(AnalyticsEventType),
    marketId: z.string().optional(),
    vendorId: z.string().optional(),
    productId: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  });

  const data = bodySchema.parse(req.body);

  await prisma.analyticsEvent.create({
    data: {
      type: data.type,
      userId: req.user?.id,
      marketId: data.marketId,
      vendorId: data.vendorId,
      productId: data.productId,
      metadata: data.metadata,
    },
  });

  res.json({ success: true });
});

// Owner/Admin summary dashboard
analyticsRouter.get(
  "/summary/owner",
  requireAuth,
  requireRole(UserRole.ADMIN, UserRole.OWNER),
  requirePermission(PermissionKey.VIEW_ANALYTICS),
  async (_req, res) => {
    const [ordersCount, revenueAgg, dailyOrders] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.$queryRawUnsafe<
        { date: string; count: number }[]
      >(
        `SELECT to_char("createdAt", 'YYYY-MM-DD') as date, count(*)::int as count
         FROM "Order"
         GROUP BY date
         ORDER BY date DESC
         LIMIT 30`
      ),
    ]);

    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    });

    res.json({
      totalOrders: ordersCount,
      totalRevenue: revenueAgg._sum.total ?? 0,
      dailyOrders,
      topProducts,
    });
  }
);

// Vendor analytics
analyticsRouter.get(
  "/summary/vendor",
  requireAuth,
  requireRole(UserRole.VENDOR),
  async (req, res) => {
    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user!.id },
    });
    if (!vendor) {
      return res.status(403).json({ error: "حسابك ليس بائعًا" });
    }

    const [ordersCount, revenueAgg] = await Promise.all([
      prisma.orderItem.count({ where: { vendorId: vendor.id } }),
      prisma.orderItem.aggregate({
        where: { vendorId: vendor.id },
        _sum: { lineTotal: true },
      }),
    ]);

    res.json({
      totalOrders: ordersCount,
      totalRevenue: revenueAgg._sum.lineTotal ?? 0,
    });
  }
);

