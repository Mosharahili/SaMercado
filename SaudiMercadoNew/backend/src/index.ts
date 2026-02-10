import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';
import path from 'path';

// Routes
import authRoutes from './routes/auth';
import marketRoutes from './routes/markets';
import productRoutes from './routes/products';
import cartRoutes from './routes/cart';
import orderRoutes from './routes/orders';
import bannerRoutes from './routes/banners';
import popupRoutes from './routes/popups';
import analyticsRoutes from './routes/analytics';
import vendorRoutes from './routes/vendors';
import adminRoutes from './routes/admin';
import categoryRoutes from './routes/categories';
import paymentRoutes from './routes/payments';
import notificationRoutes from './routes/notifications';
import settingsRoutes from './routes/settings';

// Middleware
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/markets', marketRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/popups', popupRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;