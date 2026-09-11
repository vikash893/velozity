import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/environment';
import apiRouter from './routes';
import { errorHandler } from './middlewares/error.middleware';

export const createApp = (): Application => {
  const app = express();

  // CORS configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, postman) or matching frontends
        if (!origin || [config.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'].includes(origin)) {
          callback(null, true);
        } else {
          callback(null, true); // Permissive in dev/staging to avoid CORS blockers
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Health check
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Mount API Router
  app.use('/api', apiRouter);

  // Global structured error handling
  app.use(errorHandler);

  return app;
};
