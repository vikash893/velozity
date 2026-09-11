import { Router } from 'express';
import { Role } from '@prisma/client';
import { z } from 'zod';
import { getClients, createClient, getUsers, createUser } from '../controllers/user.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validation.middleware';

const router = Router();

const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.nativeEnum(Role).optional(),
});

router.use(authenticateToken);

router.get('/', getUsers);
router.post('/', requireRole(Role.ADMIN), validate({ body: createUserSchema }), createUser);
router.get('/clients', getClients);
router.post('/clients', requireRole(Role.ADMIN, Role.PROJECT_MANAGER), createClient);

export default router;
