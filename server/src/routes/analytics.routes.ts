import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { analyticsRangeQuerySchema } from '../validators/analytics.validators.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Thống kê và theo dõi tương tác
 */

/**
 * @swagger
 * /api/analytics/overview:
 *   get:
 *     summary: Lấy thống kê tổng quan của toàn bộ link (Dashboard)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về thống kê tổng quan
 */
router.get('/overview', authenticate, asyncHandler(analyticsController.getOverview));

/**
 * @swagger
 * /api/analytics/link/{id}:
 *   get:
 *     summary: Lấy thống kê chi tiết của một link cụ thể
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Trả về thống kê chi tiết của link
 */
router.get(
  '/link/:id',
  authenticate,
  validate(analyticsRangeQuerySchema, 'query'),
  asyncHandler(analyticsController.getLinkAnalytics),
);

export const analyticsRoutes = router;
