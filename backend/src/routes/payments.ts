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
  // حاليًا نعيد رابط صفحة دفع تجريبية من نفس الخادم ليتم عرضها في المتصفح.
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const mockUrl = `${baseUrl}/api/payments/checkout/${payment.id}`;

  res.json({
    paymentId: payment.id,
    paymentUrl: mockUrl,
  });
});

// صفحة دفع تجريبية لعرض تفاصيل الطلب/الدفع بشكل بصري للمستخدم
paymentsRouter.get("/checkout/:paymentId", async (req, res) => {
  const { paymentId } = z.object({ paymentId: z.string() }).parse(req.params);

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      order: {
        include: {
          user: true,
          items: {
            include: { product: true },
          },
        },
      },
    },
  });

  if (!payment || !payment.order) {
    return res.status(404).send("Payment not found");
  }

  const order = payment.order;
  const itemsRows =
    order.items
      .map(
        (i) =>
          `<tr><td>${i.product.name}</td><td>${i.quantity}</td><td>${i.unitPrice}</td><td>${i.lineTotal}</td></tr>`
      )
      .join("") || '<tr><td colspan="4">لا توجد عناصر</td></tr>';

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <title>صفحة دفع تجريبية - سعودي ميركادو</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background:#f1f5f9; margin:0; padding:16px; }
      .card { max-width: 640px; margin: 0 auto; background:#ffffff; border-radius:16px; padding:24px; box-shadow:0 10px 25px rgba(15,23,42,0.15); }
      h1 { margin:0 0 8px; font-size:20px; }
      h2 { margin:16px 0 8px; font-size:16px; }
      table { width:100%; border-collapse:collapse; margin-top:8px; }
      th, td { border-bottom:1px solid #e5e7eb; padding:6px 4px; font-size:13px; text-align:right; }
      th { background:#f9fafb; }
      .total { margin-top:12px; font-weight:700; }
      .badge { display:inline-block; padding:4px 10px; border-radius:999px; font-size:11px; background:#e0f2fe; color:#0369a1; }
      .hint { margin-top:12px; font-size:12px; color:#6b7280; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>صفحة دفع تجريبية</h1>
      <p>هذه الصفحة للاختبار فقط لحين ربط مزودي الدفع (STC Pay / Mada / Apple Pay).</p>
      <p><span class="badge">رقم الطلب: ${order.id}</span></p>

      <h2>ملخص الطلب</h2>
      <table>
        <thead>
          <tr>
            <th>المنتج</th>
            <th>الكمية</th>
            <th>سعر الوحدة</th>
            <th>الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <p class="total">إجمالي الطلب (مع الرسوم/الضريبة): ${order.total}</p>
      <p class="hint">بعد إتمام التكامل الفعلي مع مزود الدفع، سيتم تحويل الحالة تلقائيًا إلى \"مدفوع\" وتحديث حالة الطلب.</p>
    </div>
  </body>
</html>`);
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

