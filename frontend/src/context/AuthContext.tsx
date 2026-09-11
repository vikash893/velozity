import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, setAccessToken } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';
import { User, Role } from '../types';

interface AuthContextType {
  user: User | null;
  role: Role | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data?.data?.user) {
        setUser(res.data.data.user);
        connectSocket();
      }
    } catch (err) {
      try {
        const refreshRes = await api.post('/auth/refresh');
        if (refreshRes.data?.data?.user) {
          setUser(refreshRes.data.data.user);
          setAccessToken(refreshRes.data.data.accessToken);
          connectSocket();
        } else {
          setUser(null);
          setAccessToken(null);
          disconnectSocket();
        }
      } catch (refreshErr) {
        setUser(null);
        setAccessToken(null);
        disconnectSocket();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();

    const handleUnauthorized = () => {
      setUser(null);
      setAccessToken(null);
      disconnectSocket();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: userData, accessToken } = res.data.data;
    setAccessToken(accessToken);
    setUser(userData);
    connectSocket();
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setAccessToken(null);
      setUser(null);
      disconnectSocket();
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
