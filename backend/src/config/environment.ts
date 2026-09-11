import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/velozity_db?schema=public',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'velozity_super_secret_access_jwt_key_2026_x89f',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'velozity_super_secret_refresh_jwt_key_2026_k72m',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};
