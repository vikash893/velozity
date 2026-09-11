import { Router } from 'express';
import { Role } from '@prisma/client';
import { z } from 'zod';
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  updateProject,
} from '../controllers/project.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validation.middleware';

const router = Router();

const createProjectSchema = z.object({
  title: z.string().min(1, 'Project title is required'),
  description: z.string().optional(),
  clientId: z.string().uuid('Valid Client ID is required'),
  pmId: z.string().uuid().optional(),
});

const updateProjectSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  clientId: z.string().uuid().optional(),
  pmId: z.string().uuid().optional(),
});

router.use(authenticateToken);

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', requireRole(Role.ADMIN, Role.PROJECT_MANAGER), validate({ body: createProjectSchema }), createProject);
router.patch('/:id', requireRole(Role.ADMIN, Role.PROJECT_MANAGER), validate({ body: updateProjectSchema }), updateProject);
router.delete('/:id', requireRole(Role.ADMIN, Role.PROJECT_MANAGER), deleteProject);

export default router;
