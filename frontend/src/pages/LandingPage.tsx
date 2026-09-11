import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  ShieldCheck,
  Radio,
  Clock,
  Briefcase,
  Code,
  Zap,
  Lock,
  ChevronRight,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Public Navigation Bar */}
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

          <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-emerald-600 transition-colors">Platform Features</a>
            <a href="#architecture" className="hover:text-emerald-600 transition-colors">Architecture</a>
            <a href="#roles" className="hover:text-emerald-600 transition-colors">Role Matrix</a>
            <Link to="/about" className="hover:text-emerald-600 transition-colors">About Velozity</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Soft Background Ambient Glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live WebSocket Telemetry & RBAC Security</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Real-Time Client Dashboard for High-Velocity Engineering
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Manage multi-client deliverables, track instant task lifecycle transitions with WebSocket streaming, and enforce strict API-level role permissions.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <Link
              to="/login"
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Launch Live Demo</span>
            </Link>

            <Link
              to="/about"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 text-sm font-bold shadow-card transition-all cursor-pointer"
            >
              <span>Explore Architecture</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>

          {/* Interactive Feature Teaser Card */}
          <div className="mt-12 p-2 rounded-3xl bg-gradient-to-b from-slate-200/60 to-slate-100/30 border border-slate-200 shadow-elevated">
            <div className="p-6 sm:p-8 rounded-2xl bg-white text-left space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-xs font-mono font-bold text-slate-400 ml-2">velozity-engine://live-workspace</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>WebSocket Connected</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-500 uppercase text-[10px]">Admin Scope</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-sm font-extrabold text-slate-900">Global Visibility</p>
                  <p className="text-slate-500 text-[11px]">Full access to all clients, projects, member provisioning, and presence telemetry.</p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-800 uppercase text-[10px]">Project Manager</span>
                    <Briefcase className="w-4 h-4 text-teal-600" />
                  </div>
                  <p className="text-sm font-extrabold text-slate-900">Managed Isolation</p>
                  <p className="text-slate-500 text-[11px]">Strictly manages owned projects and receives real-time review alerts.</p>
                </div>

                <div className="p-4 rounded-xl bg-teal-50/40 border border-teal-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-teal-800 uppercase text-[10px]">Developer Scope</span>
                    <Code className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-sm font-extrabold text-slate-900">Task-Level Privacy</p>
                  <p className="text-slate-500 text-[11px]">Can only inspect and update status of deliverables assigned to them.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Highlights Grid */}
      <section id="features" className="py-16 bg-white border-y border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider">Engine Capabilities</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Engineered for Operational Excellence</h2>
            <p className="text-xs text-slate-500 font-medium">Built with clean separation of concerns and robust security protocols.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Radio className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Live WebSocket Feed</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Task status changes emit instantly to all connected viewers without polling, formatted as human-readable activity events.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5 text-teal-600" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">API-Level RBAC</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Role enforcement verified on every endpoint. PMs cannot touch other PMs' projects; Developers cannot access other devs' tasks.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Automated Cron Scheduler</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Background worker scans overdue deliverables, automatically flagging them, recording activity, and notifying stakeholders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Access Matrix */}
      <section id="roles" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider">Access Control</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Role-Based Permission Matrix</h2>
          </div>

          <div className="overflow-hidden bg-white border border-slate-200/90 rounded-3xl shadow-card">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                  <th className="p-4 sm:px-6">Feature / Capability</th>
                  <th className="p-4 text-emerald-700 font-extrabold">Admin</th>
                  <th className="p-4 text-teal-700 font-extrabold">Project Manager</th>
                  <th className="p-4 text-slate-700 font-extrabold">Developer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                <tr>
                  <td className="p-4 sm:px-6 font-semibold text-slate-900">Client & Global Project Management</td>
                  <td className="p-4 text-emerald-600 font-bold">Full Access</td>
                  <td className="p-4 text-slate-400">Restricted to Owned</td>
                  <td className="p-4 text-slate-400">View Assigned Only</td>
                </tr>
                <tr>
                  <td className="p-4 sm:px-6 font-semibold text-slate-900">Team Member Provisioning</td>
                  <td className="p-4 text-emerald-600 font-bold">Admin Only</td>
                  <td className="p-4 text-rose-500 font-semibold">No</td>
                  <td className="p-4 text-rose-500 font-semibold">No</td>
                </tr>
                <tr>
                  <td className="p-4 sm:px-6 font-semibold text-slate-900">Task Creation & Developer Assignment</td>
                  <td className="p-4 text-emerald-600 font-bold">Yes (All)</td>
                  <td className="p-4 text-teal-600 font-bold">Yes (Owned Projects)</td>
                  <td className="p-4 text-rose-500 font-semibold">No</td>
                </tr>
                <tr>
                  <td className="p-4 sm:px-6 font-semibold text-slate-900">Task Status Progression</td>
                  <td className="p-4 text-emerald-600 font-bold">Yes</td>
                  <td className="p-4 text-teal-600 font-bold">Yes</td>
                  <td className="p-4 text-emerald-600 font-bold">Yes (Assigned Only)</td>
                </tr>
                <tr>
                  <td className="p-4 sm:px-6 font-semibold text-slate-900">Live Activity Stream Scope</td>
                  <td className="p-4 text-emerald-600 font-bold">Global Agency Feed</td>
                  <td className="p-4 text-teal-600 font-bold">Managed Project Feed</td>
                  <td className="p-4 text-slate-700 font-bold">Assigned Tasks Only</td>
                </tr>
                <tr>
                  <td className="p-4 sm:px-6 font-semibold text-slate-900">Real-Time Online Presence Telemetry</td>
                  <td className="p-4 text-emerald-600 font-bold">Live Count</td>
                  <td className="p-4 text-slate-400">No</td>
                  <td className="p-4 text-slate-400">No</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 px-4 sm:px-8 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-emerald-600 flex items-center justify-center font-bold text-white text-[10px]">
            V
          </div>
          <span className="font-bold text-slate-800">VELOZITY GLOBAL SOLUTIONS</span>
          <span>© 2026. All rights reserved.</span>
        </div>

        <div className="flex items-center gap-4 font-semibold text-slate-600">
          <Link to="/about" className="hover:text-emerald-600">About</Link>
          <Link to="/login" className="hover:text-emerald-600">Sign In</Link>
        </div>
      </footer>
    </div>
  );
};
