import { Router } from 'express';
import { getRecentActivities } from '../controllers/activity.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);
router.get('/recent', getRecentActivities);

export default router;
