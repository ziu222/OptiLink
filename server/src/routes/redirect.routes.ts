import { Router } from 'express';
import { linksController } from '../controllers/links.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Redirect
 *   description: Public routes cho việc chuyển hướng link (Không cần auth)
 */

/**
 * @swagger
 * /{slug}:
 *   get:
 *     summary: Chuyển hướng đến URL gốc
 *     tags: [Redirect]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       301:
 *         description: Chuyển hướng thành công
 *       404:
 *         description: Không tìm thấy link
 */
router.get('/:slug', linksController.redirectLink);

/**
 * @swagger
 * /{slug}/verify:
 *   post:
 *     summary: Xác thực mật khẩu hoặc Captcha để truy cập link
 *     tags: [Redirect]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *               captchaToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mật khẩu / Captcha hợp lệ
 */
router.post('/:slug/verify', linksController.verifyLinkProtection);

export const redirectRoutes = router;
