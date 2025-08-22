
import { Router } from 'express';
import { loginWithRateLimit, register, forgotPassword, socialLogin } from '../controllers/authController.js';

const router = Router();

router.post('/login', loginWithRateLimit);
router.post('/register', register);
router.post('/social-login', socialLogin);
router.post('/forgot-password', forgotPassword);

export default router;