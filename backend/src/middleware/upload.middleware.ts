import multer, { MulterError } from 'multer';
import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { ValidationError } from '../utils/errors.js';

const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Only allow image files
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE,
    files: env.MAX_FILES_PER_ITEM,
  },
});

export const handleUploadError = (
  err: Error | MulterError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'ValidationError',
        code: 'FILE_TOO_LARGE',
        message: `File size exceeds maximum of ${env.MAX_FILE_SIZE} bytes`,
      });
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'ValidationError',
        code: 'LIMIT_FILE_COUNT',
        message: `Maximum ${env.MAX_FILES_PER_ITEM} files allowed`,
      });
    }

    return res.status(400).json({
      error: 'ValidationError',
      code: err.code,
      message: err.message,
    });
  }

  if (err) {
    return res.status(400).json({
      error: 'ValidationError',
      code: 'INVALID_FILE',
      message: err.message,
    });
  }

  next();
};
