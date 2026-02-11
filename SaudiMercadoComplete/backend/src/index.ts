import 'express-async-errors';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';

import { env } from './config/env';
import { ensureSchemaCompat } from './bootstrap/ensureSchemaCompat';
import { errorHandler } from './middleware/errorHandler';
import { setSocket } from './realtime/socket';

import authRoutes from './routes/auth';
import marketRoutes from './routes/markets';
import categoryRoutes from './routes/categories';
import productRoutes from './routes/products';
import cartRoutes from './routes/cart';
import orderRoutes from './routes/orders';
import bannerRoutes from './routes/banners';
import popupRoutes from './routes/popups';
import vendorRoutes from './routes/vendors';
import adminRoutes from './routes/admin';
import analyticsRoutes from './routes/analytics';
import settingsRoutes from './routes/settings';
import paymentRoutes from './routes/payments';
import notificationRoutes from './routes/notifications';
import uploadRoutes from './routes/upload';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: env.clientOrigin === '*' ? true : env.clientOrigin,
    credentials: true,
  },
});

setSocket(io);

io.on('connection', (socket) => {
  socket.emit('connected', { ok: true, socketId: socket.id });
});

app.use(helmet());
app.use(
  cors({
    origin: env.clientOrigin === '*' ? true : env.clientOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(process.cwd(), env.uploadsDir)));

app.get('/api/health', (_req, res) => {
  res.json({
    app: 'SaudiMercado Backend',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/markets', marketRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/popups', popupRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);

app.use(errorHandler);

const start = async () => {
  await ensureSchemaCompat();
  // Bind on all interfaces in hosted environments (e.g. Render) to ensure port detection.
  server.listen(env.port, () => {
    console.log(`SaudiMercado backend running on port ${env.port}`);
  });
};

start().catch((error) => {
  console.error('Failed to start backend:', error);
  process.exit(1);
});
