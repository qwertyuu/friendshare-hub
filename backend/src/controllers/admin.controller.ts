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
          rejectionReason: true,
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
      const { reason } = req.body;

      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          status: 'REJECTED',
          rejectionReason: reason || null,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          rejectionReason: true,
          createdAt: true,
        },
      });

      return res.json({ user: updatedUser });
    } catch (error) {
      next(error);
    }
  },

  async promoteUser(req: Request, res: Response, next: NextFunction) {
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

      if (user.role === 'ADMIN') {
        throw new Error('User is already an admin');
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { role: 'ADMIN' },
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

  async demoteUser(req: Request, res: Response, next: NextFunction) {
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

      if (req.user.id === id) {
        throw new Error('Cannot demote yourself');
      }

      if (user.role === 'USER') {
        throw new Error('User is already a regular user');
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { role: 'USER' },
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
