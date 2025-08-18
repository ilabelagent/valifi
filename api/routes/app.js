import { Router } from 'express';
import { getAppData } from '../controllers/appController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, getAppData);

export default router;
