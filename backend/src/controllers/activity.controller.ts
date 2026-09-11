import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendError, sendSuccess } from '../utils/response';

export const getRecentActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { limit = 20, projectId } = req.query as any;
    const take = Math.min(parseInt(limit, 10) || 20, 100);

    const where: any = {};

    if (user.role === 'DEVELOPER') {
      // Developer only sees activities related to tasks assigned to them
      where.task = {
        assignedToId: user.id,
      };
    } else if (user.role === 'PROJECT_MANAGER') {
      // PM only sees activities from their own projects
      where.project = {
        pmId: user.id,
      };
    }

    if (projectId) {
      if (user.role === 'PROJECT_MANAGER') {
        const proj = await prisma.project.findUnique({
          where: { id: projectId },
          select: { pmId: true },
        });
        if (!proj || proj.pmId !== user.id) {
          sendError(res, 'Unauthorized to view activities for this project', 403, 'FORBIDDEN');
          return;
        }
      }
      where.projectId = projectId;
    }

    const activities = await prisma.activityLog.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        task: {
          select: { id: true, taskNumber: true, title: true, status: true, priority: true },
        },
        project: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take,
    });

    sendSuccess(res, { activities });
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch recent activities', 500);
  }
};
