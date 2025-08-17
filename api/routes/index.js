import { Router } from 'express';
import dashboardRoutes from './dashboard.js';
import authRoutes from './auth.js';
import usersRoutes from './users.js';
import investmentRoutes from './investments.js';
import fundsRoutes from './funds.js';
import walletRoutes from './wallet.js';
import cardsRoutes from './cards.js';
import bankingRoutes from './banking.js';
import loansRoutes from './loans.js';
import kycRoutes from './kyc.js';
import notificationsRoutes from './notifications.js';
import p2pRoutes from './p2p.js';
import aiRoutes from './ai.js';

const router = Router();

router.use('/dashboard', dashboardRoutes);
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/investments', investmentRoutes);
router.use('/funds', fundsRoutes);
router.use('/wallet', walletRoutes);
router.use('/cards', cardsRoutes);
router.use('/banking', bankingRoutes);
router.use('/loans', loansRoutes);
router.use('/kyc', kycRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/p2p', p2pRoutes);
router.use('/ai', aiRoutes);

export default router;
