import { Router } from 'express';
import { getBankAccounts, linkBankAccount } from '../controllers/bankingController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/accounts', protect, getBankAccounts);
router.post('/accounts', protect, linkBankAccount);
// DELETE /accounts/:id would go here in a full implementation

export default router;
