import { Router } from 'express';
import { LinkController } from '../controllers/linkController';
import { requireAuth } from '../middleware/auth';
import { linkCreateLimiter } from '../middleware/rateLimiter';

const router = Router();

// All link routes require authentication
router.use(requireAuth);

router.get('/', LinkController.getLinks);
router.post('/', linkCreateLimiter, LinkController.createLink);
router.get('/:id', LinkController.getLinkById);
router.delete('/:id', LinkController.deleteLink);

export default router;
