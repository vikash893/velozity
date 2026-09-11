import { Router } from 'express';
import authRoutes from './auth.routes';
import projectRoutes from './project.routes';
import taskRoutes from './task.routes';
import activityRoutes from './activity.routes';
import notificationRoutes from './notification.routes';
import dashboardRoutes from './dashboard.routes';
import userRoutes from './user.routes';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/projects', projectRoutes);
apiRouter.use('/tasks', taskRoutes);
apiRouter.use('/activity', activityRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/users', userRoutes);

export default apiRouter;
