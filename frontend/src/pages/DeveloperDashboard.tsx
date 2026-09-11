import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { Task, DeveloperDashboardData } from '../types';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskModal } from '../components/tasks/TaskModal';
import { ActivityFeed } from '../components/activity/ActivityFeed';
import { getSocket } from '../services/socket';
import {
  Layers,
  ArrowUpDown,
  Code,
} from 'lucide-react';

export const DeveloperDashboard: React.FC = () => {
  const [data, setData] = useState<DeveloperDashboardData | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await api.get('/dashboard/developer');
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to load developer tasks:', err);
    }
  }, []);

  useEffect(() => {
    fetchTasks();

    const socket = getSocket();
    if (!socket) return;

    const handleTaskUpdated = (task: Task) => {
      fetchTasks();
    };

    socket.on('task:updated', handleTaskUpdated);
    return () => {
      socket.off('task:updated', handleTaskUpdated);
    };
  }, [fetchTasks]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Engineering Workspace</h2>
        <p className="text-xs font-medium text-slate-500 mt-0.5">
          Assigned engineering tasks prioritized by criticality (Critical → High → Medium → Low) and due date.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Assigned Deliverables</span>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">
            {data?.stats?.totalAssigned || 0}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">In Progress</span>
          <p className="text-3xl font-extrabold text-emerald-700 mt-1">
            {data?.stats?.IN_PROGRESS || 0}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">In Review</span>
          <p className="text-3xl font-extrabold text-amber-700 mt-1">
            {data?.stats?.IN_REVIEW || 0}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card">
          <span className="text-xs font-bold text-rose-700 uppercase tracking-wide">Overdue</span>
          <p className="text-3xl font-extrabold text-rose-600 mt-1">
            {data?.stats?.OVERDUE || 0}
          </p>
        </div>
      </div>

      {/* Main Grid: Priority-sorted Task List + Assigned Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-card flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-extrabold text-slate-900">
                My Assigned Tasks
              </h3>
            </div>
            <span className="flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-bold">
              <ArrowUpDown className="w-3 h-3" />
              Priority ↓ then Due Date ↑
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {!data?.tasks || data.tasks.length === 0 ? (
              <div className="col-span-2 py-16 text-center text-slate-400 text-xs font-semibold border-2 border-dashed border-slate-200 rounded-2xl bg-white">
                No tasks currently assigned to you!
              </div>
            ) : (
              data.tasks.map((task: Task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={(t) => setSelectedTaskId(t.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Col: Dev-only Live Activity Feed */}
        <div className="space-y-4">
          <ActivityFeed title="My Tasks Live Stream" />
        </div>
      </div>

      <TaskModal
        isOpen={!!selectedTaskId}
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onTaskUpdated={() => fetchTasks()}
      />
    </div>
  );
};
