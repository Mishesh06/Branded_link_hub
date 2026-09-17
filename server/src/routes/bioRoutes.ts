import { Router } from 'express';
import { BioController } from '../controllers/bioController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Public route to view bio profile
router.get('/public/:username', BioController.getPublicProfile);

// Authenticated builder routes
router.get('/me', requireAuth, BioController.getMyProfile);
router.put('/me', requireAuth, BioController.updateMyProfile);

export default router;
