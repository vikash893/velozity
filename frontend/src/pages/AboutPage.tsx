import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Server,
  Database,
  Radio,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <header className="h-16 border-b border-slate-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-8 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-extrabold text-white text-base shadow-sm shadow-emerald-600/30">
              V
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
                VELOZITY <span className="text-emerald-600 text-xs font-semibold px-1.5 py-0.2 bg-emerald-50 rounded border border-emerald-200">GLOBAL</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Real-Time Engineering Engine</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>

          {user ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="space-y-3 text-center sm:text-left">
          <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider">About Velozity Global Solutions</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            High-Performance Real-Time Project Telemetry
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
            Velozity Global Solutions is an engineering management and project telemetry platform built specifically for fast-paced digital agencies and enterprise software teams.
          </p>
        </div>

        {/* Technical Architecture Breakdown */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-600" />
            Architectural Design Decisions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 font-extrabold text-slate-900">
                <Radio className="w-4 h-4 text-emerald-600" />
                <span>Socket.IO over Raw WebSockets</span>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium">
                Provides built-in room isolation (<code className="text-emerald-700">admin:feed</code>, <code className="text-emerald-700">pm:id</code>, <code className="text-emerald-700">project:id</code>), automatic exponential reconnection, and heartbeat presence tracking.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 font-extrabold text-slate-900">
                <Clock className="w-4 h-4 text-teal-600" />
                <span>Node-Cron Background Engine</span>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium">
                Lightweight, zero-external-dependency automated scheduler that checks overdue task deadlines every 60 seconds, recording database logs and dispatching live alerts.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 font-extrabold text-slate-900">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>PostgreSQL & Compound Indexing</span>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium">
                Fully relational schema with foreign key cascades and specialized indexes on <code className="text-emerald-700">[projectId, status]</code>, <code className="text-emerald-700">[assignedToId]</code>, and <code className="text-emerald-700">[dueDate, isOverdue]</code>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 font-extrabold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>HttpOnly Dual-Token Security</span>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium">
                Long-lived Refresh Tokens stored exclusively in <code className="text-emerald-700">HttpOnly, SameSite=Lax</code> cookies preventing XSS token exfiltration, paired with short-lived access tokens.
              </p>
            </div>
          </div>
        </div>

        {/* Mission & Principles */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-card space-y-4">
          <h2 className="text-lg font-extrabold text-slate-900">Engineering Principles</h2>
          <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Admin-Managed Provisioning:</strong> Team member onboarding is strictly controlled by Administrators; public unauthenticated registrations are disabled.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Zero Client-Side Role Hiding:</strong> Permissions are enforced strictly at the database query and API controller level.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>True Real-Time Broadcasts:</strong> Zero polling intervals for task status transitions; all connected users receive instant socket updates.</span>
            </li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 px-4 sm:px-8 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">VELOZITY GLOBAL SOLUTIONS</span>
          <span>© 2026</span>
        </div>
        <div className="flex items-center gap-4 font-semibold text-slate-600">
          <Link to="/" className="hover:text-emerald-600">Home</Link>
          <Link to="/login" className="hover:text-emerald-600">Sign In</Link>
        </div>
      </footer>
    </div>
  );
};
