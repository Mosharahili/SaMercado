import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { env } from '../config/env';
import { authenticate } from '../middleware/auth';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  phone: z.string().optional(),
  role: z.enum(['CUSTOMER', 'VENDOR']).optional().default('CUSTOMER'),
  businessName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/register', async (req, res) => {
  const body = registerSchema.parse(req.body);

  const exists = await prisma.user.findUnique({ where: { email: body.email } });
  if (exists) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const hashed = await bcrypt.hash(body.password, 10);

  const user = await prisma.user.create({
    data: {
      email: body.email,
      passwordHash: hashed,
      name: body.name,
      phone: body.phone,
      role: body.role,
      vendorProfile:
        body.role === 'VENDOR'
          ? {
              create: {
                businessName: body.businessName || body.name,
                businessPhone: body.phone,
                isApproved: false,
              },
            }
          : undefined,
    },
    include: {
      permissions: { include: { permission: true } },
    },
  });

  const token = jwt.sign({ id: user.id }, env.jwtSecret, { expiresIn: '7d' });

  return res.status(201).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions.map((p) => p.permission.code),
    },
  });
});

router.post('/login', async (req, res) => {
  const body = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email: body.email },
    include: { permissions: { include: { permission: true } } },
  });

  if (!user) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(body.password, user.passwordHash);
  if (!isMatch) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id }, env.jwtSecret, { expiresIn: '7d' });

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions.map((p) => p.permission.code),
    },
  });
});

router.get('/me', authenticate, async (req, res) => {
  const userId = req.user!.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      permissions: { include: { permission: true } },
      vendorProfile: true,
      adminProfile: true,
    },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions.map((p) => p.permission.code),
      vendorProfile: user.vendorProfile,
      adminProfile: user.adminProfile,
    },
  });
});

router.post('/logout', authenticate, async (_req, res) => {
  return res.json({ message: 'Logged out successfully' });
});

export default router;
