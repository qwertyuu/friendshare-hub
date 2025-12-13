import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { storageService } from '../services/storage.service.js';
import { NotFoundError, ForbiddenError, UnauthorizedError, ValidationError } from '../utils/errors.js';

export const imagesController = {
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { itemId } = req.params;
      const files = req.files as Express.Multer.File[] | undefined;

      if (!files || files.length === 0) {
        throw new ValidationError('No files provided');
      }

      // Check if item exists and user is owner
      const item = await prisma.item.findUnique({
        where: { id: itemId },
        include: { images: true },
      });

      if (!item) {
        throw new NotFoundError('Item not found');
      }

      if (item.ownerId !== req.user.id) {
        throw new ForbiddenError('You can only upload images to your own items');
      }

      // Get the current max order
      const maxOrder = item.images.length > 0
        ? Math.max(...item.images.map((img: any) => img.displayOrder))
        : 0;

      // Save files and create records
      const savedImages = [];
      let displayOrder = maxOrder + 1;

      for (const file of files) {
        const filePath = await storageService.saveFile(itemId, file);

        const image = await prisma.itemImage.create({
          data: {
            itemId,
            filePath,
            fileName: file.originalname,
            mimeType: file.mimetype,
            fileSize: file.size,
            displayOrder,
          },
        });

        savedImages.push({
          ...image,
          url: storageService.getFileUrl(filePath),
        });

        displayOrder++;
      }

      return res.status(201).json({ images: savedImages });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { itemId, imageId } = req.params;

      // Check item ownership
      const item = await prisma.item.findUnique({
        where: { id: itemId },
      });

      if (!item) {
        throw new NotFoundError('Item not found');
      }

      if (item.ownerId !== req.user.id) {
        throw new ForbiddenError('You can only delete images from your own items');
      }

      // Find and delete image
      const image = await prisma.itemImage.findUnique({
        where: { id: imageId },
      });

      if (!image) {
        throw new NotFoundError('Image not found');
      }

      if (image.itemId !== itemId) {
        throw new NotFoundError('Image not found for this item');
      }

      // Delete file from storage
      await storageService.deleteFile(image.filePath);

      // Delete from database
      await prisma.itemImage.delete({
        where: { id: imageId },
      });

      return res.json({ message: 'Image deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  async reorder(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { itemId } = req.params;
      const { imageIds } = req.body;

      if (!Array.isArray(imageIds) || imageIds.length === 0) {
        throw new ValidationError('Invalid image order');
      }

      // Check item ownership
      const item = await prisma.item.findUnique({
        where: { id: itemId },
      });

      if (!item) {
        throw new NotFoundError('Item not found');
      }

      if (item.ownerId !== req.user.id) {
        throw new ForbiddenError('You can only reorder images for your own items');
      }

      // Update display order
      const updatedImages = await Promise.all(
        imageIds.map((imageId: string, index: number) =>
          prisma.itemImage.update({
            where: { id: imageId },
            data: { displayOrder: index },
          })
        )
      );

      return res.json({
        images: updatedImages.map((img: any) => ({
          ...img,
          url: storageService.getFileUrl(img.filePath),
        })),
      });
    } catch (error) {
      next(error);
    }
  },
};
