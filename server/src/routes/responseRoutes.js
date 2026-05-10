import { Router } from 'express';
import { submitResponse, getAnalytics } from '../controllers/responseController.js';
import { optionalAuth, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { submitResponseSchema } from '../validations/response.js';

const router = Router();

// Submit a response — auth optional (anonymous responses allowed based on poll settings)
router.post('/:pollId', optionalAuth, validate(submitResponseSchema), submitResponse);

// Analytics — public users can access only if results are published; owners always
router.get('/analytics/:pollId', optionalAuth, getAnalytics);

export default router;
