import { Router } from 'express';
import { getCardDetails, applyForCard, freezeCard } from '../controllers/cardsController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/details', protect, getCardDetails);
router.post('/apply', protect, applyForCard);
router.post('/freeze', protect, freezeCard);

export default router;
