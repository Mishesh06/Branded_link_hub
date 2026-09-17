import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from '../validators/authValidator';
import {
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions
} from '../utils/tokens';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export class AuthController {
  static async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedInput = signupSchema.parse(req.body);
      const { user, accessToken, refreshToken, simulatedVerificationToken } =
        await AuthService.signup(validatedInput);

      res.cookie('access_token', accessToken, getAccessTokenCookieOptions());
      res.cookie('refresh_token', refreshToken, getRefreshTokenCookieOptions());

      res.status(201).json({
        success: true,
        message: 'Account created successfully. Please verify your email.',
        data: {
          user,
          accessToken, // Included for non-cookie API testing tools
          simulatedVerificationToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;
      if (!token) {
        throw new AppError('Verification token is required.', 400);
      }

      const user = await AuthService.verifyEmail(token);

      res.status(200).json({
        success: true,
        message: 'Email successfully verified!',
        data: {
          user: {
            id: user._id.toString(),
            email: user.email,
            isEmailVerified: user.isEmailVerified
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedInput = loginSchema.parse(req.body);
      const { user, accessToken, refreshToken } = await AuthService.login(validatedInput);

      res.cookie('access_token', accessToken, getAccessTokenCookieOptions());
      res.cookie('refresh_token', refreshToken, getRefreshTokenCookieOptions());

      res.status(200).json({
        success: true,
        message: 'Logged in successfully.',
        data: {
          user,
          accessToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const oldRefreshToken = req.cookies?.refresh_token || req.body?.refreshToken;
      if (!oldRefreshToken) {
        throw new AppError('Refresh token is required.', 401);
      }

      const { user, accessToken, refreshToken } = await AuthService.refresh(oldRefreshToken);

      res.cookie('access_token', accessToken, getAccessTokenCookieOptions());
      res.cookie('refresh_token', refreshToken, getRefreshTokenCookieOptions());

      res.status(200).json({
        success: true,
        message: 'Session refreshed successfully.',
        data: {
          user,
          accessToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refresh_token || req.body?.refreshToken;
      if (req.user) {
        await AuthService.logout(req.user._id.toString(), refreshToken);
      }

      res.clearCookie('access_token', { path: '/' });
      res.clearCookie('refresh_token', { path: '/' });

      res.status(200).json({
        success: true,
        message: 'Logged out successfully.'
      });
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      const result = await AuthService.forgotPassword(email);

      res.status(200).json({
        success: true,
        message: 'If an account exists with that email, a password reset link has been simulated.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedInput = resetPasswordSchema.parse(req.body);
      await AuthService.resetPassword(validatedInput);

      res.clearCookie('access_token', { path: '/' });
      res.clearCookie('refresh_token', { path: '/' });

      res.status(200).json({
        success: true,
        message: 'Password reset successful. Please log in with your new password.'
      });
    } catch (error) {
      next(error);
    }
  }

  static async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: req.user._id.toString(),
            email: req.user.email,
            name: req.user.name,
            isEmailVerified: req.user.isEmailVerified,
            createdAt: req.user.createdAt
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
