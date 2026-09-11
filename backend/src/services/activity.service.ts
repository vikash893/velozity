import { prisma } from '../config/prisma';
import { broadcastActivityEvent } from './socket.service';

export interface CreateActivityParams {
  taskId?: string;
  projectId?: string;
  userId: string;
  userName: string;
  action: 'STATUS_CHANGE' | 'TASK_CREATED' | 'TASK_ASSIGNED' | 'TASK_OVERDUE' | 'PROJECT_CREATED';
  oldStatus?: string;
  newStatus?: string;
  taskTitle?: string;
  taskNumber?: number;
  assignedToName?: string;
  customMessage?: string;
}

const formatStatus = (status: string) => {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const logActivity = async (params: CreateActivityParams) => {
  try {
    let message = params.customMessage || '';

    if (!message) {
      if (params.action === 'STATUS_CHANGE' && params.oldStatus && params.newStatus) {
        message = `${params.userName} moved Task #${params.taskNumber || ''} from ${formatStatus(params.oldStatus)} → ${formatStatus(params.newStatus)}`;
      } else if (params.action === 'TASK_CREATED') {
        message = `${params.userName} created Task #${params.taskNumber || ''} "${params.taskTitle || ''}"`;
      } else if (params.action === 'TASK_ASSIGNED') {
        message = `${params.userName} assigned Task #${params.taskNumber || ''} to ${params.assignedToName || 'team member'}`;
      } else if (params.action === 'TASK_OVERDUE') {
        message = `System flagged Task #${params.taskNumber || ''} "${params.taskTitle || ''}" as Overdue`;
      } else if (params.action === 'PROJECT_CREATED') {
        message = `${params.userName} created a new project`;
      } else {
        message = `${params.userName} performed ${params.action}`;
      }
    }

    // Determine project PM and task assigned developer for role-filtered broadcast
    let pmId: string | null = null;
    let assignedToId: string | null = null;

    if (params.projectId) {
      const proj = await prisma.project.findUnique({
        where: { id: params.projectId },
        select: { pmId: true },
      });
      if (proj) pmId = proj.pmId;
    }

    if (params.taskId) {
      const task = await prisma.task.findUnique({
        where: { id: params.taskId },
        select: { assignedToId: true, projectId: true, project: { select: { pmId: true } } },
      });
      if (task) {
        assignedToId = task.assignedToId;
        if (!pmId) pmId = task.project.pmId;
      }
    }

    const activity = await prisma.activityLog.create({
      data: {
        taskId: params.taskId,
        projectId: params.projectId,
        userId: params.userId,
        action: params.action,
        message,
        details: {
          oldStatus: params.oldStatus,
          newStatus: params.newStatus,
          taskTitle: params.taskTitle,
          taskNumber: params.taskNumber,
          userName: params.userName,
          assignedToName: params.assignedToName,
        },
      },
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
    });

    // Real-time broadcast
    broadcastActivityEvent({
      activity,
      projectId: params.projectId,
      pmId,
      assignedToId,
    });

    return activity;
  } catch (error) {
    console.error('Failed to log activity event:', error);
    return null;
  }
};
