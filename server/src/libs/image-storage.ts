import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { env } from '../config/env.js';
import { logger } from './logger.js';

const THUMBNAIL_WIDTH = 400;

interface SavedImage {
  imageUrl: string;
  thumbnailUrl: string;
}

export async function saveGeneratedImage(
  userId: string,
  generationId: string,
  base64Data: string
): Promise<SavedImage> {
  const userDir = path.resolve(env.IMAGE_STORAGE_PATH, userId);
  await fs.mkdir(userDir, { recursive: true });

  const imageName = `${generationId}.png`;
  const thumbnailName = `${generationId}_thumb.png`;
  const imagePath = path.join(userDir, imageName);
  const thumbnailPath = path.join(userDir, thumbnailName);

  const imageBuffer = Buffer.from(base64Data, 'base64');

  await fs.writeFile(imagePath, imageBuffer);
  logger.debug(`Saved generation image: ${imagePath}`);

  await sharp(imageBuffer)
    .resize({ width: THUMBNAIL_WIDTH })
    .png()
    .toFile(thumbnailPath);
  logger.debug(`Saved generation thumbnail: ${thumbnailPath}`);

  const baseUrl = env.IMAGE_BASE_URL.replace(/\/+$/, '');
  const imageUrl = `${baseUrl}/${userId}/${imageName}`;
  const thumbnailUrl = `${baseUrl}/${userId}/${thumbnailName}`;

  return { imageUrl, thumbnailUrl };
}
