import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { config } from '../config/environment';
import { prisma } from '../config/prisma';

let io: SocketIOServer | null = null;

// Map of userId -> Set of active socketIds (for multi-tab / device presence tracking)
const userSocketMap = new Map<string, Set<string>>();
// Map of socketId -> TokenPayload (user session)
const socketUserMap = new Map<string, TokenPayload>();

export const initSocket = (httpServer: HttpServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    },
    transports: ['websocket', 'polling'],
  });

  // Socket Authentication Middleware
  io.use((socket: Socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1] ||
        (socket.handshake.headers.cookie
          ? socket.handshake.headers.cookie
              .split(';')
              .find((c) => c.trim().startsWith('accessToken='))
              ?.split('=')[1]
          : null);

      if (!token) {
        return next(new Error('Authentication error: Token required for WebSocket connection'));
      }

      const decoded = verifyAccessToken(token);
      (socket as any).user = decoded;
      next();
    } catch (err: any) {
      next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user: TokenPayload = (socket as any).user;
    if (!user) {
      socket.disconnect();
      return;
    }

    // Register user socket
    if (!userSocketMap.has(user.id)) {
      userSocketMap.set(user.id, new Set());
    }
    userSocketMap.get(user.id)!.add(socket.id);
    socketUserMap.set(socket.id, user);

    // Join user-specific private room
    socket.join(`user:${user.id}`);

    // Role-specific rooms
    if (user.role === 'ADMIN') {
      socket.join('admin:feed');
      socket.join('role:admin');
    } else if (user.role === 'PROJECT_MANAGER') {
      socket.join(`pm:${user.id}`);
      socket.join('role:pm');
    } else if (user.role === 'DEVELOPER') {
      socket.join(`dev:${user.id}`);
      socket.join('role:dev');
    }

    // Broadcast live presence count to admins
    broadcastPresenceCount();

    // Client can explicitly join/leave a project room when viewing a project board
    socket.on('join:project', async (projectId: string) => {
      try {
        if (!projectId) return;

        // Security check for PM/Dev
        if (user.role === 'PROJECT_MANAGER') {
          const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { pmId: true },
          });
          if (!project || project.pmId !== user.id) {
            socket.emit('error:unauthorized', { message: 'Cannot subscribe to other PM projects' });
            return;
          }
        }

        socket.join(`project:${projectId}`);
      } catch (err) {
        console.error('Error joining project room:', err);
      }
    });

    socket.on('leave:project', (projectId: string) => {
      if (projectId) {
        socket.leave(`project:${projectId}`);
      }
    });

    socket.on('disconnect', () => {
      const userSockets = userSocketMap.get(user.id);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          userSocketMap.delete(user.id);
        }
      }
      socketUserMap.delete(socket.id);
      broadcastPresenceCount();
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io has not been initialized yet.');
  }
  return io;
};

export const getOnlineUserCount = (): number => {
  return userSocketMap.size;
};

export const broadcastPresenceCount = (): void => {
  if (!io) return;
  const count = userSocketMap.size;
  io.to('role:admin').emit('presence:update', { onlineUsersCount: count });
};

/**
 * Broadcasts an activity event with strict role-filtering:
 * 1. Admin room (sees all)
 * 2. PM room (if PM owns the project)
 * 3. Developer room (if Developer is assigned to the task)
 * 4. Project room (for anyone actively viewing the project board)
 */
export const broadcastActivityEvent = (payload: {
  activity: any;
  projectId?: string | null;
  pmId?: string | null;
  assignedToId?: string | null;
}) => {
  if (!io) return;

  const { activity, projectId, pmId, assignedToId } = payload;

  // 1. Global Admin feed
  io.to('admin:feed').emit('activity:new', activity);

  // 2. PM's private feed
  if (pmId) {
    io.to(`pm:${pmId}`).emit('activity:new', activity);
  }

  // 3. Developer's private feed
  if (assignedToId) {
    io.to(`dev:${assignedToId}`).emit('activity:new', activity);
  }

  // 4. Project board room
  if (projectId) {
    io.to(`project:${projectId}`).emit('activity:new', activity);
  }
};

/**
 * Broadcasts a task update to project viewers and assigned dev
 */
export const broadcastTaskUpdate = (payload: {
  task: any;
  projectId: string;
  assignedToId?: string | null;
  pmId?: string | null;
}) => {
  if (!io) return;
  const { task, projectId, assignedToId, pmId } = payload;

  // Broadcast to project board
  io.to(`project:${projectId}`).emit('task:updated', task);
  // Broadcast to admin
  io.to('admin:feed').emit('task:updated', task);
  // Broadcast to PM
  if (pmId) {
    io.to(`pm:${pmId}`).emit('task:updated', task);
  }
  // Broadcast to Dev
  if (assignedToId) {
    io.to(`dev:${assignedToId}`).emit('task:updated', task);
  }
};

/**
 * Broadcasts notification to a specific user
 */
export const sendLiveNotification = (userId: string, notification: any, unreadCount: number) => {
  if (!io) return;
  io.to(`user:${userId}`).emit('notification:new', {
    notification,
    unreadCount,
  });
};
