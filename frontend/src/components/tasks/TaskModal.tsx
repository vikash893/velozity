import React, { useState, useEffect } from 'react';
import { Task, TaskPriority, TaskStatus, User } from '../../types';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  History,
  AlertCircle,
  Save,
  Trash2,
} from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string | null;
  onTaskUpdated?: (updatedTask: Task) => void;
  onTaskDeleted?: (taskId: string) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskId,
  onTaskUpdated,
  onTaskDeleted,
}) => {
  const { user } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [developers, setDevelopers] = useState<User[]>([]);

  // Form states
  const [status, setStatus] = useState<TaskStatus>('TO_DO');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [assignedToId, setAssignedToId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isDev = user?.role === 'DEVELOPER';
  const isAdminOrPm = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';

  useEffect(() => {
    if (!isOpen || !taskId) {
      setTask(null);
      return;
    }

    const fetchTask = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const res = await api.get(`/tasks/${taskId}`);
        const taskData: Task = res.data.data.task;
        setTask(taskData);
        setTitle(taskData.title);
        setDescription(taskData.description || '');
        setStatus(taskData.status);
        setPriority(taskData.priority);
        setAssignedToId(taskData.assignedToId || '');
        setDueDate(taskData.dueDate ? taskData.dueDate.split('T')[0] : '');
      } catch (err: any) {
        setErrorMsg(err.response?.data?.message || 'Failed to load task details');
      } finally {
        setLoading(false);
      }
    };

    const fetchDevelopers = async () => {
      if (isAdminOrPm) {
        try {
          const res = await api.get('/users?role=DEVELOPER');
          setDevelopers(res.data.data.users || []);
        } catch (e) {
          console.error(e);
        }
      }
    };

    fetchTask();
    fetchDevelopers();
  }, [isOpen, taskId, isAdminOrPm]);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task) return;
    setStatus(newStatus);
    setSaving(true);
    try {
      const res = await api.patch(`/tasks/${task.id}/status`, { status: newStatus });
      const updated: Task = res.data.data.task;
      setTask(updated);
      if (onTaskUpdated) onTaskUpdated(updated);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update status');
      setStatus(task.status); // revert
    } finally {
      setSaving(false);
    }
  };

  const handleFullSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    setSaving(true);
    setErrorMsg('');

    try {
      const res = await api.patch(`/tasks/${task.id}`, {
        title,
        description,
        priority,
        assignedToId: assignedToId || null,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      });

      const updated: Task = res.data.data.task;
      setTask(updated);
      if (onTaskUpdated) onTaskUpdated(updated);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !window.confirm(`Are you sure you want to delete Task #${task.taskNumber}?`)) return;
    try {
      await api.delete(`/tasks/${task.id}`);
      if (onTaskDeleted) onTaskDeleted(task.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete task');
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? `Task #${task.taskNumber}` : 'Task Details'}
      maxWidth="xl"
    >
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold text-slate-500">Loading task details...</p>
        </div>
      ) : errorMsg && !task ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-2 font-medium">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      ) : task ? (
        <div className="space-y-6">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Status Bar */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 font-semibold">Current State:</span>
              <StatusBadge status={task.status} isOverdue={task.isOverdue} />
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="quick-status" className="text-xs font-semibold text-slate-600">
                Move status:
              </label>
              <select
                id="quick-status"
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                disabled={saving}
                className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-xs font-bold text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs cursor-pointer"
              >
                <option value="TO_DO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </div>

          {/* Task Form */}
          <form onSubmit={handleFullSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Task Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isDev}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white disabled:opacity-60 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isDev}
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-emerald-500 focus:bg-white disabled:opacity-60 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  disabled={isDev}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white disabled:opacity-60 transition-all"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Assigned Developer</label>
                {isAdminOrPm ? (
                  <select
                    value={assignedToId}
                    onChange={(e) => setAssignedToId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  >
                    <option value="">Unassigned</option>
                    {developers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    disabled
                    value={task.assignedTo?.name || 'Unassigned'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium text-slate-500 opacity-70"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={isDev}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white disabled:opacity-60 transition-all"
                />
              </div>
            </div>

            {isAdminOrPm && (
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Task
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>

          {/* Recorded Status History & Audit Log */}
          {task.statusLogs && task.statusLogs.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2 mb-3">
                <History className="w-3.5 h-3.5 text-emerald-600" />
                Database Transition Audit Log
              </h4>
              <div className="space-y-2">
                {task.statusLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs font-medium"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">{log.oldStatus}</span>
                      <span className="text-slate-400">→</span>
                      <span className="text-emerald-700 font-bold">{log.newStatus}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  );
};
