import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: API Quản trị hệ thống (Chỉ dành cho Admin)
 */

// ── Stats ────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Thống kê tổng quan hệ thống
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/stats', adminController.getGlobalStats);

/**
 * @swagger
 * /api/admin/stats/growth:
 *   get:
 *     summary: Thống kê tăng trưởng theo thời gian
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/stats/growth', adminController.getGrowthStats);

// ── Users ────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Lấy danh sách toàn bộ người dùng
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/users', adminController.getUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Xem chi tiết một người dùng
 *     tags: [Admin]
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
 *         description: Thành công
 */
router.get('/users/:id', adminController.getUserById);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: Cập nhật thông tin/quyền hạn người dùng
 *     tags: [Admin]
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
 *         description: Thành công
 */
router.put('/users/:id', adminController.updateUser);

/**
 * @swagger
 * /api/admin/users/{id}/ban:
 *   put:
 *     summary: Khóa hoặc mở khóa người dùng
 *     tags: [Admin]
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
 *         description: Thành công
 */
router.put('/users/:id/ban', adminController.banUser);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Xóa vĩnh viễn người dùng
 *     tags: [Admin]
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
 *         description: Thành công
 */
router.delete('/users/:id', adminController.deleteUser);

// ── Content ──────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/admin/content:
 *   get:
 *     summary: Lấy danh sách nội dung (links, bio, qr) trên toàn hệ thống
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/content', adminController.getContentList);

/**
 * @swagger
 * /api/admin/content/{type}/{id}:
 *   delete:
 *     summary: Xóa một nội dung vi phạm
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.delete('/content/:type/:id', adminController.deleteContent);

// ── AI ───────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/admin/ai/stats:
 *   get:
 *     summary: Lấy thống kê sử dụng AI
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/ai/stats', adminController.getAiStats);

/**
 * @swagger
 * /api/admin/ai/cache:
 *   delete:
 *     summary: Xóa cache AI
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 */
router.delete('/ai/cache', adminController.clearAiCache);

export const adminRoutes = router;
