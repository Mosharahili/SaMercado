import dotenv from 'dotenv';

dotenv.config();

const requireEnv = (key: string, fallback?: string): string => {
  const value = process.env[key] || fallback;
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  host: process.env.HOST || '0.0.0.0',
  jwtSecret: requireEnv('JWT_SECRET', 'change-me-in-production'),
  clientOrigin: process.env.CLIENT_ORIGIN || '*',
  uploadsDir: process.env.UPLOADS_DIR || 'uploads',
  madaPaymentInitUrl: process.env.MADA_PAYMENT_INIT_URL || '',
  madaPaymentApiKey: process.env.MADA_PAYMENT_API_KEY || '',
  applePayInitUrl: process.env.APPLE_PAY_INIT_URL || '',
  applePayApiKey: process.env.APPLE_PAY_API_KEY || '',
};
