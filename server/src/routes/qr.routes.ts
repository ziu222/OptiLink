import { Router } from 'express';
import { qrController } from '../controllers/qr.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import {
  createQrSchema,
  downloadQrQuerySchema,
} from '../validators/qr.validator.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: QRCode
 *   description: Tạo và quản lý mã QR tùy biến
 */

/**
 * @swagger
 * /api/qr/generate:
 *   post:
 *     summary: Tạo mã QR mới và lưu cấu hình
 *     tags: [QRCode]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetUrl
 *             properties:
 *               targetUrl:
 *                 type: string
 *                 example: "https://optilink.io"
 *               title:
 *                 type: string
 *                 example: "My Campaign QR"
 *               linkId:
 *                 type: string
 *                 example: "64c9f1a2e4b0a1a2b3c4d5e6"
 *               config:
 *                 type: object
 *                 properties:
 *                   fgColor:
 *                     type: string
 *                     example: "#1a1a2e"
 *                   bgColor:
 *                     type: string
 *                     example: "#ffffff"
 *                   logoUrl:
 *                     type: string
 *                     example: "https://cloudinary.com/logo.png"
 *                   eyeType:
 *                     type: string
 *                     enum: [square, rounded, dot]
 *                   dotType:
 *                     type: string
 *                     enum: [square, rounded, dots]
 *                   size:
 *                     type: number
 *                     example: 512
 *                   errorCorrectionLevel:
 *                     type: string
 *                     enum: [L, M, Q, H]
 *     responses:
 *       201:
 *         description: Tạo QR code thành công
 *       403:
 *         description: Đạt giới hạn số lượng QR code (FREE tier)
 *       422:
 *         description: Dữ liệu không hợp lệ
 */
router.post(
  '/generate',
  authenticate,
  validate(createQrSchema, 'body'),
  qrController.generateQr
);

/**
 * @swagger
 * /api/qr/list:
 *   get:
 *     summary: Lấy danh sách mã QR của user đang đăng nhập
 *     tags: [QRCode]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về danh sách mã QR
 */
router.get('/list', authenticate, qrController.getQrList);

/**
 * @swagger
 * /api/qr/{id}:
 *   get:
 *     summary: Lấy chi tiết một mã QR
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
 *         description: Chi tiết mã QR
 *       404:
 *         description: Không tìm thấy mã QR
 */
router.get('/:id', authenticate, qrController.getQrById);

/**
 * @swagger
 * /api/qr/{id}/download:
 *   get:
 *     summary: Tải xuống file mã QR chất lượng cao (PNG hoặc SVG)
 *     tags: [QRCode]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [png, svg]
 *           default: png
 *       - in: query
 *         name: size
 *         schema:
 *           type: number
 *           default: 512
 *     responses:
 *       200:
 *         description: Binary file stream của mã QR
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *           image/svg+xml:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Không tìm thấy mã QR
 */
router.get(
  '/:id/download',
  authenticate,
  validate(downloadQrQuerySchema, 'query'),
  qrController.downloadQr
);

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
 *       404:
 *         description: Không tìm thấy mã QR
 */
router.delete('/:id', authenticate, qrController.deleteQr);

export const qrRoutes = router;
