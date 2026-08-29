import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { connectDB, disconnectDB } from './config/db.js';
import { connectRedis, disconnectRedis } from './config/redis.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { logger } from './utils/logger.js';
import { setupSwagger } from './config/swagger.js';
import { authRoutes } from './routes/auth.routes.js';
import { linksRoutes } from './routes/links.routes.js';
import { analyticsRoutes } from './routes/analytics.routes.js';
import { bioRoutes } from './routes/bio.routes.js';
import { qrRoutes } from './routes/qr.routes.js';
import { aiRoutes } from './routes/ai.routes.js';
import { adminRoutes } from './routes/admin.routes.js';
import { redirectRoutes } from './routes/redirect.routes.js';

// ── Create Express app ──────────────────────────────────────────

const app = express();

// ── Global middleware ───────────────────────────────────────────

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// ── Uploaded media (avatar / hero banner images) ────────────────
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ── Rate limiting ───────────────────────────────────────────────

app.use('/api/', apiLimiter);

// ── Health check ────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'OptiLink API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ── Swagger ─────────────────────────────────────────────────────
setupSwagger(app);

// ── Routes (mount khi implement từng phase) ─────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/links', linksRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/bio', bioRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// MUST BE LAST (catch-all /:slug)
app.use('/', redirectRoutes);

// ── 404 handler for unmatched API routes ────────────────────────

app.use('/api/*', (_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'API endpoint not found',
    },
  });
});

// ── Global error handler (MUST be last) ─────────────────────────

app.use(errorHandler);

// ── Start server ────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT || '5000', 10);

const startServer = async () => {
  try {
    // Connect to databases
    await connectDB();
    await connectRedis();

    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    });

    // ── Graceful shutdown ──────────────────────────────────────
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);

      server.close(async () => {
        await disconnectDB();
        await disconnectRedis();
        logger.info('Server shut down complete');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Unhandled rejection handler
    process.on('unhandledRejection', (reason: Error) => {
      logger.error('Unhandled Rejection:', reason);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export { app };
