import React from 'react';
import { ActivityFeed } from '../components/activity/ActivityFeed';

export const ActivityPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Live Activity Stream</h2>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Real-time chronological telemetry of status transitions, assignments, and system updates.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold self-start sm:self-auto shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>WebSocket Stream Connected</span>
        </div>
      </div>

      <div className="max-w-4xl">
        <ActivityFeed title="Live Team Activity Stream" maxHeight="max-h-[700px]" />
      </div>
    </div>
  );
};
