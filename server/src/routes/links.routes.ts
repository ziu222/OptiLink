import { Router } from 'express';
import { linksController } from '../controllers/links.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createLinkSchema,
  listLinksQuerySchema,
  updateLinkSchema,
} from '../validators/links.validators.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Links
 *   description: Quản lý URL ngắn
 */

/**
 * @swagger
 * /api/links:
 *   post:
 *     summary: Tạo link rút gọn mới
 *     tags: [Links]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [originalUrl]
 *             properties:
 *               originalUrl:
 *                 type: string
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *               redirectMode:
 *                 type: string
 *                 enum: [standard, splash]
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
router.post('/', authenticate, validate(createLinkSchema), asyncHandler(linksController.createLink));

/**
 * @swagger
 * /api/links:
 *   get:
 *     summary: Lấy danh sách link của user
 *     tags: [Links]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Lọc theo tiêu đề, URL gốc hoặc slug
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, active, inactive]
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest, clicks]
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
 */
router.get('/', authenticate, validate(listLinksQuerySchema, 'query'), asyncHandler(linksController.getLinks));

/**
 * @swagger
 * /api/links/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết của 1 link
 *     tags: [Links]
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
 *         description: Lấy thành công
 */
router.get('/:id', authenticate, asyncHandler(linksController.getLinkById));

/**
 * @swagger
 * /api/links/{id}:
 *   put:
 *     summary: Cập nhật link
 *     tags: [Links]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               title:
 *                 type: string
 *               originalUrl:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *               redirectMode:
 *                 type: string
 *                 enum: [standard, splash]
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put('/:id', authenticate, validate(updateLinkSchema), asyncHandler(linksController.updateLink));

/**
 * @swagger
 * /api/links/{id}:
 *   delete:
 *     summary: Xóa link (xóa mềm / archive)
 *     tags: [Links]
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
 *         description: Xóa thành công
 */
router.delete('/:id', authenticate, asyncHandler(linksController.deleteLink));

export const linksRoutes = router;
