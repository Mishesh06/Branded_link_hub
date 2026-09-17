import { Request, Response, NextFunction } from 'express';
import { BioService } from '../services/bioService';
import { updateBioSchema } from '../validators/bioValidator';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export class BioController {
  static async getMyProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const profile = await BioService.getProfileByUserId(req.user._id.toString());
      res.status(200).json({
        success: true,
        data: { profile }
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateMyProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const validatedInput = updateBioSchema.parse(req.body);
      const profile = await BioService.updateProfile(req.user._id.toString(), validatedInput);

      res.status(200).json({
        success: true,
        message: 'Bio profile updated successfully.',
        data: { profile }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPublicProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { username } = req.params;
      if (!username) {
        throw new AppError('Username is required.', 400);
      }

      const result = await BioService.getPublicProfile(username);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}
