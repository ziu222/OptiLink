import { Router } from 'express';
import { aiController } from '../controllers/ai.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: Tính năng trí tuệ nhân tạo (Gợi ý SEO, Alias)
 */

/**
 * @swagger
 * /api/ai/generate-meta:
 *   post:
 *     summary: Sinh tự động thẻ Meta SEO (Title, Description) bằng AI
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               originalUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sinh meta thành công
 */
router.post('/generate-meta', aiController.generateMeta);

/**
 * @swagger
 * /api/ai/suggest-alias:
 *   post:
 *     summary: Gợi ý các custom alias/slug bằng AI
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               originalUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Trả về danh sách alias gợi ý
 */
router.post('/suggest-alias', aiController.suggestAlias);

export const aiRoutes = router;
