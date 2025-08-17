import { Router } from 'express';
import { getUserProfile, updateUserSettings } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/me', protect, getUserProfile);
router.put('/me/settings', protect, updateUserSettings);

export default router;
