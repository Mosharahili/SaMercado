import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserRole, PermissionKey } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { ApiError } from "./errorHandler";

export interface AuthUser {
  id: string;
  role: UserRole;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new ApiError(401, "غير مصرح، الرجاء تسجيل الدخول");
  }

  const token = authHeader.substring("Bearer ".length);
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new ApiError(500, "JWT secret غير مهيأ في الخادم");
  }

  try {
    const payload = jwt.verify(token, secret) as AuthUser;
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch {
    throw new ApiError(401, "رمز الدخول غير صالح أو منتهي");
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const secret = process.env.JWT_SECRET;

  if (!authHeader?.startsWith("Bearer ") || !secret) {
    return next();
  }

  const token = authHeader.substring("Bearer ".length);
  try {
    const payload = jwt.verify(token, secret) as AuthUser;
    req.user = { id: payload.id, role: payload.role };
  } catch {
    // ignore invalid token
  }
  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, "غير مصرح");
    }
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, "ليست لديك صلاحية للوصول");
    }
    next();
  };
}

export function requirePermission(permission: PermissionKey) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, "غير مصرح");
    }

    // Owner always allowed
    if (req.user.role === UserRole.OWNER) {
      return next();
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true, permissions: true },
    });

    if (!user) {
      throw new ApiError(401, "المستخدم غير موجود");
    }

    const hasPermission = user.permissions.some((p) => p.key === permission);
    if (!hasPermission) {
      throw new ApiError(403, "ليست لديك الصلاحية المطلوبة");
    }

    next();
  };
}

