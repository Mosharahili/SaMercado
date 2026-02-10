import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, authorize, checkPermission } from '../middleware/auth';

const router = Router();

const createOrderSchema = z.object({
  deliveryFee: z.number().min(0),
  paymentMethod: z.enum(['STC_PAY', 'MADA', 'APPLE_PAY', 'CASH_ON_DELIVERY']),
});

// Get user's orders
router.get('/', authenticate, async (req: any, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: true,
            vendor: { select: { displayName: true } },
          },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get all orders (admin)
router.get('/all', authenticate, authorize('ADMIN', 'OWNER'), checkPermission('MANAGE_ORDERS'), async (req: any, res) => {
  try {
    const { status, vendorId, dateFrom, dateTo } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (vendorId) {
      where.items = { some: { vendorId } };
    }
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom as string);
      if (dateTo) where.createdAt.lte = new Date(dateTo as string);
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        items: {
          include: {
            product: true,
            vendor: { select: { displayName: true } },
          },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get vendor's orders
router.get('/vendor', authenticate, authorize('VENDOR'), async (req: any, res) => {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id },
    });

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const orders = await prisma.orderItem.findMany({
      where: { vendorId: vendor.id },
      include: {
        order: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
            payment: true,
          },
        },
        product: true,
      },
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Create order from cart
router.post('/', authenticate, async (req: any, res) => {
  try {
    const { deliveryFee, paymentMethod } = createOrderSchema.parse(req.body);

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const taxRate = 0.05; // 5%
    const taxAmount = subtotal * taxRate;
    const total = subtotal + deliveryFee + taxAmount;

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        deliveryFee,
        subtotal,
        taxAmount,
        total,
      },
    });

    // Create order items
    const orderItems = await Promise.all(
      cartItems.map(item =>
        prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            vendorId: item.product.vendorId,
            quantity: item.quantity,
            unitPrice: item.product.price,
            lineTotal: item.product.price * item.quantity,
          },
        })
      )
    );

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        method: paymentMethod,
        status: paymentMethod === 'CASH_ON_DELIVERY' ? 'PENDING' : 'PENDING',
      },
    });

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });

    res.status(201).json({ order, items: orderItems, payment });
  } catch (error) {
    res.status(400).json({ error: 'Failed to create order' });
  }
});

// Update order status
router.put('/:id/status', authenticate, async (req: any, res) => {
  try {
    const { status } = z.object({ status: z.enum(['NEW', 'PROCESSING', 'PREPARING', 'READY_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']) }).parse(req.body);

    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check permissions
    if (req.user.role === 'CUSTOMER' && order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (req.user.role === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.id } });
      const hasOrder = await prisma.orderItem.findFirst({
        where: { orderId: req.params.id, vendorId: vendor?.id },
      });
      if (!hasOrder) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update order' });
  }
});

export default router;