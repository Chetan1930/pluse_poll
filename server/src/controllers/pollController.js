import Poll from '../models/Poll.js';
import Response from '../models/Response.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { HTTP_STATUS } from '../config/constants.js';

export const createPoll = async (req, res, next) => {
  try {
    const { title, description, questions, allowAnonymousResponses, expiresAt, trackIp } = req.body;

    const poll = await Poll.create({
      title,
      description,
      questions,
      allowAnonymousResponses,
      expiresAt: expiresAt || null,
      trackIp: trackIp || false,
      createdBy: req.user._id,
    });

    return sendSuccess(res, HTTP_STATUS.CREATED, { poll }, 'Poll created successfully');
  } catch (error) {
    next(error);
  }
};

export const getMyPolls = async (req, res, next) => {
  try {
    const polls = await Poll.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, HTTP_STATUS.OK, { polls, count: polls.length });
  } catch (error) {
    next(error);
  }
};

/** Admin only — returns every poll across all users with creator details. */
export const getAllPollsAdmin = async (req, res, next) => {
  try {
    const polls = await Poll.find({})
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, HTTP_STATUS.OK, { polls, count: polls.length });
  } catch (error) {
    next(error);
  }
};

export const getPollById = async (req, res, next) => {
  try {
    const poll = await Poll.findById(req.params.id).populate('createdBy', 'name email');
    if (!poll) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'Poll not found');
    }

    // Non-owners get a stripped-down view
    const isOwner = req.user && poll.createdBy._id.toString() === req.user._id.toString();
    if (!isOwner) {
      // Expired polls can still be viewed but not submitted
      const pollData = poll.toObject();
      // Don't expose resultsPublished status to reduce info leakage
      return sendSuccess(res, HTTP_STATUS.OK, { poll: pollData, isOwner: false });
    }

    return sendSuccess(res, HTTP_STATUS.OK, { poll, isOwner: true });
  } catch (error) {
    next(error);
  }
};

export const updatePoll = async (req, res, next) => {
  try {
    const poll = await Poll.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!poll) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'Poll not found');
    }

    const allowedFields = ['title', 'description', 'questions', 'allowAnonymousResponses', 'expiresAt', 'trackIp'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        poll[field] = req.body[field];
      }
    });

    await poll.save();
    return sendSuccess(res, HTTP_STATUS.OK, { poll }, 'Poll updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deletePoll = async (req, res, next) => {
  try {
    const poll = await Poll.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!poll) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'Poll not found');
    }

    // Remove associated responses to keep DB clean
    await Response.deleteMany({ pollId: poll._id });

    return sendSuccess(res, HTTP_STATUS.OK, {}, 'Poll deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/polls/:id/publish
 * Toggles resultsPublished — once set to true, public users can view analytics.
 */
export const publishResults = async (req, res, next) => {
  try {
    const poll = await Poll.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!poll) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'Poll not found');
    }

    poll.resultsPublished = true;
    poll.isPublished = true;
    await poll.save();

    return sendSuccess(res, HTTP_STATUS.OK, { poll }, 'Poll results published');
  } catch (error) {
    next(error);
  }
};
