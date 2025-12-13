import { Router } from 'express';
import { imagesController } from '../controllers/images.controller.js';
import { uploadMiddleware, handleUploadError } from '../middleware/upload.middleware.js';

const router = Router({ mergeParams: true });

// Upload images
router.post(
  '/',
  uploadMiddleware.array('images', 10),
  handleUploadError,
  imagesController.upload
);

// Delete image
router.delete('/:imageId', imagesController.delete);

// Reorder images
router.patch('/reorder', imagesController.reorder);

export default router;
