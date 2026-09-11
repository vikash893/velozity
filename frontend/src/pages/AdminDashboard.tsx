import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useSocketContext } from '../context/SocketContext';
import { AdminDashboardStats } from '../types';
import { ActivityFeed } from '../components/activity/ActivityFeed';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';
import { CreateTaskModal } from '../components/tasks/CreateTaskModal';
import { CreateUserModal } from '../components/users/CreateUserModal';
import {
  FolderKanban,
  AlertTriangle,
  Radio,
  Plus,
  Layers,
  ArrowUpRight,
  UserPlus,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const { onlineUsersCount } = useSocketContext();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/admin');
      setStats(res.data.data.stats);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Executive Operations Hub</h2>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Real-time client telemetry, active workloads, and team deliverable tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsUserModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-purple-600" />
            Add Member
          </button>

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
            New Task
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Online Users (WebSocket Presence) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Live Presence</span>
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {onlineUsersCount}
            </span>
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Online
            </span>
          </div>
          <p className="mt-2 text-[11px] font-medium text-slate-400">WebSocket heartbeat sync</p>
        </div>

        {/* Total Projects */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Client Projects</span>
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
          <Link
            to="/dashboard/projects"
            className="mt-2 inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-800 font-bold"
          >
            <span>View all projects</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Total Tasks */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Tasks</span>
            <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats?.totalTasks ?? '...'}
            </span>
            <span className="text-xs font-semibold text-slate-500">Total</span>
          </div>
          <p className="mt-2 text-[11px] font-medium text-slate-500">
            <strong className="text-emerald-700">{stats?.tasksByStatus?.DONE || 0}</strong> completed ({Math.round(((stats?.tasksByStatus?.DONE || 0) / (stats?.totalTasks || 1)) * 100)}%)
          </p>
        </div>

        {/* Overdue Tasks */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Overdue Tasks</span>
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-600 tracking-tight">
              {stats?.overdueTasksCount ?? '...'}
            </span>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              Cron Flagged
            </span>
          </div>
          <Link
            to="/dashboard/tasks?isOverdue=true"
            className="mt-2 inline-flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-700 font-bold"
          >
            <span>Review overdue items</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Main Grid: Status Breakdown + Global Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Task Status Breakdown & Priority */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Tasks By Lifecycle Stage</h3>
              <Link to="/dashboard/tasks" className="text-xs font-bold text-emerald-700 hover:underline">
                Open Kanban Board →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs text-slate-500 font-bold">To Do</span>
                <p className="text-2xl font-extrabold text-slate-800 mt-1">
                  {stats?.tasksByStatus?.TO_DO || 0}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80">
                <span className="text-xs text-emerald-800 font-bold">In Progress</span>
                <p className="text-2xl font-extrabold text-emerald-700 mt-1">
                  {stats?.tasksByStatus?.IN_PROGRESS || 0}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80">
                <span className="text-xs text-amber-800 font-bold">In Review</span>
                <p className="text-2xl font-extrabold text-amber-700 mt-1">
                  {stats?.tasksByStatus?.IN_REVIEW || 0}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200/80">
                <span className="text-xs text-teal-800 font-bold">Done</span>
                <p className="text-2xl font-extrabold text-teal-700 mt-1">
                  {stats?.tasksByStatus?.DONE || 0}
                </p>
              </div>
            </div>

            {/* Visual Progress Bar */}
            {stats && stats.totalTasks > 0 && (
              <div className="pt-2">
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    style={{
                      width: `${((stats.tasksByStatus.DONE || 0) / stats.totalTasks) * 100}%`,
                    }}
                    className="bg-teal-500 h-full"
                    title={`Done: ${stats.tasksByStatus.DONE}`}
                  />
                  <div
                    style={{
                      width: `${((stats.tasksByStatus.IN_REVIEW || 0) / stats.totalTasks) * 100}%`,
                    }}
                    className="bg-amber-400 h-full"
                    title={`In Review: ${stats.tasksByStatus.IN_REVIEW}`}
                  />
                  <div
                    style={{
                      width: `${((stats.tasksByStatus.IN_PROGRESS || 0) / stats.totalTasks) * 100}%`,
                    }}
                    className="bg-emerald-500 h-full"
                    title={`In Progress: ${stats.tasksByStatus.IN_PROGRESS}`}
                  />
                  <div
                    style={{
                      width: `${((stats.tasksByStatus.TO_DO || 0) / stats.totalTasks) * 100}%`,
                    }}
                    className="bg-slate-300 h-full"
                    title={`To Do: ${stats.tasksByStatus.TO_DO}`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Priority Breakdown */}
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

        {/* Right Col: Global Real-Time Activity Feed */}
        <div className="space-y-4">
          <ActivityFeed title="Global Live Activity Stream" />
        </div>
      </div>

      <CreateUserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onUserCreated={() => fetchStats()}
      />

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
    </div>
  );
};
