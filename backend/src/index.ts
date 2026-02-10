import "dotenv/config";
import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

import { prisma } from "./lib/prisma";
import { authRouter } from "./routes/auth";
import { catalogRouter } from "./routes/catalog";
import { cartRouter } from "./routes/cart";
import { ordersRouter } from "./routes/orders";
import { adminRouter } from "./routes/admin";
import { vendorRouter } from "./routes/vendor";
import { contentRouter } from "./routes/content";
import { analyticsRouter } from "./routes/analytics";
import { settingsRouter } from "./routes/settings";
import { paymentsRouter } from "./routes/payments";
import { notificationsRouter, setNotificationsSocket } from "./routes/notifications";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routers
app.use("/api/auth", authRouter);
app.use("/api/catalog", catalogRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/admin", adminRouter);
app.use("/api/vendor", vendorRouter);
app.use("/api/content", contentRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/notifications", notificationsRouter);

app.use(errorHandler);

const port = process.env.PORT || 4000;
const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  // client should join room `user:{userId}` to receive order updates
  socket.on("joinUserRoom", (userId: string) => {
    socket.join(`user:${userId}`);
  });
});

setNotificationsSocket(io);

httpServer.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Saudi Mercado backend listening on port ${port}`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

