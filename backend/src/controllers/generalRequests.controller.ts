import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';

export const generalRequestsController = {
  // List all general requests (public to authenticated users)
  async listAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const where = status && status !== 'all'
        ? { status: status as 'OPEN' | 'FULFILLED' | 'CANCELLED' }
        : {};

      const [requests, total] = await Promise.all([
        prisma.generalRequest.findMany({
          where,
          include: {
            requester: {
              select: { id: true, name: true, email: true },
            },
            responses: {
              include: {
                responder: {
                  select: { id: true, name: true, email: true },
                },
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
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.generalRequest.count({ where }),
      ]);

      return res.json({
        requests,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Get my general requests
  async listMine(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const requests = await prisma.generalRequest.findMany({
        where: {
          requesterId: req.user.id,
        },
        include: {
          requester: {
            select: { id: true, name: true, email: true },
          },
          responses: {
            include: {
              responder: {
                select: { id: true, name: true, email: true },
              },
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
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ requests });
    } catch (error) {
      next(error);
    }
  },

  // Create a general request
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const { title, description, startDate, endDate } = req.body;

      if (!title || title.trim().length === 0) {
        return res.status(400).json({ message: 'Title is required' });
      }

      const request = await prisma.generalRequest.create({
        data: {
          requesterId: req.user.id,
          title: title.trim(),
          description: description?.trim() || null,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
        },
        include: {
          requester: {
            select: { id: true, name: true, email: true },
          },
          responses: true,
        },
      });

      return res.status(201).json({ request });
    } catch (error) {
      next(error);
    }
  },

  // Update a general request
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const { id } = req.params;
      const { title, description, startDate, endDate } = req.body;

      // Find request
      const existingRequest = await prisma.generalRequest.findUnique({
        where: { id },
      });

      if (!existingRequest) {
        return res.status(404).json({ message: 'General request not found' });
      }

      // Check ownership
      if (existingRequest.requesterId !== req.user.id) {
        return res.status(403).json({ message: 'You can only update your own requests' });
      }

      const updatedRequest = await prisma.generalRequest.update({
        where: { id },
        data: {
          ...(title && { title: title.trim() }),
          ...(description !== undefined && { description: description?.trim() || null }),
          ...(startDate && { startDate: new Date(startDate) }),
          ...(endDate && { endDate: new Date(endDate) }),
        },
        include: {
          requester: {
            select: { id: true, name: true, email: true },
          },
          responses: {
            include: {
              responder: {
                select: { id: true, name: true, email: true },
              },
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
            },
          },
        },
      });

      return res.json({ request: updatedRequest });
    } catch (error) {
      next(error);
    }
  },

  // Mark request as fulfilled
  async fulfill(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const { id } = req.params;

      // Find request
      const request = await prisma.generalRequest.findUnique({
        where: { id },
      });

      if (!request) {
        return res.status(404).json({ message: 'General request not found' });
      }

      // Check ownership
      if (request.requesterId !== req.user.id) {
        return res.status(403).json({ message: 'You can only fulfill your own requests' });
      }

      const updatedRequest = await prisma.generalRequest.update({
        where: { id },
        data: {
          status: 'FULFILLED',
        },
        include: {
          requester: {
            select: { id: true, name: true, email: true },
          },
          responses: {
            include: {
              responder: {
                select: { id: true, name: true, email: true },
              },
              item: true,
            },
          },
        },
      });

      return res.json({ request: updatedRequest });
    } catch (error) {
      next(error);
    }
  },

  // Cancel request
  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const { id } = req.params;

      // Find request
      const request = await prisma.generalRequest.findUnique({
        where: { id },
      });

      if (!request) {
        return res.status(404).json({ message: 'General request not found' });
      }

      // Check ownership
      if (request.requesterId !== req.user.id) {
        return res.status(403).json({ message: 'You can only cancel your own requests' });
      }

      const updatedRequest = await prisma.generalRequest.update({
        where: { id },
        data: {
          status: 'CANCELLED',
        },
        include: {
          requester: {
            select: { id: true, name: true, email: true },
          },
          responses: true,
        },
      });

      return res.json({ request: updatedRequest });
    } catch (error) {
      next(error);
    }
  },

  // Delete request
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const { id } = req.params;

      // Find request
      const request = await prisma.generalRequest.findUnique({
        where: { id },
      });

      if (!request) {
        return res.status(404).json({ message: 'General request not found' });
      }

      // Check ownership
      if (request.requesterId !== req.user.id) {
        return res.status(403).json({ message: 'You can only delete your own requests' });
      }

      await prisma.generalRequest.delete({
        where: { id },
      });

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  // Respond to a general request with an item
  async respondWithItem(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const { id } = req.params;
      const { itemId, message } = req.body;

      // Find request
      const request = await prisma.generalRequest.findUnique({
        where: { id },
      });

      if (!request) {
        return res.status(404).json({ message: 'General request not found' });
      }

      // Cannot respond to your own request
      if (request.requesterId === req.user.id) {
        return res.status(403).json({ message: 'You cannot respond to your own request' });
      }

      // Verify item exists and belongs to the user
      if (itemId) {
        const item = await prisma.item.findUnique({
          where: { id: itemId },
        });

        if (!item) {
          return res.status(404).json({ message: 'Item not found' });
        }

        if (item.ownerId !== req.user.id) {
          return res.status(403).json({ message: 'You can only link your own items' });
        }
      }

      // Create response
      const response = await prisma.generalRequestResponse.create({
        data: {
          generalRequestId: id,
          responderId: req.user.id,
          itemId: itemId || null,
          message: message?.trim() || null,
        },
        include: {
          responder: {
            select: { id: true, name: true, email: true },
          },
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
        },
      });

      return res.status(201).json({ response });
    } catch (error) {
      next(error);
    }
  },

  // Delete a response
  async deleteResponse(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const { responseId } = req.params;

      // Find response
      const response = await prisma.generalRequestResponse.findUnique({
        where: { id: responseId },
      });

      if (!response) {
        return res.status(404).json({ message: 'Response not found' });
      }

      // Check ownership
      if (response.responderId !== req.user.id) {
        return res.status(403).json({ message: 'You can only delete your own responses' });
      }

      await prisma.generalRequestResponse.delete({
        where: { id: responseId },
      });

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
