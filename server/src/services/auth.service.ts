import { createHash } from 'node:crypto';
import bcrypt from 'bcryptjs';
import User, { IUser } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  RefreshTokenPayload,
} from '../utils/jwt.js';

const hashToken = (token: string): string => createHash('sha256').update(token).digest('hex');

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private issueTokens(user: IUser): AuthTokens {
    return {
      accessToken: signAccessToken({ sub: user.id, email: user.email, role: user.role }),
      refreshToken: signRefreshToken({ sub: user.id }),
    };
  }

  private async persistRefreshToken(user: IUser, refreshToken: string): Promise<void> {
    user.refreshTokenHash = hashToken(refreshToken);
    await user.save();
  }

  async register(input: {
    fullName: string;
    email: string;
    password: string;
  }): Promise<AuthTokens & { user: IUser }> {
    const existing = await User.findOne({ email: input.email });
    if (existing) {
      throw AppError.conflict('email already exists', 'DUPLICATE_KEY');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await User.create({
      fullName: input.fullName,
      email: input.email,
      passwordHash,
    });

    const tokens = this.issueTokens(user);
    await this.persistRefreshToken(user, tokens.refreshToken);
    return { user, ...tokens };
  }

  async login(input: { email: string; password: string }): Promise<AuthTokens & { user: IUser }> {
    const user = await User.findOne({ email: input.email }).select('+passwordHash +refreshTokenHash');
    if (!user || !(await user.comparePassword(input.password))) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const tokens = this.issueTokens(user);
    await this.persistRefreshToken(user, tokens.refreshToken);
    return { user, ...tokens };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload: RefreshTokenPayload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw AppError.unauthorized('Invalid refresh token', 'INVALID_TOKEN');
    }

    const user = await User.findById(payload.sub).select('+refreshTokenHash');
    if (!user || !user.refreshTokenHash || user.refreshTokenHash !== hashToken(refreshToken)) {
      throw AppError.unauthorized('Invalid refresh token', 'INVALID_TOKEN');
    }

    const tokens = this.issueTokens(user);
    await this.persistRefreshToken(user, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { refreshTokenHash: null });
  }

  async getMe(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }
    return user;
  }

  async updateProfile(
    userId: string,
    input: { fullName?: string; avatarUrl?: string; timezone?: string }
  ): Promise<IUser> {
    const update: Record<string, unknown> = {};
    if (input.fullName !== undefined) update.fullName = input.fullName;
    if (input.avatarUrl !== undefined) update.avatarUrl = input.avatarUrl;
    if (input.timezone !== undefined) update.timezone = input.timezone;

    const user = await User.findByIdAndUpdate(userId, update, { new: true, runValidators: true });
    if (!user) {
      throw AppError.notFound('User not found');
    }
    return user;
  }
}

export const authService = new AuthService();
