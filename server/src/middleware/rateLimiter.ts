import rateLimit from 'express-rate-limit';

/**
 * Auth routes: 5 requests per 15 minutes per IP.
 * Applies to: login, register, forgot-password, verify-email.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT',
      message: 'Too many authentication attempts, please try again after 15 minutes',
    },
  },
});

/**
 * General API routes: 100 requests per 15 minutes per IP.
 * Applies to: all /api/* routes.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT',
      message: 'Too many requests, please try again later',
    },
  },
});

/**
 * Redirect routes: 1000 requests per 15 minutes per IP.
 * Applies to: GET /:slug.
 */
export const redirectLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT',
      message: 'Too many redirect requests',
    },
  },
});

/**
 * AI routes: 10 requests per minute per IP.
 * Applies to: /api/ai/*.
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT',
      message: 'Too many AI requests, please try again after 1 minute',
    },
  },
});
