import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { sendError, sendSuccess } from '../utils/response';
import { config } from '../config/environment';
import { Role } from '@prisma/client';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role = Role.DEVELOPER } = req.body;

    if (!name || !email || !password) {
      sendError(res, 'Name, email and password are required', 400, 'MISSING_FIELDS');
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      sendError(res, 'An account with this email address already exists', 400, 'EMAIL_EXISTS');
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const assignedRole = Object.values(Role).includes(role) ? role : Role.DEVELOPER;

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: passwordHash,
        role: assignedRole,
      },
    });

    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken({ id: user.id, role: user.role });

    // Set Refresh Token in HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: config.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: false,
      secure: config.NODE_ENV === 'production',
      sameSite: config.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });

    sendSuccess(
      res,
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        accessToken,
      },
      'Account registered successfully',
      201
    );
  } catch (error: any) {
    sendError(res, error.message || 'Registration failed', 500);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      sendError(res, 'Email and password are required', 400, 'MISSING_CREDENTIALS');
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      sendError(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      sendError(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
      return;
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken({ id: user.id, role: user.role });

    // Set Refresh Token in HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: config.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    // Also set accessToken in cookie for flexible browser/WebSocket consumption
    res.cookie('accessToken', accessToken, {
      httpOnly: false,
      secure: config.NODE_ENV === 'production',
      sameSite: config.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 15 * 60 * 1000, // 15 mins
      path: '/',
    });

    sendSuccess(
      res,
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        accessToken,
      },
      'Login successful'
    );
  } catch (error: any) {
    sendError(res, error.message || 'Login failed', 500);
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      sendError(res, 'Refresh token missing', 401, 'REFRESH_TOKEN_MISSING');
      return;
    }

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch (err) {
      res.clearCookie('refreshToken', { path: '/' });
      sendError(res, 'Invalid or expired refresh token', 401, 'REFRESH_TOKEN_EXPIRED');
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      res.clearCookie('refreshToken', { path: '/' });
      sendError(res, 'User no longer exists', 401, 'USER_NOT_FOUND');
      return;
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const newAccessToken = signAccessToken(tokenPayload);
    const newRefreshToken = signRefreshToken({ id: user.id, role: user.role });

    // Rotate refresh token
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: config.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.cookie('accessToken', newAccessToken, {
      httpOnly: false,
      secure: config.NODE_ENV === 'production',
      sameSite: config.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });

    sendSuccess(
      res,
      {
        accessToken: newAccessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      'Token refreshed successfully'
    );
  } catch (error: any) {
    sendError(res, error.message || 'Failed to refresh token', 500);
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie('refreshToken', { path: '/' });
  res.clearCookie('accessToken', { path: '/' });
  sendSuccess(res, null, 'Logged out successfully');
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      sendError(res, 'User not found', 404, 'USER_NOT_FOUND');
      return;
    }

    sendSuccess(res, { user });
  } catch (error: any) {
    sendError(res, error.message || 'Failed to retrieve current user', 500);
  }
};
