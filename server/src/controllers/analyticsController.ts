import { Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export class AnalyticsController {
  static async getOverview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const days = parseInt(req.query.days as string, 10) || 30;
      const analytics = await AnalyticsService.getOverview(req.user._id.toString(), days);

      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      next(error);
    }
  }

  static async getLinkAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const { id } = req.params;
      const days = parseInt(req.query.days as string, 10) || 30;

      const analytics = await AnalyticsService.getLinkAnalytics(
        req.user._id.toString(),
        id,
        days
      );

      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      next(error);
    }
  }
}
