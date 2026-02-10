import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import { z } from "zod";

import { prisma } from "../lib/prisma";
import { ApiError } from "../middleware/errorHandler";
import { requireAuth } from "../middleware/auth";

export const authRouter = Router();

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  phone: z.string().optional(),
});

authRouter.post("/signup", async (req, res) => {
  const data = authSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new ApiError(400, "البريد الإلكتروني مسجّل مسبقًا");
  }

  const hash = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash: hash,
      name: data.name,
      phone: data.phone,
      role: UserRole.CUSTOMER,
    },
  });

  const token = signToken(user.id, user.role);
  res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
});

authRouter.post(
  "/login",
  async (req, res) => {
    const bodySchema = z.object({
      email: z.string().email(),
      password: z.string().min(1),
    });
    const { email, password } = bodySchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email }, include: { permissions: true } });
    if (!user) {
      throw new ApiError(400, "بيانات الدخول غير صحيحة");
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new ApiError(400, "بيانات الدخول غير صحيحة");
    }

    const token = signToken(user.id, user.role);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        permissions: user.permissions.map((p) => p.key),
      },
    });
  }
);

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: { permissions: true, vendor: true, adminProfile: true },
  });
  if (!user) {
    throw new ApiError(404, "المستخدم غير موجود");
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    permissions: user.permissions.map((p) => p.key),
    vendorId: user.vendor?.id ?? null,
  });
});

function signToken(id: string, role: UserRole): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new ApiError(500, "JWT secret غير مهيأ في الخادم");
  }
  return jwt.sign({ id, role }, secret, { expiresIn: "7d" });
}

