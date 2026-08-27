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
 *     summary: Tạo trang Bio mới
 *     tags: [BioPages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               slug:
 *                 type: string
 *               title:
 *                 type: string
 *               blocks:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Tạo trang Bio thành công
 */
router.post('/', bioController.createBio);

/**
 * @swagger
 * /api/bio/user:
 *   get:
 *     summary: Lấy trang Bio của user đang đăng nhập
 *     tags: [BioPages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về thông tin trang Bio của user
 */
router.get('/user', bioController.getBioForUser);

/**
 * @swagger
 * /api/bio/{slug}:
 *   get:
 *     summary: Lấy thông tin trang Bio công khai bằng slug
 *     tags: [BioPages]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lấy thành công
 *       404:
 *         description: Không tìm thấy trang
 */
router.get('/:slug', bioController.getBioBySlug);

/**
 * @swagger
 * /api/bio/{id}:
 *   put:
 *     summary: Cập nhật trang Bio
 *     tags: [BioPages]
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
 *               blocks:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put('/:id', bioController.updateBio);

/**
 * @swagger
 * /api/bio/{id}:
 *   delete:
 *     summary: Xóa trang Bio
 *     tags: [BioPages]
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
router.delete('/:id', bioController.deleteBio);

export const bioRoutes = router;
