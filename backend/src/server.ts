import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { AppError } from './utils/errors.js';
import { errorHandler } from './middleware/error.middleware.js';
import authRouter from './routes/auth.routes.js';
import itemsRouter from './routes/items.routes.js';
import imagesRouter from './routes/images.routes.js';
import requestsRouter from './routes/requests.routes.js';
import generalRequestsRouter from './routes/generalRequests.routes.js';
import adminRouter from './routes/admin.routes.js';

const app: Express = express();

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Cookie parser
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25, // limit each IP to 25 requests per windowMs
  message: 'Too many authentication attempts, please try again later',
  skipSuccessfulRequests: false,
});

app.use(limiter);

// Static files
app.use('/uploads', express.static(env.UPLOAD_DIR));

// Routes
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/items', itemsRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/general-requests', generalRequestsRouter);
app.use('/api/admin', adminRouter);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = env.PORT;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);
});

export default app;
