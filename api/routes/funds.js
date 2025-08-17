import { Router } from 'express';
import { internalTransfer } from '../controllers/fundsController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/internal-transfer', protect, internalTransfer);

export default router;
