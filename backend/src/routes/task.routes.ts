import { Router } from 'express';
import { Role, TaskPriority, TaskStatus } from '@prisma/client';
import { z } from 'zod';
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask,
  updateTaskStatus,
} from '../controllers/task.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validation.middleware';

const router = Router();

const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  projectId: z.string().uuid('Valid Project ID is required'),
  assignedToId: z.string().uuid().optional().nullable(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.string().datetime().optional().nullable(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  assignedToId: z.string().uuid().optional().nullable(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.string().datetime().optional().nullable(),
});

const updateStatusSchema = z.object({
  status: z.nativeEnum(TaskStatus, {
    errorMap: () => ({ message: 'Status must be TO_DO, IN_PROGRESS, IN_REVIEW, or DONE' }),
  }),
});

router.use(authenticateToken);

router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', requireRole(Role.ADMIN, Role.PROJECT_MANAGER), validate({ body: createTaskSchema }), createTask);
router.patch('/:id', requireRole(Role.ADMIN, Role.PROJECT_MANAGER), validate({ body: updateTaskSchema }), updateTask);
router.patch('/:id/status', validate({ body: updateStatusSchema }), updateTaskStatus);
router.delete('/:id', requireRole(Role.ADMIN, Role.PROJECT_MANAGER), deleteTask);

export default router;
