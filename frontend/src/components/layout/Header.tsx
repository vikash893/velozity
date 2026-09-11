import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocketContext } from '../../context/SocketContext';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import { LogOut, Radio, ShieldCheck, Briefcase, Code, Sparkles } from 'lucide-react';
import { Role } from '../../types';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { onlineUsersCount } = useSocketContext();

  const getRoleBadge = (role?: Role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-md">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            Admin
          </span>
        );
      case 'PROJECT_MANAGER':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-teal-100 text-teal-800 border border-teal-200 rounded-md">
            <Briefcase className="w-3 h-3 text-teal-600" />
            PM
          </span>
        );
      case 'DEVELOPER':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-slate-100 text-slate-700 border border-slate-200 rounded-md">
            <Code className="w-3 h-3 text-slate-600" />
            Developer
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between shadow-2xs">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-extrabold text-white text-base shadow-sm shadow-emerald-600/30">
            V
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
              VELOZITY <span className="text-emerald-600 text-xs font-semibold px-1.5 py-0.2 bg-emerald-50 rounded border border-emerald-200">GLOBAL</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Real-Time Project Engine</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Live Presence Indicator */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 shadow-2xs"
          title="Users currently connected in real time"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="hidden sm:inline text-emerald-700 font-medium">Live Presence:</span>
          <span className="font-bold text-emerald-700">{onlineUsersCount} online</span>
        </div>

        {/* Real-time Notifications */}
        <NotificationDropdown />

        {/* User Profile Pill */}
        {user && (
          <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-bold text-slate-800">{user.name}</span>
              <div className="mt-0.5">{getRoleBadge(user.role)}</div>
            </div>

            <button
              onClick={logout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
