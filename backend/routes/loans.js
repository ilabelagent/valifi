import { Router } from 'express';
import { getLoans, applyForLoan, repayLoan } from '../controllers/loansController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, getLoans);
router.post('/apply', protect, applyForLoan);
router.post('/:id/repay', protect, repayLoan);

export default router;
