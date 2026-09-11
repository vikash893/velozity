import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { PMDashboard } from './pages/PMDashboard';
import { DeveloperDashboard } from './pages/DeveloperDashboard';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { TasksPage } from './pages/TasksPage';
import { ActivityPage } from './pages/ActivityPage';

const RoleBasedDashboard: React.FC = () => {
  const { user } = useAuth();

  if (user?.role === 'ADMIN') {
    return <AdminDashboard />;
  }
  if (user?.role === 'PROJECT_MANAGER') {
    return <PMDashboard />;
  }
  return <DeveloperDashboard />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            {/* Public Informational Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<Login />} />

            {/* Authenticated Application Workspace */}
            <Route path="/dashboard" element={<AppLayout />}>
              <Route index element={<RoleBasedDashboard />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="projects/:id" element={<ProjectDetailPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="activity" element={<ActivityPage />} />
            </Route>

            {/* Direct Redirects */}
            <Route path="/projects" element={<Navigate to="/dashboard/projects" replace />} />
            <Route path="/projects/:id" element={<Navigate to="/dashboard/projects" replace />} />
            <Route path="/tasks" element={<Navigate to="/dashboard/tasks" replace />} />
            <Route path="/activity" element={<Navigate to="/dashboard/activity" replace />} />
            <Route path="/signup" element={<Navigate to="/login" replace />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
