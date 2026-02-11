import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { PERMISSIONS } from '../constants/permissions';

const router = Router();

router.post('/image', authenticate, requirePermission(PERMISSIONS.MANAGE_PRODUCTS), upload.single('image'), async (req, res) => {
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
