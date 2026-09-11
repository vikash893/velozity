import React from 'react';
import { TaskStatus } from '../../types';
import { Badge } from './Badge';

interface StatusBadgeProps {
  status: TaskStatus;
  isOverdue?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, isOverdue }) => {
  if (isOverdue && status !== 'DONE') {
    return (
      <Badge variant="danger" className="animate-pulse-subtle font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
        Overdue
      </Badge>
    );
  }

  switch (status) {
    case 'TO_DO':
      return (
        <Badge variant="default">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
          To Do
        </Badge>
      );
    case 'IN_PROGRESS':
      return (
        <Badge variant="primary">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
          In Progress
        </Badge>
      );
    case 'IN_REVIEW':
      return (
        <Badge variant="warning">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
          In Review
        </Badge>
      );
    case 'DONE':
      return (
        <Badge variant="success">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0" />
          Done
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
};
