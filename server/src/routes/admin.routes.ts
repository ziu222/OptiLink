import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  banUserSchema,
  listAdminLinksQuerySchema,
  listUsersQuerySchema,
  updateAdminLinkSchema,
  updateUserSchema,
} from '../validators/admin.validators.js';

const router = Router();

// Every admin route requires a valid, authenticated admin — applied per-route
// below (matching the rest of the codebase's routing convention) rather than
// once at the router mount in app.ts.
const admin = [authenticate, requireAdmin];

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
router.get('/stats', ...admin, asyncHandler(adminController.getGlobalStats));

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
router.get('/stats/growth', ...admin, asyncHandler(adminController.getGrowthStats));

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
router.get(
  '/users',
  ...admin,
  validate(listUsersQuerySchema, 'query'),
  asyncHandler(adminController.getUsers),
);

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
router.get('/users/:id', ...admin, asyncHandler(adminController.getUserById));

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
router.put(
  '/users/:id',
  ...admin,
  validate(updateUserSchema),
  asyncHandler(adminController.updateUser),
);

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
router.put(
  '/users/:id/ban',
  ...admin,
  validate(banUserSchema),
  asyncHandler(adminController.banUser),
);

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
router.delete('/users/:id', ...admin, asyncHandler(adminController.deleteUser));

// ── Links ────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/admin/links:
 *   get:
 *     summary: Lấy danh sách liên kết trên toàn hệ thống
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get(
  '/links',
  ...admin,
  validate(listAdminLinksQuerySchema, 'query'),
  asyncHandler(adminController.getLinks),
);

/**
 * @swagger
 * /api/admin/links/{id}:
 *   get:
 *     summary: Xem chi tiết một liên kết
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
router.get('/links/:id', ...admin, asyncHandler(adminController.getLinkById));

/**
 * @swagger
 * /api/admin/links/{id}:
 *   put:
 *     summary: Cập nhật thông tin liên kết (tiêu đề, trạng thái, chuyển hướng, mật khẩu, hết hạn)
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
router.put(
  '/links/:id',
  ...admin,
  validate(updateAdminLinkSchema),
  asyncHandler(adminController.updateLink),
);

/**
 * @swagger
 * /api/admin/links/{id}:
 *   delete:
 *     summary: Xóa vĩnh viễn một liên kết
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
router.delete('/links/:id', ...admin, asyncHandler(adminController.deleteLink));

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
router.get('/content', ...admin, asyncHandler(adminController.getContentList));

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
router.delete('/content/:type/:id', ...admin, asyncHandler(adminController.deleteContent));

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
router.get('/ai/stats', ...admin, asyncHandler(adminController.getAiStats));

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
router.delete('/ai/cache', ...admin, asyncHandler(adminController.clearAiCache));

export const adminRoutes = router;
