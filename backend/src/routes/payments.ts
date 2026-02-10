import { Router } from "express";
import { z } from "zod";
import { PaymentMethod, PaymentStatus, OrderStatus } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";

export const paymentsRouter = Router();

// Start payment for an order (STC Pay / Mada / Apple Pay)
paymentsRouter.post("/start", requireAuth, async (req, res) => {
  const bodySchema = z.object({
    orderId: z.string(),
    method: z.nativeEnum(PaymentMethod),
  });
  const { orderId, method } = bodySchema.parse(req.body);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });
  if (!order || order.userId !== req.user!.id) {
    throw new ApiError(404, "الطلب غير موجود");
  }

  const payment = await prisma.payment.update({
    where: { orderId },
    data: {
      method,
      status: PaymentStatus.PENDING,
      provider:
        method === PaymentMethod.STC_PAY
          ? "stc_pay"
          : method === PaymentMethod.MADA
          ? "mada"
          : method === PaymentMethod.APPLE_PAY
          ? "apple_pay"
          : "cash_on_delivery",
    },
  });

  // NOTE: هنا يجب دمج تكامل فعلي مع مزودي الدفع (STC Pay, Mada, Apple Pay)
  // سنرجع رابطًا تجريبيًا أو payload يمكن للتطبيق استغلاله لفتح صفحة الدفع.

  const mockUrl = `https://payments.saudimercado.local/checkout/${payment.id}`;

  res.json({
    paymentId: payment.id,
    paymentUrl: mockUrl,
  });
});

// Webhook مثال لتحديث حالة الدفع من مزود خارجي
paymentsRouter.post("/webhook/mock", async (req, res) => {
  const bodySchema = z.object({
    paymentId: z.string(),
    success: z.boolean(),
    transactionId: z.string().optional(),
    raw: z.record(z.any()).optional(),
  });
  const { paymentId, success, transactionId, raw } = bodySchema.parse(req.body);

  const payment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: success ? PaymentStatus.PAID : PaymentStatus.FAILED,
      transactionId,
      rawResponse: raw,
    },
  });

  // Sync order status
  if (success) {
    await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: OrderStatus.PROCESSING },
    });
  }

  res.json({ success: true });
});

