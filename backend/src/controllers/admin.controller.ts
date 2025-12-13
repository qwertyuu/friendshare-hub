import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { NotFoundError, UnauthorizedError } from '../utils/errors.js';

export const adminController = {
  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      if (req.user.role !== 'ADMIN') {
        throw new UnauthorizedError('Admin access required');
      }

      const { status } = req.query;

      const where: any = {};
      if (status && status !== 'all') {
        where.status = status;
      }

      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          createdAt: true,
          _count: {
            select: {
              items: true,
              requests: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ users });
    } catch (error) {
      next(error);
    }
  },

  async approveUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      if (req.user.role !== 'ADMIN') {
        throw new UnauthorizedError('Admin access required');
      }

      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { status: 'APPROVED' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          createdAt: true,
        },
      });

      return res.json({ user: updatedUser });
    } catch (error) {
      next(error);
    }
  },

  async rejectUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      if (req.user.role !== 'ADMIN') {
        throw new UnauthorizedError('Admin access required');
      }

      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { status: 'REJECTED' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          createdAt: true,
        },
      });

      return res.json({ user: updatedUser });
    } catch (error) {
      next(error);
    }
  },
};
