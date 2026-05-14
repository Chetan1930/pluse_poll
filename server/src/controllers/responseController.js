import mongoose from 'mongoose';
import Poll from '../models/Poll.js';
import Response from '../models/Response.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { HTTP_STATUS } from '../config/constants.js';
import { buildAnalytics } from '../services/analyticsService.js';
import { getIO } from '../socket/index.js';

export const submitResponse = async (req, res, next) => {
  try {
    const poll = await Poll.findById(req.params.pollId);
    if (!poll) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'Poll not found');
    }

    // Reject expired polls
    if (poll.isExpired()) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'This poll has expired and is no longer accepting responses');
    }

    // Anonymous check
    if (!poll.allowAnonymousResponses && !req.user) {
      return sendError(res, HTTP_STATUS.UNAUTHORIZED, 'This poll requires authentication to respond');
    }

    const { answers } = req.body;

    // Validate: no duplicate question answers
    const questionIds = answers.map((a) => a.questionId);
    const uniqueQuestionIds = new Set(questionIds);
    if (uniqueQuestionIds.size !== questionIds.length) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Duplicate answers for the same question');
    }

    // Build a lookup of valid options per question
    const questionMap = {};
    poll.questions.forEach((q) => {
      questionMap[q._id.toString()] = new Set(q.options.map((o) => o._id.toString()));
    });

    // Validate required questions are answered
    for (const question of poll.questions) {
      if (question.required) {
        const answered = answers.find(
          (a) => a.questionId.toString() === question._id.toString()
        );
        if (!answered) {
          return sendError(
            res,
            HTTP_STATUS.UNPROCESSABLE,
            `Required question "${question.text}" must be answered`
          );
        }
      }
    }

    // Validate each answer points to a real question + option
    for (const answer of answers) {
      const validOptions = questionMap[answer.questionId.toString()];
      if (!validOptions) {
        return sendError(res, HTTP_STATUS.BAD_REQUEST, `Question ${answer.questionId} does not belong to this poll`);
      }
      if (!validOptions.has(answer.selectedOption.toString())) {
        return sendError(res, HTTP_STATUS.BAD_REQUEST, `Option ${answer.selectedOption} is not valid for question ${answer.questionId}`);
      }
    }

    // Only capture IP address if the poll has IP tracking enabled and user is anonymous
    const capturedIp =
      poll.trackIp && !req.user
        ? req.ip || req.socket?.remoteAddress || null
        : null;

    const responseDoc = await Response.create({
      pollId: poll._id,
      userId: req.user?._id || null,
      ipAddress: capturedIp,
      answers: answers.map((a) => ({
        questionId: new mongoose.Types.ObjectId(a.questionId),
        selectedOption: new mongoose.Types.ObjectId(a.selectedOption),
      })),
    });

    // Emit realtime update to all clients watching this poll
    const io = getIO();
    if (io) {
      const analytics = await buildAnalytics(poll);
      io.to(`poll:${poll._id}`).emit('poll_updated', {
        pollId: poll._id,
        totalResponses: analytics.totalResponses,
        analytics,
      });
    }

    return sendSuccess(res, HTTP_STATUS.CREATED, { response: responseDoc }, 'Response submitted successfully');
  } catch (error) {
    // Duplicate key = user already responded
    if (error.code === 11000) {
      return sendError(res, HTTP_STATUS.CONFLICT, 'You have already submitted a response to this poll');
    }
    next(error);
  }
};

export const getAnalytics = async (req, res, next) => {
  try {
    const poll = await Poll.findById(req.params.pollId);
    if (!poll) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'Poll not found');
    }

    const isOwner = req.user && poll.createdBy.toString() === req.user._id.toString();

    // Public users can only see analytics if results are published
    if (!isOwner && !poll.resultsPublished) {
      return sendError(res, HTTP_STATUS.FORBIDDEN, 'Results have not been published yet');
    }

    // Only include individual respondent data for the owner of a non-anonymous poll
    const includeRespondents = isOwner && !poll.allowAnonymousResponses;
    // Include IP addresses for the owner when IP tracking is enabled
    const includeIpAddresses = isOwner && poll.trackIp;

    const analytics = await buildAnalytics(poll, { includeRespondents, includeIpAddresses });
    return sendSuccess(res, HTTP_STATUS.OK, { analytics, isOwner });
  } catch (error) {
    next(error);
  }
};
