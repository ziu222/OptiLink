import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller.js';

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
router.get('/overview', analyticsController.getOverview);

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
 *     responses:
 *       200:
 *         description: Trả về thống kê chi tiết của link
 */
router.get('/link/:id', analyticsController.getLinkAnalytics);

export const analyticsRoutes = router;
