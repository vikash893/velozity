import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code?: string;
    details?: any;
  };
}

export const sendSuccess = <T>(res: Response, data: T, message?: string, statusCode = 200): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  errorCode?: string,
  details?: any
): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: {
      code: errorCode || 'SERVER_ERROR',
      details,
    },
  });
};
