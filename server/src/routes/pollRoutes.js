import { Router } from 'express';
import {
  createPoll,
  getMyPolls,
  getAllPollsAdmin,
  getPollById,
  updatePoll,
  deletePoll,
  publishResults,
} from '../controllers/pollController.js';
import { protect, optionalAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createPollSchema, updatePollSchema } from '../validations/poll.js';

const router = Router();

// Admin-only: view all polls across all users
router.get('/admin', protect, requireRole('admin'), getAllPollsAdmin);

// Authenticated poll management
router.post('/', protect, validate(createPollSchema), createPoll);
router.get('/my', protect, getMyPolls);
router.put('/:id', protect, validate(updatePollSchema), updatePoll);
router.delete('/:id', protect, deletePoll);
router.patch('/:id/publish', protect, publishResults);

// Public single poll view (auth optional — owner gets extra fields)
router.get('/:id', optionalAuth, getPollById);

export default router;
