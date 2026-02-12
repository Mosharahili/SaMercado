import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { env } from '../config/env';

type SaveImageResult = {
  url: string;
  filename: string;
  provider: 'supabase' | 'local';
};

const sanitizeFilename = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, '_');

const encodeObjectPath = (objectPath: string) =>
  objectPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

const hasSupabaseStorageConfig = () => Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);

const getFileBuffer = async (file: Express.Multer.File) => {
  if (file.buffer?.length) return file.buffer;
  if ((file as Express.Multer.File & { path?: string }).path) {
    return fs.readFile((file as Express.Multer.File & { path: string }).path);
  }
  throw new Error('Missing uploaded file buffer');
};

const removeTempFileIfExists = async (file: Express.Multer.File) => {
  const candidatePath = (file as Express.Multer.File & { path?: string }).path;
  if (!candidatePath) return;
  try {
    await fs.unlink(candidatePath);
  } catch {
    // Ignore cleanup failures.
  }
};

const saveLocally = async (file: Express.Multer.File): Promise<SaveImageResult> => {
  if (file.filename) {
    return {
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      provider: 'local',
    };
  }

  const ext = path.extname(file.originalname || '').toLowerCase() || '.bin';
  const baseName = sanitizeFilename(path.basename(file.originalname || `upload-${Date.now()}`, ext));
  const filename = `${Date.now()}-${baseName || randomUUID()}${ext}`;
  const uploadsPath = path.join(process.cwd(), env.uploadsDir);
  await fs.mkdir(uploadsPath, { recursive: true });
  await fs.writeFile(path.join(uploadsPath, filename), await getFileBuffer(file));

  return {
    url: `/uploads/${filename}`,
    filename,
    provider: 'local',
  };
};

const saveToSupabaseStorage = async (file: Express.Multer.File, folder: string): Promise<SaveImageResult> => {
  const buffer = await getFileBuffer(file);
  const ext = path.extname(file.originalname || '').toLowerCase() || '.bin';
  const baseName = sanitizeFilename(path.basename(file.originalname || 'image', ext)) || 'image';
  const objectPath = `${folder}/${Date.now()}-${randomUUID()}-${baseName}${ext}`;
  const encodedPath = encodeObjectPath(objectPath);
  const baseUrl = env.supabaseUrl.replace(/\/+$/, '');
  const bucket = env.supabaseStorageBucket;

  const uploadUrl = `${baseUrl}/storage/v1/object/${bucket}/${encodedPath}`;
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
      apikey: env.supabaseServiceRoleKey,
      'x-upsert': 'true',
      'Content-Type': file.mimetype || 'application/octet-stream',
    },
    body: buffer,
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase upload failed (${response.status}): ${details}`);
  }

  await removeTempFileIfExists(file);

  return {
    url: `${baseUrl}/storage/v1/object/public/${bucket}/${encodedPath}`,
    filename: objectPath,
    provider: 'supabase',
  };
};

export const saveUploadedImage = async (
  file: Express.Multer.File,
  folder = 'general'
): Promise<SaveImageResult> => {
  if (!hasSupabaseStorageConfig()) {
    if (env.nodeEnv === 'production') {
      throw new Error(
        'Supabase storage is not configured in production. Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_STORAGE_BUCKET.'
      );
    }

    return saveLocally(file);
  }

  return saveToSupabaseStorage(file, folder);
};
