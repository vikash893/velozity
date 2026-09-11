import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendError, sendSuccess } from '../utils/response';
import { logActivity } from '../services/activity.service';

export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    let whereClause: any = {};

    if (user.role === 'PROJECT_MANAGER') {
      // PMs strictly see only their own projects
      whereClause = { pmId: user.id };
    } else if (user.role === 'DEVELOPER') {
      // Developers see projects where they have assigned tasks
      whereClause = {
        tasks: {
          some: {
            assignedToId: user.id,
          },
        },
      };
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        client: {
          select: { id: true, name: true, email: true, company: true },
        },
        pm: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Also get task status distribution for each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const tasks = await prisma.task.findMany({
          where: { projectId: project.id },
          select: { status: true, isOverdue: true },
        });

        const statusCounts = {
          total: tasks.length,
          toDo: tasks.filter((t) => t.status === 'TO_DO').length,
          inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
          inReview: tasks.filter((t) => t.status === 'IN_REVIEW').length,
          done: tasks.filter((t) => t.status === 'DONE').length,
          overdue: tasks.filter((t) => t.isOverdue).length,
        };

        return {
          ...project,
          stats: statusCounts,
        };
      })
    );

    sendSuccess(res, { projects: projectsWithStats });
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch projects', 500);
  }
};

export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        pm: {
          select: { id: true, name: true, email: true },
        },
        tasks: {
          where:
            user.role === 'DEVELOPER'
              ? { assignedToId: user.id }
              : undefined,
          include: {
            assignedTo: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
          orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
        },
      },
    });

    if (!project) {
      sendError(res, 'Project not found', 404, 'PROJECT_NOT_FOUND');
      return;
    }

    // Role-based access enforcement: PM cannot view another PM's project
    if (user.role === 'PROJECT_MANAGER' && project.pmId !== user.id) {
      sendError(res, 'You do not have permission to view this project', 403, 'FORBIDDEN_PROJECT_ACCESS');
      return;
    }

    sendSuccess(res, { project });
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch project', 500);
  }
};

export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { title, description, clientId, pmId } = req.body;

    if (!title || !clientId) {
      sendError(res, 'Title and Client ID are required', 400, 'MISSING_FIELDS');
      return;
    }

    // PMs can only create projects assigned to themselves
    const assignedPmId = user.role === 'PROJECT_MANAGER' ? user.id : (pmId || user.id);

    const project = await prisma.project.create({
      data: {
        title,
        description,
        clientId,
        pmId: assignedPmId,
      },
      include: {
        client: true,
        pm: { select: { id: true, name: true, email: true } },
      },
    });

    await logActivity({
      projectId: project.id,
      userId: user.id,
      userName: user.name,
      action: 'PROJECT_CREATED',
      customMessage: `${user.name} created project "${project.title}"`,
    });

    sendSuccess(res, { project }, 'Project created successfully', 201);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to create project', 500);
  }
};

export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { title, description, status, clientId, pmId } = req.body;

    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      sendError(res, 'Project not found', 404, 'PROJECT_NOT_FOUND');
      return;
    }

    // Role enforcement: PM can only update their own project
    if (user.role === 'PROJECT_MANAGER' && existingProject.pmId !== user.id) {
      sendError(res, 'You do not have permission to modify this project', 403, 'FORBIDDEN_PROJECT_ACCESS');
      return;
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existingProject.title,
        description: description !== undefined ? description : existingProject.description,
        status: status !== undefined ? status : existingProject.status,
        clientId: clientId !== undefined ? clientId : existingProject.clientId,
        pmId: user.role === 'ADMIN' && pmId ? pmId : existingProject.pmId,
      },
      include: {
        client: true,
        pm: { select: { id: true, name: true, email: true } },
      },
    });

    sendSuccess(res, { project: updatedProject }, 'Project updated successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update project', 500);
  }
};

export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      sendError(res, 'Project not found', 404, 'PROJECT_NOT_FOUND');
      return;
    }

    if (user.role === 'PROJECT_MANAGER' && existingProject.pmId !== user.id) {
      sendError(res, 'You do not have permission to delete this project', 403, 'FORBIDDEN_PROJECT_ACCESS');
      return;
    }

    await prisma.project.delete({ where: { id } });

    sendSuccess(res, null, 'Project deleted successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to delete project', 500);
  }
};
