import React, { useState } from 'react';
import { Task, TaskStatus } from '../../types';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';

interface TaskBoardProps {
  tasks: Task[];
  onTaskUpdated?: (task: Task) => void;
  onTaskDeleted?: (taskId: string) => void;
}

const COLUMNS: { id: TaskStatus; label: string; dotColor: string; bgBadge: string; colBg: string }[] = [
  { id: 'TO_DO', label: 'To Do', dotColor: 'bg-slate-400', bgBadge: 'bg-slate-100 text-slate-700', colBg: 'bg-slate-100/60' },
  { id: 'IN_PROGRESS', label: 'In Progress', dotColor: 'bg-emerald-500', bgBadge: 'bg-emerald-100 text-emerald-800', colBg: 'bg-emerald-50/40' },
  { id: 'IN_REVIEW', label: 'In Review', dotColor: 'bg-amber-500', bgBadge: 'bg-amber-100 text-amber-800', colBg: 'bg-amber-50/40' },
  { id: 'DONE', label: 'Done', dotColor: 'bg-teal-600', bgBadge: 'bg-teal-100 text-teal-800', colBg: 'bg-teal-50/40' },
];

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  onTaskUpdated,
  onTaskDeleted,
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const getColumnTasks = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {COLUMNS.map((col) => {
          const colTasks = getColumnTasks(col.id);
          return (
            <div
              key={col.id}
              className={`${col.colBg} border border-slate-200/80 rounded-2xl p-3.5 flex flex-col min-h-[440px]`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                  <h3 className="font-extrabold text-xs text-slate-800 tracking-wider uppercase">
                    {col.label}
                  </h3>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${col.bgBadge}`}>
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="space-y-3 flex-1">
                {colTasks.length === 0 ? (
                  <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs font-semibold">
                    Empty Stage
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={(t) => setSelectedTaskId(t.id)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <TaskModal
        isOpen={!!selectedTaskId}
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onTaskUpdated={onTaskUpdated}
        onTaskDeleted={onTaskDeleted}
      />
    </>
  );
};
