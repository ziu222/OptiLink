import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
} from '../validators/auth.validators.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API quản lý xác thực và người dùng
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, password, confirmPassword]
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "Nguyen Van A"
 *               email:
 *                 type: string
 *                 example: "nguyenvana@example.com"
 *               password:
 *                 type: string
 *                 example: "StrongPass123!"
 *               confirmPassword:
 *                 type: string
 *                 example: "StrongPass123!"
 *     responses:
 *       201:
 *         description: Đăng ký thành công. Trả về accessToken + user; refresh token đặt trong httpOnly cookie.
 *       409:
 *         description: Email đã tồn tại
 *       422:
 *         description: Dữ liệu không hợp lệ
 */
router.post('/register', authLimiter, validate(registerSchema), asyncHandler(authController.register));

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Xác minh email bằng mã OTP (chưa triển khai - mock)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "nguyenvana@example.com"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email đã xác minh
 */
router.post('/verify-email', asyncHandler(authController.verifyEmail));

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "nguyenvana@example.com"
 *               password:
 *                 type: string
 *                 example: "StrongPass123!"
 *     responses:
 *       200:
 *         description: Đăng nhập thành công. Trả về accessToken + user; refresh token đặt trong httpOnly cookie.
 *       401:
 *         description: Sai email hoặc mật khẩu
 */
router.post('/login', authLimiter, validate(loginSchema), asyncHandler(authController.login));

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Cấp lại access token bằng refresh token (đọc từ httpOnly cookie)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Trả về accessToken mới, xoay vòng refresh token cookie
 *       401:
 *         description: Refresh token thiếu hoặc không hợp lệ
 */
router.post('/refresh', asyncHandler(authController.refresh));

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Đăng xuất tài khoản (thu hồi refresh token)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 *       401:
 *         description: Chưa đăng nhập
 */
router.post('/logout', authenticate, asyncHandler(authController.logout));

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Lấy thông tin user hiện tại
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy thông tin thành công
 *       401:
 *         description: Chưa đăng nhập
 */
router.get('/me', authenticate, asyncHandler(authController.getMe));

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Cập nhật thông tin profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               avatarUrl:
 *                 type: string
 *               timezone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       401:
 *         description: Chưa đăng nhập
 */
router.put('/profile', authenticate, validate(updateProfileSchema), asyncHandler(authController.updateProfile));

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Yêu cầu đặt lại mật khẩu (chưa triển khai - mock)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đã gửi email reset
 */
router.post('/forgot-password', asyncHandler(authController.forgotPassword));

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Đặt lại mật khẩu bằng token (chưa triển khai - mock)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mật khẩu đã đặt lại thành công
 */
router.post('/reset-password', asyncHandler(authController.resetPassword));

export const authRoutes = router;
