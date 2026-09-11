import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendError, sendSuccess } from '../utils/response';
import { getOnlineUserCount } from '../services/socket.service';

export const getAdminDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalProjects,
      totalUsers,
      totalClients,
      tasks,
      overdueTasksCount,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.user.count(),
      prisma.client.count(),
      prisma.task.findMany({
        select: { status: true, priority: true, isOverdue: true },
      }),
      prisma.task.count({
        where: { isOverdue: true },
      }),
    ]);

    const tasksByStatus = {
      TO_DO: tasks.filter((t) => t.status === 'TO_DO').length,
      IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      IN_REVIEW: tasks.filter((t) => t.status === 'IN_REVIEW').length,
      DONE: tasks.filter((t) => t.status === 'DONE').length,
    };

    const tasksByPriority = {
      LOW: tasks.filter((t) => t.priority === 'LOW').length,
      MEDIUM: tasks.filter((t) => t.priority === 'MEDIUM').length,
      HIGH: tasks.filter((t) => t.priority === 'HIGH').length,
      CRITICAL: tasks.filter((t) => t.priority === 'CRITICAL').length,
    };

    const activeUsersOnline = getOnlineUserCount();

    sendSuccess(res, {
      stats: {
        totalProjects,
        totalUsers,
        totalClients,
        totalTasks: tasks.length,
        overdueTasksCount,
        activeUsersOnline,
        tasksByStatus,
        tasksByPriority,
      },
    });
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch admin dashboard', 500);
  }
};

export const getPMDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const now = new Date();
    const endOfWeek = new Date();
    endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);

    const [projects, tasks, upcomingTasks] = await Promise.all([
      prisma.project.findMany({
        where: { pmId: user.id },
        include: {
          client: true,
          _count: { select: { tasks: true } },
        },
      }),
      prisma.task.findMany({
        where: {
          project: { pmId: user.id },
        },
        select: { status: true, priority: true, isOverdue: true },
      }),
      prisma.task.findMany({
        where: {
          project: { pmId: user.id },
          status: { not: 'DONE' },
          dueDate: {
            gte: now,
            lte: endOfWeek,
          },
        },
        include: {
          project: { select: { title: true } },
          assignedTo: { select: { id: true, name: true, email: true } },
        },
        orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }],
      }),
    ]);

    const tasksByPriority = {
      LOW: tasks.filter((t) => t.priority === 'LOW').length,
      MEDIUM: tasks.filter((t) => t.priority === 'MEDIUM').length,
      HIGH: tasks.filter((t) => t.priority === 'HIGH').length,
      CRITICAL: tasks.filter((t) => t.priority === 'CRITICAL').length,
    };

    const tasksByStatus = {
      TO_DO: tasks.filter((t) => t.status === 'TO_DO').length,
      IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      IN_REVIEW: tasks.filter((t) => t.status === 'IN_REVIEW').length,
      DONE: tasks.filter((t) => t.status === 'DONE').length,
    };

    sendSuccess(res, {
      stats: {
        totalProjects: projects.length,
        totalTasks: tasks.length,
        overdueCount: tasks.filter((t) => t.isOverdue).length,
        tasksByPriority,
        tasksByStatus,
        projectsSummary: projects,
        upcomingTasksDueThisWeek: upcomingTasks,
      },
    });
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch PM dashboard', 500);
  }
};

export const getDeveloperDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;

    const tasks = await prisma.task.findMany({
      where: {
        assignedToId: user.id,
      },
      include: {
        project: {
          select: { id: true, title: true, client: { select: { name: true, company: true } } },
        },
      },
      orderBy: [
        { priority: 'desc' }, // CRITICAL -> HIGH -> MEDIUM -> LOW
        { dueDate: 'asc' },   // Closest due date first
      ],
    });

    const statusCounts = {
      TO_DO: tasks.filter((t) => t.status === 'TO_DO').length,
      IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      IN_REVIEW: tasks.filter((t) => t.status === 'IN_REVIEW').length,
      DONE: tasks.filter((t) => t.status === 'DONE').length,
      OVERDUE: tasks.filter((t) => t.isOverdue).length,
    };

    sendSuccess(res, {
      tasks,
      stats: {
        totalAssigned: tasks.length,
        ...statusCounts,
      },
    });
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch developer dashboard', 500);
  }
};
