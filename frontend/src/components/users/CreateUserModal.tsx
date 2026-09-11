import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';
import { Role, User } from '../../types';
import { UserPlus, AlertCircle, ShieldCheck, Briefcase, Code } from 'lucide-react';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated?: (user: User) => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onUserCreated,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('DEVELOPER');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg('Name, email, and password are required.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.post('/users', {
        name,
        email,
        password,
        role,
      });

      if (onUserCreated) onUserCreated(res.data.data.user);
      setName('');
      setEmail('');
      setPassword('');
      setRole('DEVELOPER');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Provision New Team Member" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
          <input
            type="text"
            placeholder="e.g. Maya Lin"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Work Email Address</label>
          <input
            type="email"
            placeholder="maya@velozity.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Initial Password</label>
          <input
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Assigned Role</label>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setRole('DEVELOPER')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                role === 'DEVELOPER'
                  ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20 text-emerald-900'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Code className="w-4 h-4 mb-1 text-emerald-600" />
              <p className="text-xs font-extrabold">Developer</p>
              <p className="text-[10px] text-slate-500 font-medium">Assigned Tasks</p>
            </button>

            <button
              type="button"
              onClick={() => setRole('PROJECT_MANAGER')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                role === 'PROJECT_MANAGER'
                  ? 'bg-teal-50 border-teal-300 ring-2 ring-teal-500/20 text-teal-900'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Briefcase className="w-4 h-4 mb-1 text-teal-600" />
              <p className="text-xs font-extrabold">PM</p>
              <p className="text-[10px] text-slate-500 font-medium">Projects & Team</p>
            </button>

            <button
              type="button"
              onClick={() => setRole('ADMIN')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                role === 'ADMIN'
                  ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500/20 text-purple-900'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4 mb-1 text-purple-600" />
              <p className="text-xs font-extrabold">Admin</p>
              <p className="text-[10px] text-slate-500 font-medium">Full Access</p>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Provisioning...' : 'Provision User'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
