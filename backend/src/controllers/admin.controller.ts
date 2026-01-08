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

      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
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

  async getStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      if (req.user.role !== 'ADMIN') {
        throw new UnauthorizedError('Admin access required');
      }

      // Get platform-wide statistics
      const stats = {
        users: {
          total: await prisma.user.count(),
          admins: await prisma.user.count({ where: { role: 'ADMIN' } }),
          users: await prisma.user.count({ where: { role: 'USER' } }),
        },
        items: {
          total: await prisma.item.count(),
          available: await prisma.item.count({ where: { status: 'AVAILABLE' } }),
          borrowed: await prisma.item.count({ where: { status: 'BORROWED' } }),
        },
        requests: {
          total: await prisma.borrowRequest.count(),
          pending: await prisma.borrowRequest.count({ where: { status: 'PENDING' } }),
          approved: await prisma.borrowRequest.count({ where: { status: 'APPROVED' } }),
          active: await prisma.borrowRequest.count({
            where: {
              status: 'APPROVED',
              endDate: { gte: new Date() },
            },
          }),
        },
        generalRequests: {
          total: await prisma.generalRequest.count(),
          open: await prisma.generalRequest.count({ where: { status: 'OPEN' } }),
        },
      };

      return res.json(stats);
    } catch (error) {
      next(error);
    }
  },

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      if (req.user.role !== 'ADMIN') {
        throw new UnauthorizedError('Admin access required');
      }

      const { id } = req.params;

      // Prevent self-deletion
      if (id === req.user.id) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Cannot delete your own account',
        });
      }

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Delete user (cascade will handle related items, requests, etc.)
      await prisma.user.delete({
        where: { id },
      });

      return res.json({
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

};
