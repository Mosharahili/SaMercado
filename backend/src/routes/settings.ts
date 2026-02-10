import { Router } from "express";
import { z } from "zod";
import { UserRole, Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";

export const settingsRouter = Router();

// Public app settings
settingsRouter.get("/", async (_req, res) => {
  const settings = await prisma.appSettings.findFirst();
  res.json(settings);
});

// Owner: update branding, payments, delivery, tax, notifications
settingsRouter.put("/", requireAuth, requireRole(UserRole.OWNER), async (req, res) => {
  const bodySchema = z.object({
    appName: z.string().optional(),
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
    logoUrl: z.string().optional(),
    deliveryFee: z.number().optional(),
    taxRate: z.number().optional(),
    stcPayConfig: z.record(z.any()).optional(),
    madaConfig: z.record(z.any()).optional(),
    applePayConfig: z.record(z.any()).optional(),
    notificationConfig: z.record(z.any()).optional(),
  });

  const data = bodySchema.parse(req.body);

  const updated = await prisma.appSettings.upsert({
    where: { id: "app_settings_singleton" },
    update: {
      ...data,
      deliveryFee:
        data.deliveryFee !== undefined ? new Prisma.Decimal(data.deliveryFee) : undefined,
      taxRate: data.taxRate !== undefined ? new Prisma.Decimal(data.taxRate) : undefined,
    },
    create: {
      id: "app_settings_singleton",
      appName: data.appName ?? "Saudi Mercado – سعودي ميركادو",
      primaryColor: data.primaryColor ?? "#16a34a",
      secondaryColor: data.secondaryColor ?? "#22c55e",
      logoUrl: data.logoUrl,
      deliveryFee: new Prisma.Decimal(data.deliveryFee ?? 0),
      taxRate: new Prisma.Decimal(data.taxRate ?? 0),
      stcPayConfig: data.stcPayConfig,
      madaConfig: data.madaConfig,
      applePayConfig: data.applePayConfig,
      notificationConfig: data.notificationConfig,
    },
  });

  res.json(updated);
});

