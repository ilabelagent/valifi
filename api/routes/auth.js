
import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import { register, login, me, logout } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { limitLogin } from '../middleware/rateLimit.js';

const r = Router();

r.post('/register', asyncHandler(register));
r.post('/login', limitLogin, asyncHandler(login));
r.get('/me', protect, asyncHandler(me));
r.post('/logout', protect, asyncHandler(logout));

export default r;
