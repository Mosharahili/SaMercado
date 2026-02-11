import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { env } from '../config/env';

const uploadsPath = path.join(process.cwd(), env.uploadsDir);
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsPath),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    // Allow all image/* MIME types to support more client capture formats.
    if (file.mimetype.toLowerCase().startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported image format'));
    }
  },
});
