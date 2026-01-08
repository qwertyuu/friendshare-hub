import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        code: 'NO_TOKEN',
        message: 'No authentication token provided',
      });
    }

    const decoded = authService.verifyToken(token);

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: '', // Will be populated from DB if needed
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return res.status(401).json({
        error: error.name,
        code: error.code,
        message: error.message,
      });
    }

    return res.status(401).json({
      error: 'Unauthorized',
      code: 'INVALID_TOKEN',
      message: 'Invalid or expired token',
    });
  }
};

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Forbidden',
      code: 'FORBIDDEN',
      message: 'Admin access required',
    });
  }

  next();
};
