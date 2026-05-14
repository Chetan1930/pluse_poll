import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { submitResponse, getAnalytics } from '../controllers/responseController.js';
import { optionalAuth, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { submitResponseSchema } from '../validations/response.js';

const router = Router();

// Rate limiter for response submissions — prevent spam
const responseLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RESPONSE_RATE_LIMIT_MAX) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many submissions, please try again later' },
  // Skip rate limiting for authenticated users (owners testing their polls)
  skip: (req) => !!req.user,
});

// Submit a response — auth optional (anonymous responses allowed based on poll settings)
router.post('/:pollId', optionalAuth, responseLimiter, validate(submitResponseSchema), submitResponse);

// Analytics — public users can access only if results are published; owners always
router.get('/analytics/:pollId', optionalAuth, getAnalytics);

export default router;
