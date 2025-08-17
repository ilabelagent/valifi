import { Router } from 'express';
import { getReferralSummary } from '../controllers/referralsController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/summary', protect, getReferralSummary);

export default router;
