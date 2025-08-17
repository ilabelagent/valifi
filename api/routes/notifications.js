import { Router } from 'express';
import { markAsRead, dismissNotification, markAllRead, clearAllRead } from '../controllers/notificationsController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/:id/read', protect, markAsRead);
router.delete('/:id', protect, dismissNotification);
router.post('/read-all', protect, markAllRead);
router.post('/clear-all', protect, clearAllRead);

export default router;
