import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error:', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.name,
      code: err.code,
      message: err.message,
    });
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    logger.error('Prisma error:', err);
    return res.status(400).json({
      error: 'Database Error',
      code: 'DATABASE_ERROR',
      message: 'An error occurred while processing your request',
    });
  }

  // Handle Prisma validation errors
  if (err.name === 'PrismaClientValidationError') {
    logger.error('Prisma validation error:', err);
    return res.status(400).json({
      error: 'Validation Error',
      code: 'VALIDATION_ERROR',
      message: 'Invalid data provided',
    });
  }

  // Default error
  res.status(500).json({
    error: 'Internal Server Error',
    code: 'INTERNAL_SERVER_ERROR',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
  });
};
