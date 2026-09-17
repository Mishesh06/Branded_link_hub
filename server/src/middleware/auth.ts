import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/tokens';
import { User, IUser } from '../models/User';
import { AppError } from './errorHandler';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    // Check httpOnly cookie first, fallback to Authorization header
    let token = req.cookies?.access_token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Authentication required. Please log in.', 401);
    }

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.userId);

    if (!user) {
      throw new AppError('User belonging to this token no longer exists.', 401);
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      next(new AppError('Access token has expired. Please refresh your session.', 401));
    } else if (error.name === 'JsonWebTokenError') {
      next(new AppError('Invalid token signature.', 401));
    } else {
      next(error);
    }
  }
};
