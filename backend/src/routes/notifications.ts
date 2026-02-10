import { Router } from "express";
import type { Server as SocketIOServer } from "socket.io";
import { z } from "zod";

import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { UserRole } from "@prisma/client";

let io: SocketIOServer | null = null;

export function setNotificationsSocket(server: SocketIOServer) {
  io = server;
}

export const notificationsRouter = Router();

// Register / update push token for the current user
notificationsRouter.post("/register-token", requireAuth, async (req, res) => {
  const bodySchema = z.object({
    token: z.string().min(1),
  });
  const { token } = bodySchema.parse(req.body);

  await prisma.user.update({
    where: { id: req.user!.id },
    data: { pushToken: token },
  });

  res.json({ success: true });
});

// Admin/Owner can send announcement notification to all or specific users
notificationsRouter.post(
  "/broadcast",
  requireAuth,
  requireRole(UserRole.ADMIN, UserRole.OWNER),
  async (req, res) => {
    const bodySchema = z.object({
      title: z.string().min(1),
      body: z.string().min(1),
    });
    const { title, body } = bodySchema.parse(req.body);

    // Save notification record (for now, broadcast without userId)
    await prisma.notification.create({
      data: {
        title,
        body,
      },
    });

    // Emit via WebSocket to all clients
    if (io) {
      io.emit("admin_announcement", { title, body });
    }

    // TODO: integrate with real push notification provider (FCM/APNs/Expo)

    res.json({ success: true });
  }
);

