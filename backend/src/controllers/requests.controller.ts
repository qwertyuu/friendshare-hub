import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { NotFoundError, ForbiddenError, UnauthorizedError, ConflictError } from '../utils/errors.js';

export const requestsController = {
  async listRequests(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const requests = await prisma.borrowRequest.findMany({
        where: {
          requesterId: req.user.id,
        },
        include: {
          item: {
            include: {
              owner: {
                select: { id: true, name: true, email: true },
              },
              images: {
                orderBy: { displayOrder: 'asc' },
              },
            },
          },
          requester: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ requests });
    } catch (error) {
      next(error);
    }
  },

  async listDemands(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const demands = await prisma.borrowRequest.findMany({
        where: {
          item: {
            ownerId: req.user.id,
          },
        },
        include: {
          item: {
            include: {
              owner: {
                select: { id: true, name: true, email: true },
              },
              images: {
                orderBy: { displayOrder: 'asc' },
              },
            },
          },
          requester: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ demands });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { itemId, startDate, endDate, message } = req.body;

      // Check if item exists
      const item = await prisma.item.findUnique({
        where: { id: itemId },
      });

      if (!item) {
        throw new NotFoundError('Item not found');
      }

      // Can't borrow own item
      if (item.ownerId === req.user.id) {
        throw new ForbiddenError('You cannot borrow your own items');
      }

      // Check if there's already a pending request
      const existingRequest = await prisma.borrowRequest.findFirst({
        where: {
          itemId,
          requesterId: req.user.id,
          status: 'PENDING',
        },
      });

      if (existingRequest) {
        throw new ConflictError('You already have a pending request for this item');
      }

      // Create request
      const request = await prisma.borrowRequest.create({
        data: {
          itemId,
          requesterId: req.user.id,
          ownerId: item.ownerId,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          message,
        },
        include: {
          item: {
            include: {
              owner: {
                select: { id: true, name: true, email: true },
              },
              images: {
                orderBy: { displayOrder: 'asc' },
              },
            },
          },
          requester: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return res.status(201).json({ request });
    } catch (error) {
      next(error);
    }
  },

  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { id } = req.params;
      const { responseMessage } = req.body;

      // Find request
      const request = await prisma.borrowRequest.findUnique({
        where: { id },
        include: { item: true },
      });

      if (!request) {
        throw new NotFoundError('Request not found');
      }

      // Check if user is item owner
      if (request.item.ownerId !== req.user.id) {
        throw new ForbiddenError('You can only approve requests for your items');
      }

      // Update request
      const updatedRequest = await prisma.borrowRequest.update({
        where: { id },
        data: {
          status: 'APPROVED',
          responseMessage,
        },
        include: {
          item: {
            include: {
              owner: {
                select: { id: true, name: true, email: true },
              },
              images: {
                orderBy: { displayOrder: 'asc' },
              },
            },
          },
          requester: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return res.json({ request: updatedRequest });
    } catch (error) {
      next(error);
    }
  },

  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { id } = req.params;
      const { responseMessage } = req.body;

      // Find request
      const request = await prisma.borrowRequest.findUnique({
        where: { id },
        include: { item: true },
      });

      if (!request) {
        throw new NotFoundError('Request not found');
      }

      // Check if user is item owner
      if (request.item.ownerId !== req.user.id) {
        throw new ForbiddenError('You can only reject requests for your items');
      }

      // Update request
      const updatedRequest = await prisma.borrowRequest.update({
        where: { id },
        data: {
          status: 'REJECTED',
          responseMessage,
        },
        include: {
          item: {
            include: {
              owner: {
                select: { id: true, name: true, email: true },
              },
              images: {
                orderBy: { displayOrder: 'asc' },
              },
            },
          },
          requester: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return res.json({ request: updatedRequest });
    } catch (error) {
      next(error);
    }
  },

  async complete(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { id } = req.params;

      // Find request
      const request = await prisma.borrowRequest.findUnique({
        where: { id },
        include: { item: true },
      });

      if (!request) {
        throw new NotFoundError('Request not found');
      }

      // Check if user is requester or owner
      const isRequester = request.requesterId === req.user.id;
      const isOwner = request.item.ownerId === req.user.id;

      if (!isRequester && !isOwner) {
        throw new ForbiddenError('You can only complete your own requests');
      }

      // Update request
      const updatedRequest = await prisma.borrowRequest.update({
        where: { id },
        data: {
          status: 'COMPLETED',
        },
        include: {
          item: {
            include: {
              owner: {
                select: { id: true, name: true, email: true },
              },
              images: {
                orderBy: { displayOrder: 'asc' },
              },
            },
          },
          requester: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return res.json({ request: updatedRequest });
    } catch (error) {
      next(error);
    }
  },

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { id } = req.params;

      // Find request
      const request = await prisma.borrowRequest.findUnique({
        where: { id },
        include: { item: true },
      });

      if (!request) {
        throw new NotFoundError('Request not found');
      }

      // Check if user is the requester (only requester can cancel)
      if (request.requesterId !== req.user.id) {
        throw new ForbiddenError('You can only cancel your own requests');
      }

      // Check if request can be cancelled (must be PENDING or APPROVED)
      if (request.status === 'COMPLETED' || request.status === 'REJECTED' || request.status === 'CANCELLED') {
        throw new ConflictError('Cannot cancel a request that is already completed, rejected, or cancelled');
      }

      // Update request
      const updatedRequest = await prisma.borrowRequest.update({
        where: { id },
        data: {
          status: 'CANCELLED',
        },
        include: {
          item: {
            include: {
              owner: {
                select: { id: true, name: true, email: true },
              },
              images: {
                orderBy: { displayOrder: 'asc' },
              },
            },
          },
          requester: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return res.json({ request: updatedRequest });
    } catch (error) {
      next(error);
    }
  },
};
