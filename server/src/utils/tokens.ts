import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { CookieOptions } from 'express';
import { env } from '../config/env';

export interface TokenPayload {
  userId: string;
}

export const ACCESS_TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
export const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: '15m'
  });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId, jti: crypto.randomUUID() }, env.JWT_REFRESH_SECRET, {
    expiresIn: '7d'
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const generateRandomToken = (bytes = 32): string => {
  return crypto.randomBytes(bytes).toString('hex');
};

export const getAccessTokenCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: ACCESS_TOKEN_EXPIRY_MS,
  path: '/'
});

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: REFRESH_TOKEN_EXPIRY_MS,
  path: '/'
});
