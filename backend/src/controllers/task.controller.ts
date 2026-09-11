import { Request, Response } from 'express';
import { TaskPriority, TaskStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { sendError, sendSuccess } from '../utils/response';
import { logActivity } from '../services/activity.service';
import { createNotification } from '../services/notification.service';
import { broadcastTaskUpdate } from '../services/socket.service';

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const {
      projectId,
      status,
      priority,
      assignedToId,
      isOverdue,
      search,
      dueDateStart,
      dueDateEnd,
      sortBy = 'priority',
      sortOrder = 'desc',
    } = req.query as any;

    const where: any = {};

    // Strict Role Level Filter:
    if (user.role === 'DEVELOPER') {
      // Developer can ONLY EVER see tasks assigned to them
      where.assignedToId = user.id;
    } else if (user.role === 'PROJECT_MANAGER') {
      // PM can only see tasks from projects they manage
      where.project = {
        pmId: user.id,
      };
      if (assignedToId) {
        where.assignedToId = assignedToId;
      }
    } else if (user.role === 'ADMIN') {
      if (assignedToId) {
        where.assignedToId = assignedToId;
      }
    }

    if (projectId) {
      // If PM, check project ownership
      if (user.role === 'PROJECT_MANAGER') {
        const proj = await prisma.project.findUnique({
          where: { id: projectId },
          select: { pmId: true },
        });
        if (!proj || proj.pmId !== user.id) {
          sendError(res, 'You do not have permission to view tasks for this project', 403, 'FORBIDDEN');
          return;
        }
      }
      where.projectId = projectId;
    }

    if (status && Object.values(TaskStatus).includes(status)) {
      where.status = status;
    }

    if (priority && Object.values(TaskPriority).includes(priority)) {
      where.priority = priority;
    }

    if (isOverdue !== undefined) {
      where.isOverdue = isOverdue === 'true' || isOverdue === true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (dueDateStart || dueDateEnd) {
      where.dueDate = {};
      if (dueDateStart) {
        where.dueDate.gte = new Date(dueDateStart);
      }
      if (dueDateEnd) {
        where.dueDate.lte = new Date(dueDateEnd);
      }
    }

    // Sort order
    let orderBy: any[] = [];
    if (sortBy === 'priority') {
      orderBy = [{ priority: sortOrder }, { dueDate: 'asc' }];
    } else if (sortBy === 'dueDate') {
      orderBy = [{ dueDate: sortOrder }, { priority: 'desc' }];
    } else if (sortBy === 'createdAt') {
      orderBy = [{ createdAt: sortOrder }];
    } else {
      orderBy = [{ createdAt: 'desc' }];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, role: true },
        },
        project: {
          select: { id: true, title: true, pmId: true, pm: { select: { id: true, name: true } } },
        },
        statusLogs: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy,
    });

    sendSuccess(res, { tasks });
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch tasks', 500);
  }
};

export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, role: true },
        },
        project: {
          include: {
            pm: { select: { id: true, name: true, email: true } },
            client: true,
          },
        },
        statusLogs: {
          orderBy: { createdAt: 'desc' },
        },
        activities: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!task) {
      sendError(res, 'Task not found', 404, 'TASK_NOT_FOUND');
      return;
    }

    // Role-based access validation
    if (user.role === 'DEVELOPER' && task.assignedToId !== user.id) {
      sendError(res, 'You do not have permission to view other developers’ tasks', 403, 'FORBIDDEN_TASK_ACCESS');
      return;
    }

    if (user.role === 'PROJECT_MANAGER' && task.project.pmId !== user.id) {
      sendError(res, 'You do not have permission to view tasks outside your managed projects', 403, 'FORBIDDEN_TASK_ACCESS');
      return;
    }

    sendSuccess(res, { task });
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch task', 500);
  }
};

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { title, description, projectId, assignedToId, status, priority, dueDate } = req.body;

    if (!title || !projectId) {
      sendError(res, 'Title and Project ID are required', 400, 'MISSING_FIELDS');
      return;
    }

    // Verify Project existence & PM ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { pm: true },
    });

    if (!project) {
      sendError(res, 'Project not found', 404, 'PROJECT_NOT_FOUND');
      return;
    }

    if (user.role === 'PROJECT_MANAGER' && project.pmId !== user.id) {
      sendError(res, 'You cannot create tasks in a project you do not manage', 403, 'FORBIDDEN');
      return;
    }

    let assignedUser = null;
    if (assignedToId) {
      assignedUser = await prisma.user.findUnique({
        where: { id: assignedToId },
      });
      if (!assignedUser || assignedUser.role !== 'DEVELOPER') {
        sendError(res, 'Assigned user must be a valid developer', 400, 'INVALID_ASSIGNEE');
        return;
      }
    }

    const taskDueDate = dueDate ? new Date(dueDate) : null;
    const isOverdue = taskDueDate ? taskDueDate < new Date() && status !== 'DONE' : false;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        assignedToId: assignedToId || null,
        status: status || TaskStatus.TO_DO,
        priority: priority || TaskPriority.MEDIUM,
        dueDate: taskDueDate,
        isOverdue,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, title: true, pmId: true } },
      },
    });

    // 1. Log Activity
    await logActivity({
      taskId: task.id,
      projectId: task.projectId,
      userId: user.id,
      userName: user.name,
      action: 'TASK_CREATED',
      taskTitle: task.title,
      taskNumber: task.taskNumber,
      assignedToName: assignedUser?.name,
    });

    // 2. Notify assigned developer if applicable
    if (assignedToId && assignedUser) {
      await createNotification({
        userId: assignedToId,
        title: 'New Task Assigned',
        message: `${user.name} assigned you Task #${task.taskNumber}: "${task.title}"`,
        type: 'TASK_ASSIGNED',
        taskId: task.id,
        projectId: task.projectId,
      });
    }

    // 3. Broadcast real-time update
    broadcastTaskUpdate({
      task,
      projectId: task.projectId,
      assignedToId: task.assignedToId,
      pmId: project.pmId,
    });

    sendSuccess(res, { task }, 'Task created successfully', 201);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to create task', 500);
  }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { title, description, assignedToId, priority, dueDate } = req.body;

    // Developers cannot perform full task edits (only status update via updateTaskStatus)
    if (user.role === 'DEVELOPER') {
      sendError(res, 'Developers can only update task status', 403, 'FORBIDDEN_ACTION');
      return;
    }

    const existingTask = await prisma.task.findUnique({
      where: { id },
      include: { project: true, assignedTo: true },
    });

    if (!existingTask) {
      sendError(res, 'Task not found', 404, 'TASK_NOT_FOUND');
      return;
    }

    if (user.role === 'PROJECT_MANAGER' && existingTask.project.pmId !== user.id) {
      sendError(res, 'You cannot edit tasks outside your managed projects', 403, 'FORBIDDEN');
      return;
    }

    const taskDueDate = dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : existingTask.dueDate;
    const isOverdue = taskDueDate ? taskDueDate < new Date() && existingTask.status !== 'DONE' : false;

    const reassigned = assignedToId !== undefined && assignedToId !== existingTask.assignedToId;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existingTask.title,
        description: description !== undefined ? description : existingTask.description,
        assignedToId: assignedToId !== undefined ? assignedToId : existingTask.assignedToId,
        priority: priority !== undefined ? priority : existingTask.priority,
        dueDate: taskDueDate,
        isOverdue,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, title: true, pmId: true } },
      },
    });

    if (reassigned && assignedToId) {
      const newAssignee = await prisma.user.findUnique({ where: { id: assignedToId } });
      if (newAssignee) {
        await logActivity({
          taskId: updatedTask.id,
          projectId: updatedTask.projectId,
          userId: user.id,
          userName: user.name,
          action: 'TASK_ASSIGNED',
          taskTitle: updatedTask.title,
          taskNumber: updatedTask.taskNumber,
          assignedToName: newAssignee.name,
        });

        await createNotification({
          userId: assignedToId,
          title: 'Task Reassigned to You',
          message: `${user.name} assigned you Task #${updatedTask.taskNumber}: "${updatedTask.title}"`,
          type: 'TASK_ASSIGNED',
          taskId: updatedTask.id,
          projectId: updatedTask.projectId,
        });
      }
    }

    broadcastTaskUpdate({
      task: updatedTask,
      projectId: updatedTask.projectId,
      assignedToId: updatedTask.assignedToId,
      pmId: existingTask.project.pmId,
    });

    sendSuccess(res, { task: updatedTask }, 'Task updated successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update task', 500);
  }
};

export const updateTaskStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !Object.values(TaskStatus).includes(status)) {
      sendError(res, 'Valid status is required (TO_DO, IN_PROGRESS, IN_REVIEW, DONE)', 400, 'INVALID_STATUS');
      return;
    }

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, title: true, pmId: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    if (!task) {
      sendError(res, 'Task not found', 404, 'TASK_NOT_FOUND');
      return;
    }

    // Permission enforcement:
    // Developer can only update if assigned to the task
    if (user.role === 'DEVELOPER' && task.assignedToId !== user.id) {
      sendError(res, 'You can only update the status of tasks assigned to you', 403, 'FORBIDDEN');
      return;
    }

    // PM can only update tasks in projects they manage
    if (user.role === 'PROJECT_MANAGER' && task.project.pmId !== user.id) {
      sendError(res, 'You cannot update tasks in projects you do not manage', 403, 'FORBIDDEN');
      return;
    }

    const oldStatus = task.status;
    const isDone = status === 'DONE';
    const isOverdue = isDone ? false : task.dueDate ? task.dueDate < new Date() : false;

    // 1. Record Status Change History
    await prisma.taskStatusHistory.create({
      data: {
        taskId: task.id,
        changedById: user.id,
        oldStatus,
        newStatus: status,
      },
    });

    // 2. Update Task
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status,
        isOverdue,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, title: true, pmId: true } },
      },
    });

    // 3. Log Activity
    await logActivity({
      taskId: task.id,
      projectId: task.projectId,
      userId: user.id,
      userName: user.name,
      action: 'STATUS_CHANGE',
      oldStatus,
      newStatus: status,
      taskTitle: task.title,
      taskNumber: task.taskNumber,
    });

    // 4. Notification trigger: If moved to IN_REVIEW, notify the PM!
    if (status === TaskStatus.IN_REVIEW && task.project.pmId) {
      await createNotification({
        userId: task.project.pmId,
        title: 'Task Ready for Review',
        message: `${user.name} moved Task #${task.taskNumber} "${task.title}" to In Review`,
        type: 'TASK_IN_REVIEW',
        taskId: task.id,
        projectId: task.projectId,
      });
    }

    // 5. Broadcast real-time task update
    broadcastTaskUpdate({
      task: updatedTask,
      projectId: task.projectId,
      assignedToId: task.assignedToId,
      pmId: task.project.pmId,
    });

    sendSuccess(res, { task: updatedTask }, `Task status moved from ${oldStatus} to ${status}`);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update task status', 500);
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;

    if (user.role === 'DEVELOPER') {
      sendError(res, 'Developers are not permitted to delete tasks', 403, 'FORBIDDEN');
      return;
    }

    const task = await prisma.task.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!task) {
      sendError(res, 'Task not found', 404, 'TASK_NOT_FOUND');
      return;
    }

    if (user.role === 'PROJECT_MANAGER' && task.project.pmId !== user.id) {
      sendError(res, 'You can only delete tasks from your own projects', 403, 'FORBIDDEN');
      return;
    }

    await prisma.task.delete({ where: { id } });

    sendSuccess(res, null, 'Task deleted successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to delete task', 500);
  }
};
