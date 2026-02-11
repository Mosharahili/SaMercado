import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { PERMISSIONS } from '../constants/permissions';

const router = Router();

router.post('/image', authenticate, upload.single('image'), async (req, res) => {
  const allowed =
    req.user?.role === 'OWNER' ||
    req.user?.permissions.includes(PERMISSIONS.MANAGE_PRODUCTS) ||
    req.user?.permissions.includes(PERMISSIONS.MANAGE_MARKETS) ||
    req.user?.permissions.includes(PERMISSIONS.MANAGE_BANNERS) ||
    req.user?.permissions.includes(PERMISSIONS.MANAGE_POPUPS);

  if (!allowed) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'Image file required' });
  }

  return res.status(201).json({
    file: {
      filename: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
    },
  });
});

export default router;
