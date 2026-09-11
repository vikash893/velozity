import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Task } from '../types';
import { useAuth } from '../context/AuthContext';
import { TaskBoard } from '../components/tasks/TaskBoard';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { CreateTaskModal } from '../components/tasks/CreateTaskModal';
import { getSocket } from '../services/socket';
import { Plus } from 'lucide-react';

export const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const queryString = searchParams.toString();
      const res = await api.get(`/tasks?${queryString}`);
      setTasks(res.data.data.tasks || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchTasks();

    const socket = getSocket();
    if (!socket) return;

    const handleTaskUpdated = () => {
      fetchTasks();
    };

    socket.on('task:updated', handleTaskUpdated);
    return () => {
      socket.off('task:updated', handleTaskUpdated);
    };
  }, [fetchTasks]);

  const canCreate = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {user?.role === 'DEVELOPER' ? 'My Assigned Tasks' : 'Work Tasks Board'}
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            {user?.role === 'DEVELOPER'
              ? 'All engineering deliverables assigned directly to you.'
              : 'Cross-project task tracking and status management.'}
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            New Task
          </button>
        )}
      </div>

      <TaskFilters onFilterChange={fetchTasks} />

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold text-slate-500">Loading tasks...</p>
        </div>
      ) : (
        <TaskBoard
          tasks={tasks}
          onTaskUpdated={fetchTasks}
          onTaskDeleted={fetchTasks}
        />
      )}

      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onTaskCreated={fetchTasks}
      />
    </div>
  );
};
