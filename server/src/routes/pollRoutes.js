import { Router } from 'express';
import {
  createPoll,
  getMyPolls,
  getPollById,
  updatePoll,
  deletePoll,
  publishResults,
} from '../controllers/pollController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createPollSchema, updatePollSchema } from '../validations/poll.js';

const router = Router();

// Authenticated poll management
router.post('/', protect, validate(createPollSchema), createPoll);
router.get('/my', protect, getMyPolls);
router.put('/:id', protect, validate(updatePollSchema), updatePoll);
router.delete('/:id', protect, deletePoll);
router.patch('/:id/publish', protect, publishResults);

// Public single poll view (auth optional — owner gets extra fields)
router.get('/:id', optionalAuth, getPollById);

export default router;
