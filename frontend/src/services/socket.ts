import { io, Socket } from 'socket.io-client';
import { getAccessToken } from './api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const getSocket = (): Socket | null => {
  return socket;
};

export const connectSocket = (): Socket => {
  const token = getAccessToken();

  if (socket && socket.connected) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('⚡ Connected to Velozity WebSocket server with ID:', socket?.id);
  });

  socket.on('connect_error', (err) => {
    console.warn('⚠️ WebSocket connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Disconnected from WebSocket server:', reason);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinProjectRoom = (projectId: string) => {
  if (socket && socket.connected && projectId) {
    socket.emit('join:project', projectId);
  }
};

export const leaveProjectRoom = (projectId: string) => {
  if (socket && socket.connected && projectId) {
    socket.emit('leave:project', projectId);
  }
};
