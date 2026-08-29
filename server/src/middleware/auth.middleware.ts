import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import { verifyAccessToken } from '../utils/jwt.js';

/**
 * Verifies the `Authorization: Bearer <token>` header and attaches `req.user`.
 */
export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw AppError.unauthorized('Invalid or missing access token');
    }

    const payload = verifyAccessToken(header.slice(7));
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch (err) {
    // AppError -> as-is; JsonWebTokenError / TokenExpiredError -> errorHandler maps to 401.
    next(err);
  }
};

/**
 * Requires an authenticated admin. Must run after `authenticate`.
 */
export const requireAdmin = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'admin') {
    next(AppError.forbidden());
    return;
  }
  next();
};
