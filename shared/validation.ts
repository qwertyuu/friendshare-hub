import { z } from 'zod';

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Items schemas
export const createItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  category: z.enum(['TOOLS', 'KITCHEN', 'SPORTS', 'ELECTRONICS', 'BOOKS', 'GAMES', 'CAMPING', 'OTHER']),
});

export const updateItemSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  category: z.enum(['TOOLS', 'KITCHEN', 'SPORTS', 'ELECTRONICS', 'BOOKS', 'GAMES', 'CAMPING', 'OTHER']).optional(),
  status: z.enum(['AVAILABLE', 'BORROWED', 'UNAVAILABLE']).optional(),
});

// Borrow request schemas
export const createRequestSchema = z.object({
  itemId: z.string().uuid('Invalid item ID'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  message: z.string().max(500).optional(),
});

export const approveRequestSchema = z.object({
  responseMessage: z.string().max(500).optional(),
});

export const rejectRequestSchema = z.object({
  responseMessage: z.string().max(500).optional(),
});

export const reorderImagesSchema = z.object({
  imageIds: z.array(z.string().uuid()),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type ApproveRequestInput = z.infer<typeof approveRequestSchema>;
export type RejectRequestInput = z.infer<typeof rejectRequestSchema>;
export type ReorderImagesInput = z.infer<typeof reorderImagesSchema>;
