import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';
import { Client, Project, User } from '../../types';
import { PlusCircle, AlertCircle, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated?: (project: Project) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState('');
  const [pmId, setPmId] = useState('');

  const [clients, setClients] = useState<Client[]>([]);
  const [pms, setPms] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      try {
        const clientRes = await api.get('/users/clients');
        setClients(clientRes.data.data.clients || []);
        if (clientRes.data.data.clients?.length > 0) {
          setClientId(clientRes.data.data.clients[0].id);
        }

        if (user?.role === 'ADMIN') {
          const pmRes = await api.get('/users?role=PROJECT_MANAGER');
          setPms(pmRes.data.data.users || []);
        }
      } catch (err: any) {
        console.error('Failed to load clients/PMs:', err);
      }
    };

    loadData();
  }, [isOpen, user]);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/users/clients', {
        name: newClientName,
        email: newClientEmail,
        company: newClientCompany,
      });
      const created = res.data.data.client;
      setClients((prev) => [...prev, created]);
      setClientId(created.id);
      setShowNewClientForm(false);
      setNewClientName('');
      setNewClientEmail('');
      setNewClientCompany('');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to create new client');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !clientId) {
      setErrorMsg('Title and Client are required');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.post('/projects', {
        title,
        description: description || undefined,
        clientId,
        pmId: user?.role === 'ADMIN' && pmId ? pmId : undefined,
      });

      if (onProjectCreated) onProjectCreated(res.data.data.project);
      setTitle('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project" maxWidth="lg">
      <div className="space-y-4">
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {showNewClientForm ? (
          <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-600" />
                Add New Client
              </span>
              <button
                type="button"
                onClick={() => setShowNewClientForm(false)}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium"
              >
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Contact Name"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 font-medium"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newClientEmail}
                onChange={(e) => setNewClientEmail(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 font-medium"
              />
              <input
                type="text"
                placeholder="Company Name"
                value={newClientCompany}
                onChange={(e) => setNewClientCompany(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 font-medium"
              />
            </div>
            <button
              type="button"
              onClick={handleCreateClient}
              className="w-full py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-bold shadow-xs transition-all"
            >
              Save Client
            </button>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Project Title</label>
            <input
              type="text"
              placeholder="e.g. Fintech Mobile Banking Portal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Description</label>
            <textarea
              placeholder="Scope, objectives, and deliverables..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">Client</label>
              {!showNewClientForm && (
                <button
                  type="button"
                  onClick={() => setShowNewClientForm(true)}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-bold"
                >
                  + Add New Client
                </button>
              )}
            </div>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
              required
            >
              <option value="">Select a Client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.company})
                </option>
              ))}
            </select>
          </div>

          {user?.role === 'ADMIN' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Assigned Project Manager</label>
              <select
                value={pmId}
                onChange={(e) => setPmId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
              >
                <option value="">Assign to Myself ({user.name})</option>
                {pms.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {pm.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
