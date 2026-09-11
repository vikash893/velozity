import React from 'react';
import { Task, TaskStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { Calendar, User as UserIcon } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
  canChangeStatus?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
}) => {
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      onClick={() => onClick(task)}
      className="group relative p-4 rounded-xl bg-white border border-slate-200/90 hover:border-emerald-500/60 hover:shadow-elevated transition-all duration-200 cursor-pointer space-y-3 shadow-2xs"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
          #{task.taskNumber}
        </span>
        <div className="flex items-center gap-1.5">
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} isOverdue={task.isOverdue} />
        </div>
      </div>

      <div>
        <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
          {task.title}
        </h4>
        {task.description && (
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5 truncate">
          <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px]">
            {task.assignedTo?.name ? task.assignedTo.name.charAt(0) : '?'}
          </div>
          <span className="truncate font-medium text-slate-700">
            {task.assignedTo?.name || <span className="text-slate-400 italic">Unassigned</span>}
          </span>
        </div>

        {task.dueDate && (
          <div
            className={`flex items-center gap-1 font-medium ${
              task.isOverdue && task.status !== 'DONE'
                ? 'text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded'
                : 'text-slate-500'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>{formatDate(task.dueDate)}</span>
          </div>
        )}
      </div>
    </div>
  );
};
