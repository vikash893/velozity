import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Project, Task } from '../types';
import { useAuth } from '../context/AuthContext';
import { getSocket, joinProjectRoom, leaveProjectRoom } from '../services/socket';
import { TaskBoard } from '../components/tasks/TaskBoard';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { CreateTaskModal } from '../components/tasks/CreateTaskModal';
import {
  Building,
  User,
  Plus,
  ArrowLeft,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export const ProjectDetailPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  const fetchProjectAndTasks = useCallback(async () => {
    if (!projectId) return;
    try {
      const projRes = await api.get(`/projects/${projectId}`);
      setProject(projRes.data.data.project);

      const queryString = searchParams.toString();
      const taskRes = await api.get(`/tasks?projectId=${projectId}&${queryString}`);
      setTasks(taskRes.data.data.tasks || []);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  }, [projectId, searchParams]);

  useEffect(() => {
    fetchProjectAndTasks();

    if (projectId) {
      joinProjectRoom(projectId);
    }

    const socket = getSocket();
    if (!socket) return;

    const handleTaskUpdated = (updatedTask: Task) => {
      if (updatedTask.projectId === projectId) {
        setTasks((prev) => {
          const index = prev.findIndex((t) => t.id === updatedTask.id);
          if (index !== -1) {
            const next = [...prev];
            next[index] = updatedTask;
            return next;
          } else {
            return [updatedTask, ...prev];
          }
        });
      }
    };

    socket.on('task:updated', handleTaskUpdated);

    return () => {
      if (projectId) {
        leaveProjectRoom(projectId);
      }
      socket.off('task:updated', handleTaskUpdated);
    };
  }, [projectId, fetchProjectAndTasks]);

  const canCreateTask = user?.role === 'ADMIN' || (user?.role === 'PROJECT_MANAGER' && project?.pmId === user.id);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-500">Loading project board...</p>
      </div>
    );
  }

  if (errorMsg || !project) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="p-4 max-w-md mx-auto bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-center justify-center gap-2 font-medium">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg || 'Project not found or unauthorized.'}</span>
        </div>
        <button
          onClick={() => navigate('/projects')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <button
            onClick={() => navigate('/projects')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-700 font-bold transition-colors mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Projects
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{project.title}</h2>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Live WebSocket Sync
            </div>
          </div>
          {project.description && (
            <p className="text-xs text-slate-500 font-medium max-w-3xl leading-relaxed">
              {project.description}
            </p>
          )}
        </div>

        {canCreateTask && (
          <button
            onClick={() => setIsCreateTaskOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Task
          </button>
        )}
      </div>

      {/* Project Meta Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-card flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
        <div className="flex flex-wrap items-center gap-6 text-slate-600">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-400">Client:</span>
            <span className="font-bold text-slate-800">
              {project.client?.company || project.client?.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-teal-600" />
            <span className="text-slate-400">Project Manager:</span>
            <span className="font-bold text-slate-800">{project.pm?.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400">Created:</span>
            <span className="text-slate-700">{new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-mono text-xs font-bold">
          {tasks.length} total tasks
        </div>
      </div>

      {/* URL-synchronized Filters */}
      <TaskFilters onFilterChange={fetchProjectAndTasks} />

      {/* Live Kanban Board */}
      <TaskBoard
        tasks={tasks}
        onTaskUpdated={() => fetchProjectAndTasks()}
        onTaskDeleted={() => fetchProjectAndTasks()}
      />

      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        defaultProjectId={project.id}
        onTaskCreated={() => fetchProjectAndTasks()}
      />
    </div>
  );
};
