import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Activity,
  Shield,
  Briefcase,
  Code2,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER'],
    },
    {
      label: user.role === 'PROJECT_MANAGER' ? 'My Projects' : 'Projects',
      path: '/dashboard/projects',
      icon: FolderKanban,
      roles: ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER'],
    },
    {
      label: user.role === 'DEVELOPER' ? 'My Tasks' : 'Tasks Board',
      path: '/dashboard/tasks',
      icon: CheckSquare,
      roles: ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER'],
    },
    {
      label: 'Activity Feed',
      path: '/dashboard/activity',
      icon: Activity,
      roles: ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER'],
    },
  ];

  const allowedNavs = navItems.filter((item) => item.roles.includes(user.role));

  return (
    <aside className="w-60 shrink-0 border-r border-slate-200/80 bg-white p-4 flex flex-col justify-between hidden md:flex shadow-2xs">
      <div className="space-y-6">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3">
            Main Navigation
          </span>
          <nav className="mt-2.5 space-y-1">
            {allowedNavs.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/dashboard'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Scope Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
          <div className="flex items-center gap-2 text-slate-800 font-bold mb-1">
            {user.role === 'ADMIN' && <Shield className="w-3.5 h-3.5 text-emerald-600" />}
            {user.role === 'PROJECT_MANAGER' && <Briefcase className="w-3.5 h-3.5 text-teal-600" />}
            {user.role === 'DEVELOPER' && <Code2 className="w-3.5 h-3.5 text-emerald-600" />}
            <span>Security Scope</span>
          </div>
          <p className="text-slate-500 leading-relaxed text-[11px]">
            {user.role === 'ADMIN' && 'Full agency visibility. Global project & permission management.'}
            {user.role === 'PROJECT_MANAGER' && 'Scoped to your managed projects and assigned teams.'}
            {user.role === 'DEVELOPER' && 'Strictly scoped to tasks assigned directly to you.'}
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center font-medium">
        Velozity Real-Time Engine • v1.0
      </div>
    </aside>
  );
};
