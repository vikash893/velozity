import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log server-side only for diagnostics, never leak raw stack traces to the response
  console.error('[Unhandled Server Error]:', {
    message: err.message,
    name: err.name,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
  });

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'An unexpected internal server error occurred.';
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';

  sendError(res, message, statusCode, errorCode);
};
