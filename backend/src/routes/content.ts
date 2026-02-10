import { Router } from "express";
import { z } from "zod";
import { BannerClickActionType, BannerPlacement, PopupTargetType, UserRole, PermissionKey } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { optionalAuth, requireAuth, requirePermission, requireRole } from "../middleware/auth";
import { upload } from "../middleware/upload";

export const contentRouter = Router();

// Public: list active banners for placement
contentRouter.get("/banners", optionalAuth, async (req, res) => {
  const querySchema = z.object({
    placement: z.nativeEnum(BannerPlacement),
  });
  const { placement } = querySchema.parse(req.query);

  const now = new Date();
  const banners = await prisma.banner.findMany({
    where: {
      placement,
      enabled: true,
      OR: [
        { startAt: null },
        { startAt: { lte: now } },
      ],
      AND: [
        { endAt: null },
        { endAt: { gte: now } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(banners);
});

// Public: determine popups for current user
contentRouter.get("/popups", optionalAuth, async (req, res) => {
  const querySchema = z.object({
    marketId: z.string().optional(),
    categoryId: z.string().optional(),
    isNewUser: z.coerce.boolean().optional(),
  });
  const { marketId, categoryId, isNewUser } = querySchema.parse(req.query);

  const now = new Date();
  const popups = await prisma.popup.findMany({
    where: {
      enabled: true,
      OR: [
        { startAt: null },
        { startAt: { lte: now } },
      ],
      AND: [
        { endAt: null },
        { endAt: { gte: now } },
      ],
    },
  });

  const filtered = popups.filter((popup) => {
    if (popup.targetType === PopupTargetType.ALL_USERS) return true;
    if (popup.targetType === PopupTargetType.LOGGED_IN && req.user) return true;
    if (popup.targetType === PopupTargetType.NEW_USERS && isNewUser) return true;
    if (popup.targetType === PopupTargetType.SPECIFIC_MARKETS && marketId) {
      return popup.marketIds.includes(marketId);
    }
    if (popup.targetType === PopupTargetType.SPECIFIC_CATEGORIES && categoryId) {
      return popup.categoryIds.includes(categoryId);
    }
    return false;
  });

  res.json(filtered);
});

// Owner/Admin: manage banners
contentRouter.post(
  "/banners",
  requireAuth,
  requireRole(UserRole.ADMIN, UserRole.OWNER),
  requirePermission(PermissionKey.MANAGE_BANNERS),
  upload.single("image"),
  async (req, res) => {
    const bodySchema = z.object({
      title: z.string(),
      description: z.string().optional(),
      ctaText: z.string().optional(),
      placement: z.nativeEnum(BannerPlacement),
      actionType: z.nativeEnum(BannerClickActionType),
      actionTargetId: z.string().optional(),
      externalUrl: z.string().url().optional(),
      startAt: z.string().datetime().optional(),
      endAt: z.string().datetime().optional(),
      enabled: z.coerce.boolean().optional(),
    });

    const data = bodySchema.parse(req.body);
    const fileUrl = `/uploads/${req.file?.filename}`;

    const banner = await prisma.banner.create({
      data: {
        title: data.title,
        description: data.description,
        imageUrl: fileUrl,
        ctaText: data.ctaText,
        placement: data.placement,
        actionType: data.actionType,
        actionTargetId: data.actionTargetId,
        externalUrl: data.externalUrl,
        startAt: data.startAt ? new Date(data.startAt) : null,
        endAt: data.endAt ? new Date(data.endAt) : null,
        enabled: data.enabled ?? true,
      },
    });

    res.json(banner);
  }
);

contentRouter.patch(
  "/banners/:id",
  requireAuth,
  requireRole(UserRole.ADMIN, UserRole.OWNER),
  requirePermission(PermissionKey.MANAGE_BANNERS),
  upload.single("image"),
  async (req, res) => {
    const paramsSchema = z.object({ id: z.string() });
    const bodySchema = z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      ctaText: z.string().optional(),
      placement: z.nativeEnum(BannerPlacement).optional(),
      actionType: z.nativeEnum(BannerClickActionType).optional(),
      actionTargetId: z.string().optional(),
      externalUrl: z.string().url().optional(),
      startAt: z.string().datetime().optional().nullable(),
      endAt: z.string().datetime().optional().nullable(),
      enabled: z.coerce.boolean().optional(),
    });

    const { id } = paramsSchema.parse(req.params);
    const data = bodySchema.parse(req.body);

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        ...data,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
        startAt: data.startAt ? new Date(data.startAt) : undefined,
        endAt: data.endAt ? new Date(data.endAt) : undefined,
      },
    });

    res.json(banner);
  }
);

contentRouter.post(
  "/banners/:id/toggle",
  requireAuth,
  requireRole(UserRole.ADMIN, UserRole.OWNER),
  requirePermission(PermissionKey.MANAGE_BANNERS),
  async (req, res) => {
    const paramsSchema = z.object({ id: z.string() });
    const { id } = paramsSchema.parse(req.params);

    const current = await prisma.banner.findUnique({ where: { id } });
    if (!current) {
      return res.status(404).json({ error: "البانر غير موجود" });
    }

    const banner = await prisma.banner.update({
      where: { id },
      data: { enabled: !current.enabled },
    });

    res.json(banner);
  }
);

// Owner/Admin: manage popups
contentRouter.post(
  "/popups",
  requireAuth,
  requireRole(UserRole.ADMIN, UserRole.OWNER),
  requirePermission(PermissionKey.MANAGE_POPUPS),
  upload.single("image"),
  async (req, res) => {
    const bodySchema = z.object({
      title: z.string(),
      message: z.string().optional(),
      primaryCtaText: z.string().optional(),
      secondaryCtaText: z.string().optional(),
      targetType: z.nativeEnum(PopupTargetType),
      marketIds: z.array(z.string()).optional(),
      categoryIds: z.array(z.string()).optional(),
      startAt: z.string().datetime().optional(),
      endAt: z.string().datetime().optional(),
      enabled: z.coerce.boolean().optional(),
    });

    const data = bodySchema.parse(req.body);
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const popup = await prisma.popup.create({
      data: {
        title: data.title,
        message: data.message,
        imageUrl: fileUrl,
        primaryCtaText: data.primaryCtaText,
        secondaryCtaText: data.secondaryCtaText,
        targetType: data.targetType,
        marketIds: data.marketIds ?? [],
        categoryIds: data.categoryIds ?? [],
        startAt: data.startAt ? new Date(data.startAt) : null,
        endAt: data.endAt ? new Date(data.endAt) : null,
        enabled: data.enabled ?? true,
      },
    });

    res.json(popup);
  }
);

contentRouter.patch(
  "/popups/:id",
  requireAuth,
  requireRole(UserRole.ADMIN, UserRole.OWNER),
  requirePermission(PermissionKey.MANAGE_POPUPS),
  upload.single("image"),
  async (req, res) => {
    const paramsSchema = z.object({ id: z.string() });
    const bodySchema = z.object({
      title: z.string().optional(),
      message: z.string().optional(),
      primaryCtaText: z.string().optional(),
      secondaryCtaText: z.string().optional(),
      targetType: z.nativeEnum(PopupTargetType).optional(),
      marketIds: z.array(z.string()).optional(),
      categoryIds: z.array(z.string()).optional(),
      startAt: z.string().datetime().optional().nullable(),
      endAt: z.string().datetime().optional().nullable(),
      enabled: z.coerce.boolean().optional(),
    });

    const { id } = paramsSchema.parse(req.params);
    const data = bodySchema.parse(req.body);

    const popup = await prisma.popup.update({
      where: { id },
      data: {
        ...data,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
        startAt: data.startAt ? new Date(data.startAt) : undefined,
        endAt: data.endAt ? new Date(data.endAt) : undefined,
      },
    });

    res.json(popup);
  }
);

