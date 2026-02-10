import { Router } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma";
import { optionalAuth } from "../middleware/auth";

export const catalogRouter = Router();

// List markets with basic info
catalogRouter.get("/markets", optionalAuth, async (_req, res) => {
  const markets = await prisma.market.findMany({
    orderBy: { createdAt: "desc" },
  });

  res.json(markets);
});

// List products with filters and booster banners/popups resolved by client hitting /content endpoints
catalogRouter.get("/products", optionalAuth, async (req, res) => {
  const querySchema = z.object({
    search: z.string().optional(),
    categoryType: z.enum(["VEGETABLE", "FRUIT", "DATES"]).optional(),
    marketId: z.string().optional(),
    vendorId: z.string().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
  });

  const parsed = querySchema.parse(req.query);

  const products = await prisma.product.findMany({
    where: {
      available: true,
      name: parsed.search ? { contains: parsed.search, mode: "insensitive" } : undefined,
      marketId: parsed.marketId,
      vendorId: parsed.vendorId,
      category: parsed.categoryType ? { type: parsed.categoryType } : undefined,
      price:
        parsed.minPrice || parsed.maxPrice
          ? {
              gte: parsed.minPrice,
              lte: parsed.maxPrice,
            }
          : undefined,
    },
    include: {
      market: true,
      vendor: true,
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(products);
});

// Featured markets for home screen
catalogRouter.get("/featured-markets", async (_req, res) => {
  const markets = await prisma.market.findMany({
    take: 6,
    orderBy: { vendorCount: "desc" },
  });
  res.json(markets);
});

