import { prisma } from '../config/prisma';
import { sendLiveNotification } from './socket.service';

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: 'TASK_ASSIGNED' | 'TASK_IN_REVIEW' | 'TASK_OVERDUE' | 'INFO';
  taskId?: string;
  projectId?: string;
}

export const createNotification = async (params: CreateNotificationParams) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type || 'INFO',
        taskId: params.taskId,
        projectId: params.projectId,
      },
      include: {
        task: {
          select: { id: true, taskNumber: true, title: true },
        },
        project: {
          select: { id: true, title: true },
        },
      },
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId: params.userId,
        read: false,
      },
    });

    sendLiveNotification(params.userId, notification, unreadCount);

    return notification;
  } catch (error) {
    console.error('Failed to create and dispatch notification:', error);
    return null;
  }
};
