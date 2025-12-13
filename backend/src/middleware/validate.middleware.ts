import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../utils/errors.js';

type ValidateTarget = 'body' | 'query' | 'params';

export const validate = (schema: ZodSchema, target: ValidateTarget = 'body') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[target];
      await schema.parseAsync(data);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const fields: Record<string, string[]> = {};
        error.errors.forEach(err => {
          const path = err.path.join('.');
          if (!fields[path]) {
            fields[path] = [];
          }
          fields[path].push(err.message);
        });

        return res.status(400).json({
          error: 'ValidationError',
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          fields,
        });
      }

      next(error);
    }
  };
};

export const validateBody = (schema: ZodSchema) => validate(schema, 'body');
export const validateQuery = (schema: ZodSchema) => validate(schema, 'query');
export const validateParams = (schema: ZodSchema) => validate(schema, 'params');
