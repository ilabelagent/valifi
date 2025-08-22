
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { create } from '../lib/errors.js';

const limiter = new RateLimiterMemory({
  points: 5,      // attempts
  duration: 60,   // per minute
  blockDuration: 60,
});

export function limitLogin(req, _res, next) {
  const key = `${req.ip}:${(req.body?.email || '').toLowerCase()}`;
  limiter.consume(key).then(() => next()).catch(() => {
    throw create.tooMany('RATE_LIMITED', 'Too many attempts. Try again in a minute.');
  });
}
