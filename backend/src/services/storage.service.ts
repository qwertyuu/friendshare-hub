import { promises as fs } from 'fs';
import path from 'path';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export const storageService = {
  async saveFile(itemId: string, file: Express.Multer.File): Promise<string> {
    try {
      const uploadDir = path.join(env.UPLOAD_DIR, 'items', itemId);
      await fs.mkdir(uploadDir, { recursive: true });

      const filename = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(uploadDir, filename);

      await fs.writeFile(filePath, file.buffer);
      logger.info(`File saved: ${filePath}`);

      // Return path with forward slashes for URL compatibility
      return path.join('items', itemId, filename).replace(/\\/g, '/');
    } catch (error) {
      logger.error('Error saving file:', error);
      throw error;
    }
  },

  async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = path.join(env.UPLOAD_DIR, filePath);
      await fs.unlink(fullPath);
      logger.info(`File deleted: ${fullPath}`);
    } catch (error) {
      logger.error('Error deleting file:', error);
      throw error;
    }
  },

  getFilePath(itemId: string, filename: string): string {
    return path.join('items', itemId, filename);
  },

  getFileUrl(filePath: string): string {
    return `/uploads/${filePath.replace(/\\/g, '/')}`;
  },
};
