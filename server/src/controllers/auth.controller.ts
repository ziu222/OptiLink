import { Request, Response, CookieOptions } from 'express';
import { authService } from '../services/auth.service.js';
import { AppError } from '../utils/AppError.js';

const REFRESH_COOKIE = 'refreshToken';
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

const refreshCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/api/auth',
  maxAge: REFRESH_COOKIE_MAX_AGE,
});

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const { fullName, email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.register({
      fullName,
      email,
      password,
    });

    res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { accessToken, user },
    });
  }

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login({ email, password });

    res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { accessToken, user },
    });
  }

  async refresh(req: Request, res: Response): Promise<void> {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) {
      throw AppError.unauthorized('Missing refresh token', 'INVALID_TOKEN');
    }

    const { accessToken, refreshToken } = await authService.refresh(token);
    res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
    res.status(200).json({
      success: true,
      data: { accessToken },
    });
  }

  async logout(req: Request, res: Response): Promise<void> {
    await authService.logout(req.user!.id);
    res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  }

  async getMe(req: Request, res: Response): Promise<void> {
    const user = await authService.getMe(req.user!.id);
    res.status(200).json({
      success: true,
      data: { user },
    });
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    const user = await authService.updateProfile(req.user!.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Profile updated',
      data: { user },
    });
  }

  // ── Email flows deferred — still mock (see plan) ────────────────

  async verifyEmail(_req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Email xác minh thành công (Mock)',
    });
  }

  async forgotPassword(_req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Đã gửi email reset (Mock)',
    });
  }

  async resetPassword(_req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Mật khẩu đã được đặt lại (Mock)',
    });
  }
}

export const authController = new AuthController();
