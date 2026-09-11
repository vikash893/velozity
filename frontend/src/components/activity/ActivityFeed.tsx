import React from 'react';
import { Activity, Clock, ArrowRight, AlertCircle, PlusCircle, Radio } from 'lucide-react';
import { useSocketContext } from '../../context/SocketContext';
import { ActivityLog } from '../../types';

interface ActivityFeedProps {
  maxHeight?: string;
  title?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  maxHeight = 'max-h-[500px]',
  title = 'Live Activity Feed',
}) => {
  const { activities } = useSocketContext();

  const formatTimeAgo = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 30) return 'Just now';
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'STATUS_CHANGE':
        return <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />;
      case 'TASK_CREATED':
        return <PlusCircle className="w-3.5 h-3.5 text-teal-600" />;
      case 'TASK_OVERDUE':
        return <AlertCircle className="w-3.5 h-3.5 text-rose-600" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-card">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="font-bold text-slate-900 text-xs tracking-wide uppercase">{title}</h3>
        </div>
        <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-mono font-semibold">
          Live stream
        </span>
      </div>

      <div className={`p-4 overflow-y-auto ${maxHeight} divide-y divide-slate-100 space-y-3`}>
        {activities.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No activity records found yet.
          </div>
        ) : (
          activities.map((item: ActivityLog) => {
            return (
              <div
                key={item.id}
                className="pt-3 first:pt-0 flex items-start gap-3 text-xs text-slate-700 hover:bg-slate-50/80 p-2.5 rounded-xl transition-colors"
              >
                <div className="mt-0.5 p-1.5 rounded-lg bg-emerald-50 border border-emerald-100 shrink-0">
                  {getActionIcon(item.action)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 leading-snug">
                    {item.message}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {formatTimeAgo(item.createdAt)}
                    </span>
                    {item.project && (
                      <span className="truncate text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/70 font-medium">
                        {item.project.title}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
