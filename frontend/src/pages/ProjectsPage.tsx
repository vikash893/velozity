import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Project } from '../types';
import { useAuth } from '../context/AuthContext';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';
import {
  FolderKanban,
  Building,
  User,
  Plus,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.data.projects || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const canCreate = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {user?.role === 'PROJECT_MANAGER' ? 'My Managed Projects' : 'Client Projects'}
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            {user?.role === 'ADMIN' && 'Comprehensive registry of all agency client deliverables.'}
            {user?.role === 'PROJECT_MANAGER' && 'Projects strictly assigned to and managed by you.'}
            {user?.role === 'DEVELOPER' && 'Projects where you have assigned engineering tasks.'}
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            New Project
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold text-slate-500">Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white shadow-2xs">
          <FolderKanban className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No Projects Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {canCreate
              ? 'Get started by creating your first client project.'
              : 'You do not have any projects assigned yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => {
            const stats = proj.stats || {
              total: 0,
              done: 0,
              inProgress: 0,
              inReview: 0,
              toDo: 0,
              overdue: 0,
            };
            const completionPercent = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

            return (
              <Link
                key={proj.id}
                to={`/projects/${proj.id}`}
                className="group p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-500/60 hover:shadow-elevated transition-all duration-200 flex flex-col justify-between space-y-4 shadow-card"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      {proj.status}
                    </span>
                    {stats.overdue > 0 && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full animate-pulse">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        {stats.overdue} Overdue
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                    {proj.title}
                  </h3>

                  {proj.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {proj.description}
                    </p>
                  )}
                </div>

                <div className="space-y-3.5 pt-3.5 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5 truncate">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate text-slate-700 font-semibold">{proj.client?.company || proj.client?.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 truncate">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate text-slate-600">{proj.pm?.name}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold mb-1">
                      <span>Completion</span>
                      <span className="text-emerald-700">{completionPercent}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${completionPercent}%` }}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-slate-500 font-bold">
                      {stats.total} total tasks
                    </span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 group-hover:translate-x-0.5 transition-transform font-extrabold text-xs">
                      Open Board
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={() => fetchProjects()}
      />
    </div>
  );
};
