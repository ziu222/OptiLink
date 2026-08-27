import { Router } from 'express';
import { linksController } from '../controllers/links.controller.js';

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
 *             properties:
 *               originalUrl:
 *                 type: string
 *               customSlug:
 *                 type: string
 *               password:
 *                 type: string
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
router.post('/', linksController.createLink);

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
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
 */
router.get('/', linksController.getLinks);

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
router.get('/:id', linksController.getLinkById);

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
 *               originalUrl:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put('/:id', linksController.updateLink);

/**
 * @swagger
 * /api/links/{id}:
 *   delete:
 *     summary: Xóa link
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
router.delete('/:id', linksController.deleteLink);

export const linksRoutes = router;
