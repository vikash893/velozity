import cron from 'node-cron';
import { prisma } from '../config/prisma';
import { logActivity } from './activity.service';
import { createNotification } from './notification.service';
import { broadcastTaskUpdate } from './socket.service';

/**
 * Background Cron Job: Overdue Task Checker
 * Runs every minute to find tasks whose due date has passed, are not completed,
 * and have not yet been flagged as overdue.
 */
export const initCronJobs = () => {
  // Run every 60 seconds (* * * * *)
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();

      const overdueTasks = await prisma.task.findMany({
        where: {
          dueDate: {
            lt: now,
          },
          status: {
            not: 'DONE',
          },
          isOverdue: false,
        },
        include: {
          project: {
            select: { id: true, title: true, pmId: true },
          },
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      if (overdueTasks.length > 0) {
        console.log(`⏱️  [Cron Job] Found ${overdueTasks.length} newly overdue tasks. Flagging...`);

        for (const task of overdueTasks) {
          // 1. Update in DB
          const updatedTask = await prisma.task.update({
            where: { id: task.id },
            data: { isOverdue: true },
            include: {
              assignedTo: {
                select: { id: true, name: true, email: true, role: true },
              },
              project: {
                select: { id: true, title: true, pmId: true },
              },
            },
          });

          // 2. Log Activity
          await logActivity({
            taskId: task.id,
            projectId: task.projectId,
            userId: task.project.pmId, // attribution
            userName: 'System',
            action: 'TASK_OVERDUE',
            taskTitle: task.title,
            taskNumber: task.taskNumber,
            customMessage: `System flagged Task #${task.taskNumber} "${task.title}" as Overdue`,
          });

          // 3. Notify assigned developer if applicable
          if (task.assignedToId) {
            await createNotification({
              userId: task.assignedToId,
              title: 'Task Overdue Warning',
              message: `Task #${task.taskNumber} "${task.title}" has passed its due date.`,
              type: 'TASK_OVERDUE',
              taskId: task.id,
              projectId: task.projectId,
            });
          }

          // 4. Notify PM
          await createNotification({
            userId: task.project.pmId,
            title: 'Task Overdue in Project',
            message: `Task #${task.taskNumber} "${task.title}" in "${task.project.title}" is now overdue.`,
            type: 'TASK_OVERDUE',
            taskId: task.id,
            projectId: task.projectId,
          });

          // 5. Broadcast live task update
          broadcastTaskUpdate({
            task: updatedTask,
            projectId: task.projectId,
            assignedToId: task.assignedToId,
            pmId: task.project.pmId,
          });
        }
      }
    } catch (error) {
      console.error('Error during overdue task scheduler execution:', error);
    }
  });

  console.log('🕒 Background Overdue Task Cron Job initialized (running every 60 seconds)');
};
