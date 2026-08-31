import { Router } from 'express';
import { linksController } from '../controllers/links.controller.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { redirectLimiter } from '../middleware/rateLimiter.js';
import { verifyLinkSchema } from '../validators/links.validators.js';

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
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mật khẩu hợp lệ — trả về data.originalUrl
 *       401:
 *         description: Sai mật khẩu
 *       404:
 *         description: Không tìm thấy link
 */
router.post(
  '/:slug/verify',
  redirectLimiter,
  validate(verifyLinkSchema),
  asyncHandler(linksController.verifyLinkProtection),
);

export const redirectRoutes = router;
