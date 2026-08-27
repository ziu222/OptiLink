import { Router } from 'express';
import { qrController } from '../controllers/qr.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: QRCode
 *   description: Tạo và quản lý mã QR
 */

/**
 * @swagger
 * /api/qr/generate:
 *   post:
 *     summary: Tạo mã QR mới
 *     tags: [QRCode]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               linkId:
 *                 type: string
 *               style:
 *                 type: object
 *     responses:
 *       201:
 *         description: Tạo QR code thành công
 */
router.post('/generate', qrController.generateQr);

/**
 * @swagger
 * /api/qr/list:
 *   get:
 *     summary: Lấy danh sách mã QR của user
 *     tags: [QRCode]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về danh sách mã QR
 */
router.get('/list', qrController.getQrList);

/**
 * @swagger
 * /api/qr/{id}/download:
 *   get:
 *     summary: Tải xuống mã QR
 *     tags: [QRCode]
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
 *         description: Trả về URL để download QR
 */
router.get('/:id/download', qrController.downloadQr);

/**
 * @swagger
 * /api/qr/{id}:
 *   delete:
 *     summary: Xóa mã QR
 *     tags: [QRCode]
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
 *         description: Xóa QR thành công
 */
router.delete('/:id', qrController.deleteQr);

export const qrRoutes = router;
