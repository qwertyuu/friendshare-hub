import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { NotFoundError, ForbiddenError, UnauthorizedError } from '../utils/errors.js';
import { storageService } from '../services/storage.service.js';

// Helper to add image URLs
const formatItem = (item: any) => {
  return {
    ...item,
    images: item.images.map((img: any) => ({
      ...img,
      url: storageService.getFileUrl(img.filePath),
    })),
  };
};

export const itemsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { category, status, page = '1', limit = '20' } = req.query;
      const pageNum = Math.max(1, parseInt(page as string) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};
      if (category && category !== 'all') {
        where.category = category;
      }
      if (status && status !== 'all') {
        where.status = status;
      }

      const [items, total] = await Promise.all([
        prisma.item.findMany({
          where,
          include: {
            owner: {
              select: { id: true, name: true, email: true },
            },
            images: {
              orderBy: { displayOrder: 'asc' },
            },
          },
          skip,
          take: limitNum,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.item.count({ where }),
      ]);

      const pages = Math.ceil(total / limitNum);

      return res.json({
        items: items.map(formatItem),
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { id } = req.params;

      const item = await prisma.item.findUnique({
        where: { id },
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
          images: {
            orderBy: { displayOrder: 'asc' },
          },
        },
      });

      if (!item) {
        throw new NotFoundError('Item not found');
      }

      return res.json({ item: formatItem(item) });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { title, description, category } = req.body;

      const item = await prisma.item.create({
        data: {
          title,
          description,
          category,
          ownerId: req.user.id,
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
          images: {
            orderBy: { displayOrder: 'asc' },
          },
        },
      });

      return res.status(201).json({ item: formatItem(item) });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { id } = req.params;
      const { title, description, category, status } = req.body;

      // Check ownership
      const item = await prisma.item.findUnique({
        where: { id },
      });

      if (!item) {
        throw new NotFoundError('Item not found');
      }

      if (item.ownerId !== req.user.id) {
        throw new ForbiddenError('You can only update your own items');
      }

      const updatedItem = await prisma.item.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(category !== undefined && { category }),
          ...(status !== undefined && { status }),
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
          images: {
            orderBy: { displayOrder: 'asc' },
          },
        },
      });

      return res.json({ item: formatItem(updatedItem) });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { id } = req.params;

      const item = await prisma.item.findUnique({
        where: { id },
      });

      if (!item) {
        throw new NotFoundError('Item not found');
      }

      if (item.ownerId !== req.user.id) {
        throw new ForbiddenError('You can only delete your own items');
      }

      await prisma.item.delete({
        where: { id },
      });

      return res.json({ message: 'Item deleted successfully' });
    } catch (error) {
      next(error);
    }
  },
};
