import { Router } from 'express';
import { z } from 'zod';
import { getCurrentUser, login, logout, refreshToken } from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';

const router = Router();

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

router.post('/login', validate({ body: loginSchema }), login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get('/me', authenticateToken, getCurrentUser);

export default router;
