import { Router } from 'express';
import { callCoPilot, callTaxAdvisor } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/copilot', protect, callCoPilot);
router.post('/tax-advisor', protect, callTaxAdvisor);

export default router;
