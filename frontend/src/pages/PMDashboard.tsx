import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PMDashboardStats, Task } from '../types';
import { ActivityFeed } from '../components/activity/ActivityFeed';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';
import { CreateTaskModal } from '../components/tasks/CreateTaskModal';
import { TaskModal } from '../components/tasks/TaskModal';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Plus,
  Clock,
  User,
} from 'lucide-react';

export const PMDashboard: React.FC = () => {
  const [stats, setStats] = useState<PMDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/pm');
      setStats(res.data.data.stats);
    } catch (err) {
      console.error('Failed to load PM stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Project Manager Command Hub</h2>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Deliverable oversight, deadline management, and real-time team workflow.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsProjectModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            New Project
          </button>
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Create & Assign Task
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Managed Projects</span>
            <div className="p-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-700">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats?.totalProjects ?? '...'}
            </span>
            <span className="text-xs font-semibold text-slate-500">Active</span>
          </div>
          <p className="mt-2 text-[11px] font-medium text-emerald-700">Strictly isolated to your portfolio</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Tasks</span>
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats?.totalTasks ?? '...'}
            </span>
            <span className="text-xs font-semibold text-slate-500">Deliverables</span>
          </div>
          <p className="mt-2 text-[11px] font-medium text-slate-500">
            <strong className="text-amber-700">{stats?.tasksByStatus?.IN_REVIEW || 0}</strong> ready for review
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Overdue Tasks</span>
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-600 tracking-tight">
              {stats?.overdueCount ?? '...'}
            </span>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              Auto-flagged
            </span>
          </div>
          <p className="mt-2 text-[11px] font-medium text-slate-400">Background cron active</p>
        </div>
      </div>

      {/* Main Grid: Upcoming Deadlines + Team Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Due Dates this Week */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  Upcoming Deadlines Due This Week
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-semibold">
                {stats?.upcomingTasksDueThisWeek?.length || 0} upcoming
              </span>
            </div>

            <div className="space-y-2.5">
              {!stats?.upcomingTasksDueThisWeek || stats.upcomingTasksDueThisWeek.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 font-medium">
                  No pending deadlines due this week!
                </div>
              ) : (
                stats.upcomingTasksDueThisWeek.map((task: Task) => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-emerald-500/60 hover:bg-emerald-50/20 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <PriorityBadge priority={task.priority} />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-700">{task.project?.title}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-medium text-slate-600">
                            <User className="w-3 h-3 text-slate-400" />
                            {task.assignedTo?.name || 'Unassigned'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1.5 text-xs text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'No due date'}
                        </span>
                      </div>
                      <StatusBadge status={task.status} isOverdue={task.isOverdue} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Tasks By Priority */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Tasks By Priority Level</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200">
                <span className="text-xs text-rose-700 font-bold">Critical</span>
                <p className="text-xl font-extrabold text-slate-900 mt-1">
                  {stats?.tasksByPriority?.CRITICAL || 0}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200">
                <span className="text-xs text-amber-700 font-bold">High</span>
                <p className="text-xl font-extrabold text-slate-900 mt-1">
                  {stats?.tasksByPriority?.HIGH || 0}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
                <span className="text-xs text-emerald-800 font-bold">Medium</span>
                <p className="text-xl font-extrabold text-slate-900 mt-1">
                  {stats?.tasksByPriority?.MEDIUM || 0}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-600 font-bold">Low</span>
                <p className="text-xl font-extrabold text-slate-900 mt-1">
                  {stats?.tasksByPriority?.LOW || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: PM Scoped Live Activity Feed */}
        <div className="space-y-4">
          <ActivityFeed title="Managed Projects Live Feed" />
        </div>
      </div>

      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onProjectCreated={() => fetchStats()}
      />

      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onTaskCreated={() => fetchStats()}
      />

      <TaskModal
        isOpen={!!selectedTaskId}
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onTaskUpdated={() => fetchStats()}
      />
    </div>
  );
};
