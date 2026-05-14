import Response from '../models/Response.js';

/**
 * Builds comprehensive analytics for a given poll.
 * Returns data structured for frontend chart consumption.
 *
 * @param {import('../models/Poll.js').default} poll  - Populated poll document
 * @param {object} [options]
 * @param {boolean} [options.includeRespondents=false]  - Include individual respondent details (owner-only)
 * @returns {Promise<object>}
 */
export const buildAnalytics = async (poll, options = {}) => {
  const { includeRespondents = false, includeIpAddresses = false } = options;

  // Fetch responses — populate user data when including respondents
  let responsesQuery = Response.find({ pollId: poll._id });
  if (includeRespondents) {
    responsesQuery = responsesQuery.populate('userId', 'name email');
  }
  const responses = await responsesQuery.lean();

  // Build a lookup of option text by ID (from the poll's questions)
  const optionTextMap = {};
  poll.questions.forEach((q) => {
    q.options.forEach((o) => {
      optionTextMap[o._id.toString()] = o.text;
    });
  });

  const totalResponses = responses.length;

  const questionSummaries = poll.questions.map((question) => {
    // Tally votes per option for this question
    const optionCounts = {};
    question.options.forEach((opt) => {
      optionCounts[opt._id.toString()] = 0;
    });

    // Collect individual respondent info
    const respondents = [];

    responses.forEach((response) => {
      const answer = response.answers.find(
        (a) => a.questionId.toString() === question._id.toString()
      );
      if (answer) {
        const key = answer.selectedOption.toString();
        if (key in optionCounts) {
          optionCounts[key] += 1;
        }

        // Capture respondent info if requested and user exists
        if (includeRespondents && response.userId) {
          const respondent = {
            userId: response.userId._id || response.userId,
            name: response.userId.name || 'Unknown',
            email: response.userId.email || '',
            selectedOptionId: key,
            selectedOptionText: optionTextMap[key] || 'Unknown',
          };
          // Include IP address for owner-only view when IP tracking is enabled
          if (includeIpAddresses && response.ipAddress) {
            respondent.ipAddress = response.ipAddress;
          }
          respondents.push(respondent);
        }

        // For anonymous polls with IP tracking, still capture IP info for the owner
        if (includeIpAddresses && !response.userId && response.ipAddress) {
          const existing = respondents.find(
            (r) => r.ipAddress === response.ipAddress && r.selectedOptionId === key
          );
          if (!existing) {
            respondents.push({
              userId: null,
              name: 'Anonymous',
              email: '',
              selectedOptionId: key,
              selectedOptionText: optionTextMap[key] || 'Unknown',
              ipAddress: response.ipAddress,
            });
          }
        }
      }
    });

    const answeredCount = Object.values(optionCounts).reduce((sum, c) => sum + c, 0);

    const options = question.options.map((opt) => {
      const votes = optionCounts[opt._id.toString()] || 0;
      const percentage = answeredCount > 0 ? Math.round((votes / answeredCount) * 100) : 0;
      return {
        optionId: opt._id,
        text: opt.text,
        votes,
        percentage,
      };
    });

    // Option with the highest vote count
    const mostSelected = options.reduce(
      (best, opt) => (opt.votes > best.votes ? opt : best),
      options[0]
    );

    return {
      questionId: question._id,
      text: question.text,
      required: question.required,
      totalAnswered: answeredCount,
      options,
      mostSelected: mostSelected || null,
      ...((includeRespondents || includeIpAddresses) && { respondents }),
    };
  });

  // Participation rate — respondents who answered every non-optional question
  const requiredQuestionIds = poll.questions
    .filter((q) => q.required)
    .map((q) => q._id.toString());

  let fullParticipants = 0;
  if (requiredQuestionIds.length > 0) {
    fullParticipants = responses.filter((r) => {
      const answeredIds = r.answers.map((a) => a.questionId.toString());
      return requiredQuestionIds.every((id) => answeredIds.includes(id));
    }).length;
  } else {
    fullParticipants = totalResponses;
  }

  const participationRate =
    totalResponses > 0 ? Math.round((fullParticipants / totalResponses) * 100) : 0;

  const timelineCounts = responses.reduce((counts, response) => {
    const submittedAt = response.submittedAt || response.createdAt || new Date();
    const key = new Date(submittedAt).toISOString().slice(0, 10);
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});

  const responseTimeline = Object.entries(timelineCounts)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, count]) => ({ date, count }));

  return {
    pollId: poll._id,
    pollTitle: poll.title,
    totalResponses,
    fullParticipants,
    participationRate,
    responseTimeline,
    questionSummaries,
    generatedAt: new Date().toISOString(),
  };
};
