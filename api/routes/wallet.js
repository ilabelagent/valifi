import { Router } from 'express';
import { sendFromWallet } from '../controllers/walletController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// In a real app, you'd have GET /assets, POST /create, POST /import etc.
router.post('/send', protect, sendFromWallet);

export default router;
