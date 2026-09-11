import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Briefcase, Code, Lock, Mail, AlertCircle, ArrowRight, Sparkles, ArrowLeft } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    const loginEmail = customEmail || email;
    const loginPassword = customPass || password;

    if (!loginEmail || !loginPassword) {
      setError('Please provide email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(loginEmail, loginPassword);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillAndLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    handleLogin(undefined, demoEmail, demoPass);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/30 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-emerald-500 selection:text-white">
      {/* Soft background ambient blurs */}
      <div className="absolute top-1/6 left-1/4 -translate-x-1/2 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-200/25 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 space-y-2">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors mb-2">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </Link>
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 font-black text-white text-2xl shadow-lg shadow-emerald-600/25 mx-auto mb-2">
          V
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Sign In to Velozity
        </h2>
        <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase">
          Client Project & Real-Time Engineering Engine
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4 z-10">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-7 sm:p-9 shadow-elevated space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2.5 font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@velozity.com"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-600/25 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Demo Accounts */}
          <div className="pt-5 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                1-Click Role Logins
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Admin */}
              <button
                type="button"
                onClick={() => fillAndLogin('admin@velozity.com', 'Admin@123')}
                className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 hover:bg-emerald-100/70 text-left transition-all group shadow-2xs cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-extrabold text-emerald-800">
                    Admin
                  </span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-xs text-slate-800 font-bold truncate">Victoria Vance</p>
                <p className="text-[11px] text-slate-500 truncate">admin@velozity.com</p>
              </button>

              {/* PM */}
              <button
                type="button"
                onClick={() => fillAndLogin('pm1@velozity.com', 'Password@123')}
                className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200/80 hover:bg-teal-100/70 text-left transition-all group shadow-2xs cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-extrabold text-teal-800">
                    Project Manager
                  </span>
                  <Briefcase className="w-4 h-4 text-teal-600" />
                </div>
                <p className="text-xs text-slate-800 font-bold truncate">Sarah Connor</p>
                <p className="text-[11px] text-slate-500 truncate">pm1@velozity.com</p>
              </button>

              {/* Developer */}
              <button
                type="button"
                onClick={() => fillAndLogin('dev1@velozity.com', 'Password@123')}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 text-left transition-all group shadow-2xs cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-extrabold text-slate-700">
                    Developer
                  </span>
                  <Code className="w-4 h-4 text-slate-600" />
                </div>
                <p className="text-xs text-slate-800 font-bold truncate">Ravi Kumar</p>
                <p className="text-[11px] text-slate-500 truncate">dev1@velozity.com</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
