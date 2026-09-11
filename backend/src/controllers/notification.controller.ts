import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendError, sendSuccess } from '../utils/response';

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { limit = 30 } = req.query as any;

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: user.id },
        include: {
          task: {
            select: { id: true, taskNumber: true, title: true, status: true },
          },
          project: {
            select: { id: true, title: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit, 10) || 30,
      }),
      prisma.notification.count({
        where: { userId: user.id, read: false },
      }),
    ]);

    sendSuccess(res, { notifications, unreadCount });
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch notifications', 500);
  }
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.userId !== user.id) {
      sendError(res, 'Notification not found', 404, 'NOT_FOUND');
      return;
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, read: false },
    });

    sendSuccess(res, { notification: updated, unreadCount }, 'Notification marked as read');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update notification', 500);
  }
};

export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;

    await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });

    sendSuccess(res, { unreadCount: 0 }, 'All notifications marked as read');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to mark all notifications as read', 500);
  }
};
