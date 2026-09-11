import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { config } from '../config/environment';

export interface TokenPayload {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface RefreshTokenPayload {
  id: string;
  role: Role;
}

export const signAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.JWT_ACCESS_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

export const signRefreshToken = (payload: RefreshTokenPayload): string => {
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.JWT_ACCESS_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, config.JWT_REFRESH_SECRET) as RefreshTokenPayload;
};
