import { Router } from 'express';
import { submitKyc } from '../controllers/kycController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// A GET /status endpoint could also be added.
router.post('/submit', protect, submitKyc);

export default router;
