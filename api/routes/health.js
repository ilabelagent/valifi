
import { Router } from 'express';
import { checkDbConnection } from '../controllers/healthController.js';

const router = Router();

// This is a public endpoint, no auth needed.
router.get('/db', checkDbConnection);

export default router;
