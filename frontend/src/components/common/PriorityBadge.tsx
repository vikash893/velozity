import React from 'react';
import { TaskPriority } from '../../types';
import { Badge } from './Badge';
import { AlertCircle, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react';

interface PriorityBadgeProps {
  priority: TaskPriority;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  switch (priority) {
    case 'CRITICAL':
      return (
        <Badge variant="danger">
          <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
          Critical
        </Badge>
      );
    case 'HIGH':
      return (
        <Badge variant="warning">
          <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
          High
        </Badge>
      );
    case 'MEDIUM':
      return (
        <Badge variant="primary">
          <ArrowUp className="w-3 h-3 text-emerald-600 shrink-0" />
          Medium
        </Badge>
      );
    case 'LOW':
      return (
        <Badge variant="default">
          <ArrowDown className="w-3 h-3 text-slate-500 shrink-0" />
          Low
        </Badge>
      );
    default:
      return <Badge>{priority}</Badge>;
  }
};
