import { Request, Response } from 'express';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công (Mock)',
      data: {
        user: {
          id: 'user_123',
          email: req.body.email || 'mock@example.com',
          fullName: req.body.fullName || 'Mock User',
          role: 'user',
        }
      }
    });
  }

  async verifyEmail(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Email xác minh thành công (Mock)'
    });
  }

  async login(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công (Mock)',
      data: {
        accessToken: 'mock_jwt_access_token_123',
        user: {
          id: 'user_123',
          email: req.body.email || 'mock@example.com',
          role: 'user'
        }
      }
    });
  }

  async refresh(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      data: {
        accessToken: 'mock_new_jwt_access_token_456'
      }
    });
  }

  async logout(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Đăng xuất thành công (Mock)'
    });
  }

  async getMe(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: 'user_123',
          email: 'mock@example.com',
          fullName: 'Mock User',
          role: 'user'
        }
      }
    });
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Cập nhật thành công (Mock)',
      data: {
        user: {
          ...req.body
        }
      }
    });
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Đã gửi email reset (Mock)'
    });
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Mật khẩu đã được đặt lại (Mock)'
    });
  }
}

export const authController = new AuthController();
