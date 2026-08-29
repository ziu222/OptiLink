import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || 'dev_access_secret_change_me';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'dev_refresh_secret_change_me';
const ACCESS_TTL = process.env.ACCESS_TOKEN_TTL || '15m';
const REFRESH_TTL = process.env.REFRESH_TOKEN_TTL || '7d';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: 'user' | 'admin';
}

export interface RefreshTokenPayload {
  sub: string;
  /** Unique per issued token so rotation always produces a distinct string. */
  jti: string;
}

export const signAccessToken = (payload: AccessTokenPayload): string =>
  jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_TTL } as jwt.SignOptions);

export const signRefreshToken = (payload: { sub: string }): string =>
  jwt.sign({ ...payload, jti: randomUUID() }, REFRESH_SECRET, {
    expiresIn: REFRESH_TTL,
  } as jwt.SignOptions);

/** Throws jsonwebtoken's JsonWebTokenError / TokenExpiredError, which the global errorHandler maps to 401. */
export const verifyAccessToken = (token: string): AccessTokenPayload =>
  jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;

export const verifyRefreshToken = (token: string): RefreshTokenPayload =>
  jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;
