import { Response, NextFunction } from 'express';
import { LinkService } from '../services/linkService';
import { createLinkSchema, linkQuerySchema } from '../validators/linkValidator';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export class LinkController {
  static async createLink(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const validatedInput = createLinkSchema.parse(req.body);
      const link = await LinkService.createLink(req.user._id.toString(), validatedInput);

      res.status(201).json({
        success: true,
        message: 'Short link created successfully.',
        data: { link }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getLinks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const query = linkQuerySchema.parse(req.query);
      const result = await LinkService.getLinks(req.user._id.toString(), query);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getLinkById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const { id } = req.params;
      const link = await LinkService.getLinkById(req.user._id.toString(), id);

      res.status(200).json({
        success: true,
        data: { link }
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteLink(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      const { id } = req.params;
      await LinkService.deleteLink(req.user._id.toString(), id);

      res.status(200).json({
        success: true,
        message: 'Link successfully deleted.'
      });
    } catch (error) {
      next(error);
    }
  }
}
