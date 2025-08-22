
import { Router } from 'express';
import { checkDbConnection } from '../controllers/healthController.js';

const r = Router();

// General API health check
r.get('/', (_req, res) => res.json({ ok: true, ts: Date.now() }));

// Database health check
r.get('/db', checkDbConnection);

export default r;