import { Router } from 'express';
import { bioController } from '../controllers/bio.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: BioPages
 *   description: Quản lý trang Bio
 */

/**
 * @swagger
 * /api/bio:
 *   post:
 *     summary: Tạo hoặc cập nhật trang Bio (Upsert)
 *     tags: [BioPages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Lưu trang Bio thành công
 */
router.post('/', bioController.createOrUpdateBio);

/**
 * @swagger
 * /api/bio/user:
 *   get:
 *     summary: Lấy trang Bio của user đang đăng nhập để chỉnh sửa (Owner Panel)
 *     tags: [BioPages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về thông tin trang Bio
 */
router.get('/user', bioController.getBioForUser);

/**
 * @swagger
 * /api/bio/{username}:
 *   get:
 *     summary: Lấy thông tin trang Bio công khai bằng username
 *     tags: [BioPages]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lấy thành công
 *       404:
 *         description: Không tìm thấy trang
 */
router.get('/:username', bioController.getBioByUsername);

/**
 * @swagger
 * /api/bio:
 *   delete:
 *     summary: Xóa trang Bio của user đang đăng nhập
 *     tags: [BioPages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete('/', bioController.deleteBio);

export const bioRoutes = router;
