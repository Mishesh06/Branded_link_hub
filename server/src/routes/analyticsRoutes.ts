import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/overview', AnalyticsController.getOverview);
router.get('/link/:id', AnalyticsController.getLinkAnalytics);

export default router;
