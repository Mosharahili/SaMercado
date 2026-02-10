import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, authorize, checkPermission } from '../middleware/auth';

const router = Router();

const createMarketSchema = z.object({
  name: z.string(),
  region: z.string(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  operatingFrom: z.string().optional(),
  operatingTo: z.string().optional(),
  priceRange: z.string().optional(),
});

const updateMarketSchema = createMarketSchema.partial();

// Get all markets
router.get('/', async (req, res) => {
  try {
    const markets = await prisma.market.findMany({
      include: {
        products: {
          select: { id: true },
        },
        marketVendors: {
          include: {
            vendor: {
              select: { id: true, displayName: true },
            },
          },
        },
      },
    });

    const marketsWithCounts = markets.map(market => ({
      ...market,
      vendorCount: market.marketVendors.length,
    }));

    res.json(marketsWithCounts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch markets' });
  }
});

// Get market by ID
router.get('/:id', async (req, res) => {
  try {
    const market = await prisma.market.findUnique({
      where: { id: req.params.id },
      include: {
        products: true,
        marketVendors: {
          include: {
            vendor: true,
          },
        },
      },
    });

    if (!market) {
      return res.status(404).json({ error: 'Market not found' });
    }

    res.json(market);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch market' });
  }
});

// Create market (admin/owner)
router.post('/', authenticate, authorize('ADMIN', 'OWNER'), checkPermission('MANAGE_MARKETS'), async (req: any, res) => {
  try {
    const data = createMarketSchema.parse(req.body);
    const market = await prisma.market.create({ data });
    res.status(201).json(market);
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' });
  }
});

// Update market
router.put('/:id', authenticate, authorize('ADMIN', 'OWNER'), checkPermission('MANAGE_MARKETS'), async (req: any, res) => {
  try {
    const data = updateMarketSchema.parse(req.body);
    const market = await prisma.market.update({
      where: { id: req.params.id },
      data,
    });
    res.json(market);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update market' });
  }
});

// Delete market
router.delete('/:id', authenticate, authorize('ADMIN', 'OWNER'), checkPermission('MANAGE_MARKETS'), async (req: any, res) => {
  try {
    await prisma.market.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete market' });
  }
});

export default router;