import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { sendError, sendSuccess } from '../utils/response';
import { Role } from '@prisma/client';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.query as any;
    const where: any = {};
    if (role) {
      where.role = role;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    sendSuccess(res, { users });
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch users', 500);
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role = Role.DEVELOPER } = req.body;

    if (!name || !email || !password) {
      sendError(res, 'Name, email, and password are required', 400, 'MISSING_FIELDS');
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
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    sendSuccess(res, { user }, 'Team member created successfully', 201);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to create user', 500);
  }
};

export const getClients = async (req: Request, res: Response): Promise<void> => {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { name: 'asc' },
    });

    sendSuccess(res, { clients });
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch clients', 500);
  }
};

export const createClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, company } = req.body;
    if (!name || !email || !company) {
      sendError(res, 'Name, email, and company are required', 400, 'MISSING_FIELDS');
      return;
    }

    const client = await prisma.client.create({
      data: { name, email, company },
    });

    sendSuccess(res, { client }, 'Client created successfully', 201);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to create client', 500);
  }
};
