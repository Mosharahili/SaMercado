import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate, authorize, checkPermission } from '../middleware/auth';

const router = Router();

// Get analytics (admin/owner)
router.get('/', authenticate, authorize('ADMIN', 'OWNER'), checkPermission('VIEW_ANALYTICS'), async (req: any, res) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const dateFilter: any = {};
    if (dateFrom) dateFilter.createdAt = { gte: new Date(dateFrom as string) };
    if (dateTo) dateFilter.createdAt = { ...dateFilter.createdAt, lte: new Date(dateTo as string) };

    // Total orders
    const totalOrders = await prisma.order.count({ where: dateFilter });

    // Total revenue
    const revenueResult = await prisma.order.aggregate({
      where: { ...dateFilter, status: { not: 'CANCELLED' } },
      _sum: { total: true },
    });
    const totalRevenue = revenueResult._sum.total || 0;

    // Daily sales (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailySales = await prisma.$queryRaw`
      SELECT DATE(createdAt) as date, COUNT(*) as orders, SUM(total) as revenue
      FROM "Order"
      WHERE "createdAt" >= ${thirtyDaysAgo} AND status != 'CANCELLED'
      GROUP BY DATE(createdAt)
      ORDER BY date DESC
    `;

    // Top selling products
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: dateFilter,
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10,
    });

    const productDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true },
        });
        return {
          productId: item.productId,
          name: product?.name,
          totalSold: item._sum.quantity,
        };
      })
    );

    // Top vendors
    const topVendors = await prisma.orderItem.groupBy({
      by: ['vendorId'],
      where: dateFilter,
      _sum: { lineTotal: true },
      orderBy: { _sum: { lineTotal: 'desc' } },
      take: 10,
    });

    const vendorDetails = await Promise.all(
      topVendors.map(async (item) => {
        const vendor = await prisma.vendor.findUnique({
          where: { id: item.vendorId },
          select: { displayName: true },
        });
        return {
          vendorId: item.vendorId,
          name: vendor?.displayName,
          totalRevenue: item._sum.lineTotal,
        };
      })
    );

    // Most active markets
    const activeMarkets = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: dateFilter,
      _count: { orderId: true },
    });

    const marketStats = await Promise.all(
      activeMarkets.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { market: { select: { name: true } } },
        });
        return {
          marketName: product?.market?.name,
          orders: item._count.orderId,
        };
      })
    );

    const marketSummary = marketStats.reduce((acc, curr) => {
      if (curr.marketName) {
        acc[curr.marketName] = (acc[curr.marketName] || 0) + curr.orders;
      }
      return acc;
    }, {} as Record<string, number>);

    const topMarkets = Object.entries(marketSummary)
      .map(([name, orders]) => ({ name, orders }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 10);

    res.json({
      totalOrders,
      totalRevenue,
      dailySales,
      topProducts: productDetails,
      topVendors: vendorDetails,
      topMarkets,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Track event
router.post('/event', authenticate, async (req: any, res) => {
  try {
    const { type, marketId, vendorId, productId, metadata } = req.body;

    await prisma.analyticsEvent.create({
      data: {
        userId: req.user.id,
        type,
        marketId,
        vendorId,
        productId,
        metadata,
      },
    });

    res.status(201).json({ success: true });
  } catch (error) {
    res.status(400).json({ error: 'Failed to track event' });
  }
});

export default router;