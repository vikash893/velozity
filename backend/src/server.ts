import http from 'http';
import { createApp } from './app';
import { config } from './config/environment';
import { initSocket } from './services/socket.service';
import { initCronJobs } from './services/cron.service';
import { prisma } from './config/prisma';

const app = createApp();
const server = http.createServer(app);

// Initialize Socket.io WebSockets
const io = initSocket(server);

// Initialize Background Scheduled Jobs
initCronJobs();

const PORT = config.PORT;

const startServer = async () => {
  try {
    // Verify database connection on startup
    await prisma.$connect();
    console.log('🗄️  Database connected successfully via Prisma');

    server.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`🚀 Velozity Dashboard Server is running`);
      console.log(`📡 HTTP Server: http://localhost:${PORT}`);
      console.log(`⚡ WebSocket Server: ws://localhost:${PORT}`);
      console.log(`🛠️  Environment: ${config.NODE_ENV}`);
      console.log(`=========================================`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to database on startup:', error);
    process.exit(1);
  }
};

startServer();

export { app, server, io };
