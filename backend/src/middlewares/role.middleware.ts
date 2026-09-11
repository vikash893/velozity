import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { sendError } from '../utils/response';

export const requireRole = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required to access this resource.', 401, 'UNAUTHENTICATED');
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(
        res,
        `Access forbidden: requires one of the following roles: [${allowedRoles.join(', ')}]`,
        403,
        'FORBIDDEN_ROLE'
      );
      return;
    }

    next();
  };
};
