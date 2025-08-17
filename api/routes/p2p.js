import { Router } from 'express';
import { 
    getOffers, 
    getMyOrders, 
    createOrder,
    updateOrderStatus,
    postChatMessage,
    getPaymentMethods
} from '../controllers/p2pController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/offers', protect, getOffers);
router.get('/my-orders', protect, getMyOrders);
router.get('/payment-methods', protect, getPaymentMethods);
router.post('/orders', protect, createOrder);
router.put('/orders/:id/status', protect, updateOrderStatus);
router.post('/orders/:id/chat', protect, postChatMessage);

// In a real app, you'd have routes for creating offers, managing payment methods, etc.
// POST /offers
// POST /payment-methods

export default router;