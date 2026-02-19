import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { env } from '../config/env.js';
import { logger } from './logger.js';

// ─── Constants ──────────────────────────────────────────────

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DIMENSION = 4096;
const THUMBNAIL_WIDTH = 400;

// ─── Types ──────────────────────────────────────────────────

interface SavedRoomImage {
  roomImageUrl: string;
  thumbnailUrl: string;
}

// ─── Validation ─────────────────────────────────────────────

export function validateRoomImageMime(mimeType: string): boolean {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function validateRoomImageExtension(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return (ALLOWED_EXTENSIONS as readonly string[]).includes(ext as typeof ALLOWED_EXTENSIONS[number]);
}

// ─── Save ───────────────────────────────────────────────────

export async function saveRoomImage(
  userId: string,
  buffer: Buffer,
): Promise<SavedRoomImage> {
  // Defense-in-depth size check (multipart plugin also enforces this)
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error('File exceeds maximum size of 5MB');
  }

  // Validate the buffer is actually a decodable image
  const metadata = await sharp(buffer).metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error('Uploaded file is not a valid image');
  }

  // Resize if dimensions exceed limit (preserve aspect ratio)
  let processedBuffer = buffer;
  if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) {
    processedBuffer = await sharp(buffer)
      .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside' })
      .png()
      .toBuffer();
  }

  const userDir = path.resolve(env.ROOM_IMAGE_STORAGE_PATH, userId);
  await fs.mkdir(userDir, { recursive: true });

  const fileId = crypto.randomUUID();
  const imageName = `${fileId}.png`;
  const thumbnailName = `${fileId}_thumb.png`;
  const imagePath = path.join(userDir, imageName);
  const thumbnailPath = path.join(userDir, thumbnailName);

  // Save full image (convert to PNG for consistency)
  await sharp(processedBuffer).png().toFile(imagePath);
  logger.debug(`Saved room image: ${imagePath}`);

  // Save thumbnail
  await sharp(processedBuffer)
    .resize({ width: THUMBNAIL_WIDTH })
    .png()
    .toFile(thumbnailPath);
  logger.debug(`Saved room thumbnail: ${thumbnailPath}`);

  const baseUrl = env.ROOM_IMAGE_BASE_URL.replace(/\/+$/, '');
  const roomImageUrl = `${baseUrl}/${userId}/${imageName}`;
  const thumbnailUrl = `${baseUrl}/${userId}/${thumbnailName}`;

  return { roomImageUrl, thumbnailUrl };
}

// ─── URL ↔ Path Resolution ──────────────────────────────────

/**
 * Resolves a room image URL to its local file path.
 * Used to read the file for Gemini multimodal input.
 */
export function resolveRoomImagePath(roomImageUrl: string): string {
  const baseUrl = env.ROOM_IMAGE_BASE_URL.replace(/\/+$/, '');
  if (!roomImageUrl.startsWith(baseUrl)) {
    throw new Error('Invalid room image URL');
  }
  const relativePath = roomImageUrl.slice(baseUrl.length); // e.g. "/userId/fileId.png"
  return path.resolve(env.ROOM_IMAGE_STORAGE_PATH, ...relativePath.split('/').filter(Boolean));
}
