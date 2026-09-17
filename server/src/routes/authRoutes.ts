import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public auth routes with rate limiting
router.post('/signup', authLimiter, AuthController.signup);
router.get('/verify-email/:token', AuthController.verifyEmail);
router.post('/login', authLimiter, AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/forgot-password', authLimiter, AuthController.forgotPassword);
router.post('/reset-password', authLimiter, AuthController.resetPassword);

// Protected auth routes
router.post('/logout', requireAuth, AuthController.logout);
router.get('/me', requireAuth, AuthController.me);

export default router;
