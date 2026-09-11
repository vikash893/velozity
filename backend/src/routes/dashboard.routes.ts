import { Router } from 'express';
import { Role } from '@prisma/client';
import {
  getAdminDashboard,
  getDeveloperDashboard,
  getPMDashboard,
} from '../controllers/dashboard.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/admin', requireRole(Role.ADMIN), getAdminDashboard);
router.get('/pm', requireRole(Role.ADMIN, Role.PROJECT_MANAGER), getPMDashboard);
router.get('/developer', requireRole(Role.ADMIN, Role.PROJECT_MANAGER, Role.DEVELOPER), getDeveloperDashboard);

export default router;
